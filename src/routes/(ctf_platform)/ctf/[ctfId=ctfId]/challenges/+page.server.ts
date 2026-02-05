import { fail, redirect, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql, type Insertable } from 'kysely';
import { formatRequestedName } from '$lib/utils/utils';

export const load: PageServerLoad = async ({ locals, depends, params, parent }) => {
    const user = locals.user;
    const ctfId = Number(params.ctfId);

    const parentData = await parent();
    const { ctfData, team } = parentData;
    const userTeamId = team?.teamId ?? null;

    depends(`data:ctf-${params.ctfId}-challenges`);

    const allChallenges =
        ctfData && (new Date(ctfData.start_time) < new Date() || user?.is_admin)
            ? await db
                  .with('unique_team_success', (qb) =>
                      qb
                          .selectFrom('ctf_submissions')
                          .innerJoin(
                              'ctf_teams_members as ctm',
                              'ctf_submissions.team_id',
                              'ctm.team'
                          )
                          .innerJoin('ctf_teams as ct', 'ctm.team', 'ct.id')
                          .innerJoin('users as u', 'ctm.user_id', 'u.id')
                          .innerJoin(
                              'ctf_challenges as ch',
                              'ctf_submissions.challenge',
                              'ch.challenge_id'
                          )
                          .where('ctf_submissions.success', '=', true)
                          .where('ct.ctf', '=', ctfId)
                          .where('u.is_admin', '!=', true)
                          // Exclude author's team
                          .where(
                              sql<boolean>`ctm.team != COALESCE((
                              SELECT ctm_author.team 
                              FROM ctf_teams_members ctm_author
                              INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                              WHERE ctm_author.user_id = ch.author
                                AND ct_author.ctf = ${ctfId}
                              LIMIT 1
                            ), -1)`
                          )
                          .select(['ctf_submissions.challenge', 'ctm.team as team_id'])
                          .select(sql<Date>`MIN(ctf_submissions.time)`.as('first_time'))
                          .groupBy(['ctf_submissions.challenge', 'ctm.team'])
                  )
                  // Second CTE: rank these unique successful team submissions per challenge.
                  .with('ranked_submissions', (qb) =>
                      qb
                          .selectFrom('unique_team_success')
                          .innerJoin(
                              'ctf_teams as ct',
                              'unique_team_success.team_id',
                              'ct.id'
                          )
                          .select([
                              'challenge',
                              'unique_team_success.team_id',
                              'ct.name as team_name',
                              'first_time',
                          ])
                          .select(
                              sql<number>`ROW_NUMBER() OVER (PARTITION BY challenge ORDER BY first_time)`.as(
                                  'rn'
                              )
                          )
                  )
                  // Main query: join ctf_challenges, ranked submissions, and flag.
                  .selectFrom('ctf_challenges as ch')
                  .where('ch.ctf', '=', ctfId)
                  .where('ch.approved', '=', true)
                  .leftJoin(
                      'ranked_submissions as rs',
                      'ch.challenge_id',
                      'rs.challenge'
                  )
                  .leftJoin('flag as f', 'ch.flag', 'f.id')
                  .leftJoin('users as a', 'ch.author', 'a.id')
                  .groupBy([
                      'ch.challenge_id',
                      'ch.display_name',
                      'ch.description',
                      'ch.points',
                      'ch.challenge_category',
                      'ch.challenge_sub_categories',
                      'a.display_name',
                      'a.id',
                      'f.flag_format',
                  ])
                  .select((eb) => [
                      'ch.anonymous_author',
                      'ch.approved',
                      'ch.challenge_category',
                      'ch.challenge_id',
                      'ch.challenge_sub_categories',
                      'ch.created_at',
                      'ch.ctf',
                      'ch.description',
                      'ch.display_name',
                      'ch.flag',
                      'ch.migrate_to_wargames',
                      //   'ch.points',
                      sql<number>`
                        CASE 
                          WHEN (
                            SELECT COUNT(DISTINCT ctm.team)
                            FROM ctf_submissions cs
                            INNER JOIN ctf_teams_members ctm ON cs.team_id = ctm.team
                            INNER JOIN ctf_teams ct ON ctm.team = ct.id
                            WHERE cs.challenge = ch.challenge_id
                              AND cs.success = true
                              AND ct.ctf = ${ctfId}
                              AND ctm.team != COALESCE((
                                SELECT ctm_author.team 
                                FROM ctf_teams_members ctm_author
                                INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                                WHERE ctm_author.user_id = ch.author
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
                                WHERE cs.challenge = ch.challenge_id
                                  AND cs.success = true
                                  AND ct.ctf = ${ctfId}
                                  AND ctm.team != COALESCE((
                                    SELECT ctm_author.team 
                                    FROM ctf_teams_members ctm_author
                                    INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                                    WHERE ctm_author.user_id = ch.author
                                      AND ct_author.ctf = ${ctfId}
                                    LIMIT 1
                                  ), -1)
                              ), 2)) + 501
                            ),
                            100
                          )
                        END`.as('points'),
                      'f.flag_format',
                      eb
                          .case()
                          .when(sql.ref('ch.anonymous_author'), '=', true)
                          .then(sql.lit('Anonymous'))
                          .else(sql.ref('a.display_name'))
                          .end()
                          .$castTo<string | null>()
                          .as('author'),
                      eb
                          .case()
                          .when(sql.ref('ch.anonymous_author'), '=', true)
                          .then(sql.lit(null))
                          .else(sql.ref('a.id'))
                          .end()
                          .$castTo<string | null>()
                          .as('author_id'),
                      // Aggregate up to the first 5 solver team names into a JSON array, ordered by submission time.
                      sql<{ display_name: string | null }[]>`
                          COALESCE(
                            JSON_AGG(
                              json_build_object('display_name', rs.team_name)
                              ORDER BY rs.first_time
                            ) FILTER (WHERE rs.rn <= 5),
                            '[]'::json
                          )
                        `.as('first_solvers'),
                      // Count the total number of unique successful solves for the challenge (excluding author's team).
                      sql<number>`(
                          SELECT COUNT(DISTINCT ctm.team)
                          FROM ctf_submissions cs
                          INNER JOIN ctf_teams_members ctm ON cs.team_id = ctm.team
                          INNER JOIN ctf_teams ct ON ctm.team = ct.id
                          WHERE cs.challenge = ch.challenge_id
                            AND cs.success = true
                            AND ct.ctf = ${ctfId}
                            AND ctm.team != COALESCE((
                              SELECT ctm_author.team 
                              FROM ctf_teams_members ctm_author
                              INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                              WHERE ctm_author.user_id = ch.author
                                AND ct_author.ctf = ${ctfId}
                              LIMIT 1
                            ), -1)
                        )`.as('num_solvers'),
                      // Check if the user's team has solved the challenge.
                      sql<boolean>`EXISTS(
                          SELECT 1 
                          FROM ctf_submissions cs
                          WHERE cs.challenge = ch.challenge_id
                            AND cs.success = true
                            AND cs.team_id = ${userTeamId}
                        )`.as('solved'),
                      // Get an array of resources for the challenge (ordered by resource id).
                      sql<{ type: string; content: string }[]>`
              COALESCE(
                (
                  SELECT JSON_AGG(
                    json_build_object('type', cr.type, 'content', cr.content)
                    ORDER BY cr.id
                  )
                  FROM ctf_challenge_resources cr
                  WHERE cr.challenge = ch.challenge_id
                ),
                '[]'::json
              )
            `.as('resources'),
                  ])
                  .orderBy('points', 'asc')
                  .execute()
            : [];

    const myChallengesQuery = db
        .selectFrom('ctf_challenges as ch')
        .where('ch.ctf', '=', ctfId)
        .leftJoin('flag as f', 'ch.flag', 'f.id')
        .leftJoin('users as a', 'ch.author', 'a.id')
        .select([
            'ch.challenge_id',
            'ch.display_name as challenge_name',
            'ch.challenge_category',
            'ch.challenge_sub_categories',
            'ch.points',
            'ch.migrate_to_wargames',
            sql<boolean>`ch.author = ${user?.id}`.as('is_author'),
        ]);

    let myChallenges;
    if (user) {
        if (!user?.is_admin) {
            myChallenges = await myChallengesQuery
                .where('ch.author', '=', user?.id ?? '')
                .execute();
        } else {
            myChallenges = await myChallengesQuery.execute();
        }
    } else {
        myChallenges = null;
    }

    return { allChallenges, myChallenges };
};

