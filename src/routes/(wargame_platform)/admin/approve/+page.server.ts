import type { PageServerLoad } from '../$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { jsonArrayFrom, jsonBuildObject } from 'kysely/helpers/postgres';

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
        .selectAll('ch')
        .select((eb) => [
            jsonBuildObject({
                id: eb.ref('f.id'),
                flag: eb.ref('f.flag'),
                flag_format: eb.ref('f.flag_format'),
            }).as('flag'),
            jsonArrayFrom(
                eb
                    .selectFrom('challenge_resources as cr')
                    .selectAll('cr')
                    .whereRef('cr.challenge', '=', 'ch.challenge_id')
                    .orderBy('cr.id')
            ).as('resources'),
        ])
        .execute();

    return { unapprovedChallenges };
};
