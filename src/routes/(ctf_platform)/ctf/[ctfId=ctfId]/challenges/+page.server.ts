import { fail, error, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { rm } from 'node:fs/promises';
import { getStateDirectory } from '$lib/server/directories';
import { join } from 'node:path';
import sanitize from 'sanitize-filename';

export const load: PageServerLoad = async ({ locals, depends, params, parent }) => {
    const user = locals.user;
    const ctfId = Number(params.ctfId);
    const userId = user ? user.id : undefined;

    const parentData = await parent();
    const { ctfData } = parentData;

    depends(`data:ctf-${params.ctfId}-challenges`);

    const allChallenges =
        ctfData && (new Date(ctfData.start_time) < new Date() || user?.is_admin)
            ? await db
                  .with('unique_team_success', (qb) =>
                      qb
                          .selectFrom('ctf_submissions')
                          .innerJoin(
                              'ctf_teams_members as ctm',
                              'ctf_submissions.user_id',
                              'ctm.user_id'
                          )
                          .innerJoin('ctf_teams as ct', 'ctm.team', 'ct.id')
                          .innerJoin('users as u', 'ctf_submissions.user_id', 'u.id')
                          .innerJoin(
                              'challenges as ch',
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
                  // Main query: join challenges, ranked submissions, and flag.
                  .selectFrom('challenges as ch')
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
                      //   'ch.points',
                      sql<number>`
                        CASE 
                          WHEN (
                            SELECT COUNT(DISTINCT ctm.team)
                            FROM ctf_submissions cs
                            INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
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
                                INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
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
                          INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
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
                      // Check if the any user on the current user's team has solved the challenge.
                      sql<boolean>`EXISTS(
                          SELECT 1 
                          FROM ctf_submissions cs
                          INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
                          INNER JOIN ctf_teams ct ON ctm.team = ct.id
                          WHERE cs.challenge = ch.challenge_id
                            AND cs.success = true
                            AND ct.ctf = ${ctfId}
                            AND ctm.team = (
                              SELECT ctm2.team 
                              FROM ctf_teams_members ctm2
                              INNER JOIN ctf_teams ct2 ON ctm2.team = ct2.id
                              WHERE ctm2.user_id = ${userId}
                                AND ct2.ctf = ${ctfId}
                              LIMIT 1
                            )
                        )`.as('solved'),
                      // Get an array of resources for the challenge (ordered by resource id).
                      sql<{ type: string; content: string }[]>`
              COALESCE(
                (
                  SELECT JSON_AGG(
                    json_build_object('type', cr.type, 'content', cr.content)
                    ORDER BY cr.id
                  )
                  FROM challenge_resources cr
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
        .selectFrom('challenges as ch')
        .where('ch.ctf', '=', ctfId)
        .leftJoin('flag as f', 'ch.flag', 'f.id')
        .leftJoin('users as a', 'ch.author', 'a.id')
        .select([
            'ch.challenge_id',
            'ch.display_name as challenge_name',
            'ch.challenge_category',
            'ch.challenge_sub_categories',
            'ch.points',
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
    deleteChallenge: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            return redirect(304, '/login');
        }

        const formData = await request.formData();
        const challengeId = formData.get('challengeId') as string;

        const challengeAuthor = await db
            .selectFrom('challenges')
            .select('author')
            .where('challenge_id', '=', challengeId)
            .executeTakeFirst();

        if (challengeAuthor === undefined) {
            return fail(404, { message: 'Challenge not found' });
        }

        if (challengeAuthor.author !== user.id && !user.is_admin) {
            return fail(401, { message: 'User not author of challenge or admin' });
        }

        try {
            await db
                .deleteFrom('challenges')
                .where('challenge_id', '=', challengeId)
                .executeTakeFirst();
            await rm(join(getStateDirectory(), 'files', sanitize(challengeId)), {
                recursive: true,
                force: true,
            });
        } catch {
            error(500, {
                message:
                    'Could not delete challenge properly, please contact an administrator.',
            });
        }

        return { success: true, message: 'Challenge successfully deleted' };
    },
} satisfies Actions;
