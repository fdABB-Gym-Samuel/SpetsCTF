import type { PageServerLoad } from './$types';
import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import { type Insertable, sql } from 'kysely';
import type { CtfSubmissions } from '$lib/generated/db';
import { get_flag_of_ctf_challenge } from '$lib/db/functions';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ params, parent, locals, depends }) => {
    const { translations, ctfData, isOrg, team } = await parent();

    const ctfId = Number(params.ctfId);

    if (!ctfData) {
        error(404, 'CTF not found');
    }

    const user = locals.user;
    const challengeData = await db
        .selectFrom('ctf_challenges')
        .innerJoin('flag', 'ctf_challenges.flag', 'flag.id')
        .innerJoin('users', 'ctf_challenges.author', 'users.id')
        .leftJoin('ctf_events', 'ctf_challenges.ctf', 'ctf_events.id')
        .where('ctf_challenges.ctf', '=', ctfId)
        .where('challenge_id', '=', params.challengeId)
        .select([
            'ctf_challenges.anonymous_author',
            'ctf_challenges.approved',
            'ctf_challenges.challenge_category',
            'ctf_challenges.challenge_id',
            'ctf_challenges.challenge_sub_categories',
            'ctf_challenges.created_at',
            'ctf_challenges.ctf',
            'ctf_challenges.description',
            'ctf_challenges.display_name',
            'ctf_challenges.flag',
            'ctf_challenges.migrate_to_wargames',
            sql<number>`
                CASE 
                  WHEN (
                    SELECT COUNT(DISTINCT ctm.team)
                    FROM ctf_submissions cs
                    INNER JOIN ctf_teams_members ctm ON cs.team_id = ctm.team
                    INNER JOIN ctf_teams ct ON ctm.team = ct.id
                    WHERE cs.challenge = ctf_challenges.challenge_id
                      AND cs.success = true
                      AND ct.ctf = ${ctfId}
                      AND ctm.team != COALESCE((
                        SELECT ctm_author.team 
                        FROM ctf_teams_members ctm_author
                        INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                        WHERE ctm_author.user_id = ctf_challenges.author
                          AND ct_author.ctf = ${ctfId}
                        LIMIT 1
                      ), -1)
                  ) = 0 
                  THEN 500
                  ELSE GREATEST(
                    CEIL(
                      (((100.0 - 500.0) / POWER(15.0, 2)) * 
                      POWER((
                        SELECT COUNT(DISTINCT ctm.team)
                        FROM ctf_submissions cs
                        INNER JOIN ctf_teams_members ctm ON cs.team_id = ctm.team
                        INNER JOIN ctf_teams ct ON ctm.team = ct.id
                        WHERE cs.challenge = ctf_challenges.challenge_id
                          AND cs.success = true
                          AND ct.ctf = ${ctfId}
                          AND ctm.team != COALESCE((
                            SELECT ctm_author.team 
                            FROM ctf_teams_members ctm_author
                            INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                            WHERE ctm_author.user_id = ctf_challenges.author
                              AND ct_author.ctf = ${ctfId}
                            LIMIT 1
                          ), -1)
                      ), 2)) + 501
                    ),
                    100
                  )
                END`.as('points'),
        ])
        .select('flag.flag_format')
        .select([
            'ctf_challenges.author as author_id',
            sql<string>`
                CASE 
                    WHEN ctf_challenges.anonymous_author = true THEN '' 
                    ELSE COALESCE(users.display_name, '') 
                END
            `.as('author'),
        ])
        .select(() =>
            sql<boolean>`
                EXISTS(
                  SELECT 1 
                  FROM ctf_submissions cs
                  WHERE cs.challenge = ctf_challenges.challenge_id
                    AND cs.success = true
                    AND cs.team_id = ${team?.teamId ?? null}
                )`.as('solved')
        )
        .executeTakeFirst();

    if (!challengeData) {
        error(404, 'Challenge not found');
    }

    if (
        !challengeData.approved &&
        !isOrg &&
        user &&
        user.id !== challengeData.author_id
    ) {
        error(404, 'Challenge not found');
    }

    if (
        new Date(ctfData.start_time) > new Date() &&
        !isOrg &&
        user?.id !== challengeData.author_id
    ) {
        error(404, 'Challenge not found');
    }

    // Get the author's team to exclude from first solvers and solver count
    // Must be done BEFORE we replace author_id for anonymous authors
    const authorTeam = await db
        .selectFrom('ctf_teams_members as ctm')
        .innerJoin('ctf_teams as ct', 'ctm.team', 'ct.id')
        .where('ctm.user_id', '=', challengeData.author_id)
        .where('ct.ctf', '=', ctfId)
        .select('ctm.team')
        .executeTakeFirst();

    if (challengeData.anonymous_author || challengeData.author === '') {
        challengeData.author_id = '00000000-0000-0000-0000-000000000000';
    }

    const firstSolversQuery = db
        .with('first_solve_per_team', (qb) =>
            qb
                .selectFrom('ctf_submissions')
                .innerJoin(
                    'ctf_teams_members as ctm',
                    'ctf_submissions.team_id',
                    'ctm.team'
                )
                .innerJoin('ctf_teams as ct', 'ctm.team', 'ct.id')
                .innerJoin('users', 'ctm.user_id', 'users.id')
                .where('challenge', '=', challengeData.challenge_id)
                .where('success', '=', true)
                .where('ct.ctf', '=', ctfId)
                .where('users.is_admin', '!=', true)
                .$if(!!authorTeam, (qb) => qb.where('ctm.team', '!=', authorTeam!.team))
                .select(['ctm.team as team_id'])
                .select(sql`MIN(ctf_submissions.time)`.as('first_time'))
                .groupBy('ctm.team')
        )
        .selectFrom('first_solve_per_team')
        .innerJoin('ctf_teams', 'ctf_teams.id', 'first_solve_per_team.team_id')
        .orderBy('first_solve_per_team.first_time', 'asc')
        .select([
            'ctf_teams.name as display_name',
            sql<string>`ctf_teams.id::text`.as('id'),
        ])
        .limit(5);

    const firstSolvers = await firstSolversQuery.execute();

    const numSolversQuery = db
        .selectFrom('ctf_submissions as cs')
        .innerJoin('ctf_teams_members as ctm', 'cs.team_id', 'ctm.team')
        .innerJoin('ctf_teams as ct', 'ctm.team', 'ct.id')
        .where('cs.success', '=', true)
        .where('cs.challenge', '=', challengeData.challenge_id)
        .where('ct.ctf', '=', ctfId)
        .$if(!!authorTeam, (qb) => qb.where('ctm.team', '!=', authorTeam!.team));

    const numSolvers = await numSolversQuery
        .select((eb) => eb.fn.count('ctm.team').distinct().as('count'))
        .executeTakeFirst();

    const resources = await db
        .selectFrom('ctf_challenge_resources')
        .where('challenge', '=', challengeData.challenge_id)
        .selectAll()
        .execute();

    depends(`data:challenge-${challengeData.challenge_id}`);

    return {
        challengeData,
        firstSolvers,
        numSolvers,
        resources,
        translations,
        team,
    };
};

