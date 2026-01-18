import type { PageServerLoad } from './$types';
import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import { type Insertable, sql } from 'kysely';
import type { WargameSubmissions } from '$lib/generated/db';
import { get_flag_of_challenge } from '$lib/db/functions';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ params, parent, locals, depends }) => {
    const { translations, ctfData, isOrg, team } = await parent();

    const ctfId = Number(params.ctfId);

    if (!ctfData) {
        error(404, 'CTF not found');
    }

    const user = locals.user;
    const challengeData = await db
        .selectFrom('challenges')
        .innerJoin('flag', 'challenges.flag', 'flag.id')
        .innerJoin('users', 'challenges.author', 'users.id')
        .leftJoin('ctf_events', 'challenges.ctf', 'ctf_events.id')
        .where('challenges.ctf', '=', ctfId)
        .where('challenge_id', '=', params.challengeId)
        .select([
            'challenges.anonymous_author',
            'challenges.approved',
            'challenges.challenge_category',
            'challenges.challenge_id',
            'challenges.challenge_sub_categories',
            'challenges.created_at',
            'challenges.ctf',
            'challenges.description',
            'challenges.display_name',
            'challenges.flag',
            'challenges.points',
        ])
        .select('flag.flag_format')
        .select([
            'challenges.author as author_id',
            sql<string>`
                CASE 
                    WHEN challenges.anonymous_author = true THEN '' 
                    ELSE COALESCE(users.display_name, '') 
                END
            `.as('author'),
        ])
        .select(() =>
            sql<boolean>`EXISTS(
                SELECT 1 
                FROM ctf_submissions cs
                INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
                WHERE cs.challenge = challenges.challenge_id
                    AND cs.success = true
                    AND ctm.team = (
                        SELECT team 
                        FROM ctf_teams_members 
                        WHERE user_id = ${user?.id ?? null}
                        LIMIT 1
                    )
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

    if (challengeData.anonymous_author || challengeData.author === '') {
        challengeData.author_id = '00000000-0000-0000-0000-000000000000';
    }

    const firstSolvers = await db
        .with('first_solve_per_user', (qb) =>
            qb
                .selectFrom('ctf_submissions')
                .where('challenge', '=', challengeData.challenge_id)
                .where('success', '=', true)
                .select(['user_id'])
                .select(sql`MIN(time)`.as('first_time'))
                .groupBy('user_id')
        )
        .selectFrom('first_solve_per_user')
        .innerJoin('users', 'users.id', 'first_solve_per_user.user_id')
        .where('is_admin', '!=', true)
        .orderBy('first_solve_per_user.first_time', 'asc')
        .select([
            'users.display_name',
            sql<string>`
                case
                    when users.display_name is null or users.display_name = '' then '00000000-0000-0000-0000-000000000000'
                    else users.id
                end
            `.as('id'),
        ])
        .limit(5)
        .execute();

    const resources = await db
        .selectFrom('challenge_resources')
        .where('challenge', '=', challengeData.challenge_id)
        .selectAll()
        .execute();

    const numSolvers = await db
        .selectFrom('ctf_submissions')
        .where('success', '=', true)
        .where('challenge', '=', challengeData.challenge_id)
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst();

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
    submit: async ({ request, locals, params }) => {
        const user = locals.user;

        if (!user) {
            return redirect(304, '/login');
        }

        const ctfId = Number(params.ctfId);
        const challengeId = params.challengeId;

        const ctfData = await db
            .selectFrom('ctf_events')
            .where('id', '=', ctfId)
            .selectAll()
            .executeTakeFirst();

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

        const userTeam = await db
            .selectFrom('ctf_teams')
            .innerJoin('ctf_teams_members', 'ctf_teams.id', 'ctf_teams_members.team')
            .where('ctf_teams.ctf', '=', ctfId)
            .where('ctf_teams_members.user_id', '=', user.id)
            .select(['ctf_teams.id'])
            .executeTakeFirst();

        if (!userTeam) {
            return fail(403, { message: 'User is not part of any team in this CTF' });
        }

        if (!challengeId) {
            return fail(400, { message: 'No challengeID' });
        }

        const formData = await request.formData();
        const submittedFlag = formData.get('flag') as string;

        const successfulSubmission = await db
            .selectFrom('ctf_submissions')
            .innerJoin(
                'ctf_teams_members',
                'ctf_submissions.user_id',
                'ctf_teams_members.user_id'
            )
            .where('ctf_teams_members.team', '=', (eb) =>
                eb
                    .selectFrom('ctf_teams_members')
                    .select('team')
                    .where('user_id', '=', user.id)
                    .limit(1)
            )
            .where('challenge', '=', challengeId)
            .where('success', '=', true)
            .executeTakeFirst();

        if (successfulSubmission !== undefined)
            return fail(403, { message: "User's team has already solved challenge" });

        const correctFlag = await get_flag_of_challenge(challengeId);

        if (!correctFlag.challengeExists) {
            return fail(404, { message: 'Challenge not found' });
        }
        if (!correctFlag.flagExists) {
            return fail(404, { message: 'Flag of challenge not found' });
        }

        if (!correctFlag.flag)
            return fail(404, { message: 'Flag of challenge not found' });

        const flagIsCorrect = submittedFlag === correctFlag.flag;

        const submission: Insertable<WargameSubmissions> = {
            challenge: challengeId,
            user_id: user.id,
            time: new Date(),
            success: flagIsCorrect,
            submitted_data: submittedFlag,
        };

        const submissionResult = await db
            .insertInto('wargame_submissions')
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
