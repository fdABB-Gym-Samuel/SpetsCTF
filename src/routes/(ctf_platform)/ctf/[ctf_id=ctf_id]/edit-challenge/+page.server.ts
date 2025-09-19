import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import type { PageServerLoad } from '../$types';
import { getIsOrg } from '$lib/db/functions';

export const load: PageServerLoad = async ({ locals, params }) => {
    const user = locals.user;
    const ctfId = Number(params.ctf_id);

    if (!user) {
        return redirect(303, '/login');
    }

    const isOrg = await getIsOrg(user.id, ctfId);

    const editableChallengesQuery = db
        .selectFrom('challenges as ch')
        .where('ctf', '=', ctfId)
        .leftJoin('flag as f', 'ch.flag', 'f.id')
        .leftJoin('users as a', 'ch.author', 'a.id')
        .select([
            'ch.challenge_id',
            'ch.display_name as challenge_name',
            'ch.description as challenge_description',
            'ch.challenge_category',
            'ch.challenge_sub_categories',
            'ch.points',
            'f.flag_format',
            'a.display_name as author',
            'a.id as author_id',
            sql<boolean>`ch.author = ${user.id}`.as('is_author'),
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
        ]);

    let editableChallenges;
    if (!user.is_admin && !isOrg) {
        editableChallenges = await editableChallengesQuery
            .where('ch.author', '=', user.id)
            .execute();
    } else {
        editableChallenges = await editableChallengesQuery.execute();
    }

    return { editableChallenges };
};
