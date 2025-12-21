import type { PageServerLoad } from '../$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;

    if (!user) {
        return redirect(303, '/login');
    }

    if (!user.is_admin) {
        return error(401, 'User not admin');
    }

    const unapprovedChallenges = await db
        .selectFrom('challenges as ch')
        .where('ch.approved', '=', false)
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
        .execute();

    return { unapprovedChallenges };
};