export const actions = {
    submit: async ({ request, locals, params, parent }) => {
        const user = locals.user;

        if (!user) {
            return redirect(303, '/login');
        }

        const ctfId = Number(params.ctfId);
        const challengeId = params.challengeId;

        const { ctfData, team } = await parent();

        if (!ctfData) {
            return fail(404, { message: 'CTF not found' });
        }

        const currentTime = new Date();

        if (ctfData.start_time > currentTime) {
            return fail(403, { message: 'CTF has not started yet' });
        }

        if (ctfData.end_time < currentTime) {
            return redirect(303, `/challenges/${challengeId}`);
        }

        if (!team) {
            return fail(403, { message: 'User is not part of any team in this CTF' });
        }

        if (!challengeId) {
            return fail(400, { message: 'No challengeID' });
        }

        const formData = await request.formData();
        const submittedFlag = formData.get('flag') as string;

        const successfulSubmission = await db
            .selectFrom('ctf_submissions')
            .where('ctf_submissions.team_id', '=', team.teamId)
            .where('challenge', '=', challengeId)
            .where('success', '=', true)
            .executeTakeFirst();

        if (successfulSubmission !== undefined)
            return fail(403, { message: "User's team has already solved challenge" });

        const correctFlag = await get_flag_of_ctf_challenge(challengeId);

        if (!correctFlag.challengeExists) {
            return fail(404, { message: 'Challenge not found' });
        }
        if (!correctFlag.flagExists) {
            return fail(404, { message: 'Flag of challenge not found' });
        }

        if (!correctFlag.flag)
            return fail(404, { message: 'Flag of challenge not found' });

        const flagIsCorrect = submittedFlag === correctFlag.flag;

        const submission: Insertable<CtfSubmissions> = {
            challenge: challengeId,
            team_id: team.teamId,
            time: new Date(),
            success: flagIsCorrect,
            submitted_data: submittedFlag,
            ctf: ctfId,
        };

        const submissionResult = await db
            .insertInto('ctf_submissions')
            .values(submission)
            .executeTakeFirst();

        if (submissionResult === undefined) {
            return fail(500, {
                message: 'Your submission could not be recorded, please try again.',
            });
        }

        const message = flagIsCorrect ? 'Correct flag' : 'Incorrect flag';

        return { success: flagIsCorrect, message };
    },
} satisfies Actions;
