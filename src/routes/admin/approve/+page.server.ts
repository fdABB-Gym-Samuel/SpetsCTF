import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    if (!user) {
        redirect(303, '/login');
    }
    if (!user.is_admin) {
        error(401, 'User not admin');
    }

    const unapprovedChallenges = await db
        .selectFrom('challenges')
        .where('ctf', 'is', null)
        .where('approved', 'is not', true)
        .selectAll()
        .execute();

    return { unapprovedChallenges };
};