export const actions = {
    createChallenge: async ({ locals, request, params }) => {
        const user = locals.user;
        if (!user) {
            redirect(303, '/login');
        }

        const ctfId = Number(params.ctfId);

        // Check CTF exists and hasn't ended
        const ctf = await db
            .selectFrom('ctf_events')
            .where('id', '=', ctfId)
            .select(['id', 'end_time'])
            .executeTakeFirst();

        if (!ctf) {
            return fail(404, { success: false, message: 'CTF not found' });
        }

        if (new Date(ctf.end_time) < new Date()) {
            return fail(403, {
                success: false,
                message: 'Cannot create challenges for a CTF that has ended',
            });
        }

        const form = await request.formData();
        if (!form.has('name')) {
            return fail(400);
        }

        const requestedNameFormDataEntry = form.get('name');
        let requestedName: string = '';
        if (
            requestedNameFormDataEntry === null ||
            requestedNameFormDataEntry.toString() === ''
        ) {
            return fail(400);
        } else {
            requestedName = requestedNameFormDataEntry.toString();
        }

        const formattedRequestedName = formatRequestedName(requestedName);

        if (formattedRequestedName.length === 0) {
            return fail(400);
        }

        // Check if challenge ID exists in either table
        const existingCtfChallenge = await db
            .selectFrom('ctf_challenges')
            .where('challenge_id', '=', formattedRequestedName)
            .select('challenge_id')
            .executeTakeFirst();

        const existingWargameChallenge = await db
            .selectFrom('challenges')
            .where('challenge_id', '=', formattedRequestedName)
            .select('challenge_id')
            .executeTakeFirst();

        if (existingCtfChallenge || existingWargameChallenge) {
            return fail(409, { success: false, message: 'Challenge ID not available' });
        }

        const migrateToWargames = form.get('migrate_to_wargames') === 'on';

        const newEmptyChallenge = await db.transaction().execute(async (trx) => {
            // Create separate flags for CTF and wargame versions
            const ctfFlag = await trx
                .insertInto('flag')
                .values({
                    flag: '',
                    flag_format: '',
                })
                .returning(['flag.id'])
                .executeTakeFirstOrThrow();

            const wargameFlag = await trx
                .insertInto('flag')
                .values({
                    flag: '',
                    flag_format: '',
                })
                .returning(['flag.id'])
                .executeTakeFirstOrThrow();

            // Create in ctf_challenges table with its own flag
            const ctfChallenge = await trx
                .insertInto('ctf_challenges')
                .values({
                    anonymous_author: null,
                    approved: false,
                    author: user.id,
                    challenge_id: formattedRequestedName,
                    challenge_sub_categories: '00000000',
                    created_at: new Date(),
                    ctf: ctfId,
                    description: '',
                    display_name: requestedName,
                    flag: ctfFlag.id,
                    points: 0,
                    migrate_to_wargames: migrateToWargames,
                })
                .returningAll()
                .executeTakeFirst();

            // Create in challenges table with its own flag
            // migrate_to_wargames controls whether it shows publicly as a wargame
            await trx
                .insertInto('challenges')
                .values({
                    anonymous_author: null,
                    approved: false,
                    author: user.id,
                    challenge_id: formattedRequestedName,
                    challenge_sub_categories: '00000000',
                    created_at: new Date(),
                    ctf: ctfId,
                    description: '',
                    display_name: requestedName,
                    flag: wargameFlag.id,
                    points: 0,
                    migrate_to_wargames: migrateToWargames,
                })
                .execute();

            return ctfChallenge;
        });

        if (!newEmptyChallenge) {
            error(500, { message: 'Failed to create new challenge stub.' });
        }

        redirect(303, `/challenges/${newEmptyChallenge.challenge_id}/edit`);
    },
    deleteChallenge: async ({ request, locals, params }) => {
        const user = locals.user;
        if (!user) {
            return redirect(304, '/login');
        }

        const ctfId = Number(params.ctfId);
        const formData = await request.formData();
        const challengeId = formData.get('challengeId') as string;

        // Get CTF info to check if it has ended
        const ctf = await db
            .selectFrom('ctf_events')
            .where('id', '=', ctfId)
            .select(['id', 'end_time'])
            .executeTakeFirst();

        if (!ctf) {
            return fail(404, { message: 'CTF not found' });
        }

        const ctfEnded = new Date(ctf.end_time) < new Date();

        const ctfChallenge = await db
            .selectFrom('ctf_challenges')
            .select(['author', 'migrate_to_wargames'])
            .where('challenge_id', '=', challengeId)
            .where('ctf', '=', ctfId)
            .executeTakeFirst();

        if (ctfChallenge === undefined) {
            return fail(404, { message: 'Challenge not found' });
        }

        if (ctfChallenge.author !== user.id && !user.is_admin) {
            return fail(401, { message: 'User not author of challenge or admin' });
        }

        // If CTF has ended, cannot delete the CTF challenge
        if (ctfEnded) {
            return fail(403, {
                message:
                    'Cannot delete CTF challenge after CTF has ended. You can only delete the wargames version.',
            });
        }

        // CTF hasn't ended - delete from both tables
        await db.transaction().execute(async (trx) => {
            // Delete from ctf_challenges
            await trx
                .deleteFrom('ctf_challenges')
                .where('challenge_id', '=', challengeId)
                .execute();

            // Also delete from challenges if it exists there
            if (ctfChallenge.migrate_to_wargames) {
                await trx
                    .deleteFrom('challenges')
                    .where('challenge_id', '=', challengeId)
                    .execute();
            }
        });

        return { success: true, message: 'Challenge successfully deleted' };
    },
} satisfies Actions;
