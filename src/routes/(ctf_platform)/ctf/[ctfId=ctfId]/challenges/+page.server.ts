import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals, depends, params, parent }) => {
    const user = locals.user;
    const ctfId = Number(params.ctfId);
    const userId = user ? user.id : undefined;

    const ctf = (await parent()).ctfData;

    depends(`data:ctf-${params.ctfId}-challenges`);

    const allChallenges =
        ctf && (new Date(ctf.start_time) < new Date() || user?.is_admin)
            ? await db
                  .with('unique_success', (qb) =>
                      qb
                          .selectFrom('ctf_submissions')
                          .select(['challenge', 'user_id'])
                          .select(sql`MIN(time)`.as('first_time'))
                          .where('success', '=', true)
                          .groupBy(['challenge', 'user_id'])
                  )
                  // Second CTE: rank these unique successful submissions per challenge.
                  .with('ranked_submissions', (qb) =>
                      qb
                          .selectFrom('unique_success')
                          .select(['challenge', 'user_id', 'first_time'])
                          .select(
                              sql`ROW_NUMBER() OVER (PARTITION BY challenge ORDER BY first_time)`.as(
                                  'rn'
                              )
                          )
                  )
                  // Main query: join challenges, ranked submissions, users, and flag.
                  .selectFrom('challenges as ch')
                  .where('ch.ctf', '=', ctfId)
                  .where('ch.approved', '=', true)
                  .leftJoin(
                      'ranked_submissions as rs',
                      'ch.challenge_id',
                      'rs.challenge'
                  )
                  .leftJoin('users as u', 'rs.user_id', 'u.id')
                  .where('u.is_admin', 'is not', true)
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
                      'ch.challenge_id',
                      'ch.display_name',
                      'ch.description',
                      'ch.challenge_category',
                      'ch.challenge_sub_categories',
                      'ch.points',
                      'f.flag_format',
                      //   'challenges.challenge_id',
                      //   'challenges.display_name',
                      //   'challenges.description',
                      //   'challenges.points',
                      //   'challenges.challenge_category',
                      //   'challenges.challenge_sub_categories',
                      //   'challenges.author',
                      //   'challenges.anonymous_author',
                      //   'challenges.approved',
                      //   'challenges.created_at',
                      //   'challenges.ctf',
                      //   'challenges.flag',
                      eb
                          .case()
                          .when(sql.ref('ch.anonymous_author'), '=', true)
                          .then(sql.lit('Anonymous'))
                          .else(sql.ref('a.display_name'))
                          .end()
                          .as('author'),
                      // 'a.id as author_id',
                      eb
                          .case()
                          .when(sql.ref('ch.anonymous_author'), '=', true)
                          .then(sql.lit(null))
                          .else(sql.ref('a.id'))
                          .end()
                          .as('author_id'),
                      // Aggregate up to the first 5 solver display_names into a JSON array, ordered by submission time.
                      sql`
              COALESCE(
                JSON_AGG(
                  json_build_object('display_name', u.display_name)
                  ORDER BY rs.first_time
                ) FILTER (WHERE rs.rn <= 5),
                '[]'::json
              )
            `.as('first_solvers'),
                      // Count the total number of unique successful solves for the challenge.
                      sql`(
              SELECT COUNT(*)
              FROM unique_success us
              WHERE us.challenge = ch.challenge_id
            )`.as('num_solvers'),
                      // Check if the current user has a successful submission on this challenge.
                      sql`EXISTS(
              SELECT 1 FROM ctf_submissions ws
              WHERE ws.challenge = ch.challenge_id
                AND ws.user_id = ${userId}
                AND ws.success = true
            )`.as('solved'),
                      // Get an array of resources for the challenge (ordered by resource id).
                      sql`
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
                  .orderBy('ch.points', 'asc')
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
    delete: async ({ request, locals }) => {
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

        await db
            .deleteFrom('challenges')
            .where('challenge_id', '=', challengeId)
            .executeTakeFirst();

        return { success: true, message: 'Challenge successfully deleted' };
    },
} satisfies Actions;
