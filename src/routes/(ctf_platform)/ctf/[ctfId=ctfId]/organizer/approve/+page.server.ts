import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ locals, parent, params }) => {
    const user = locals.user;

    if (!user) {
        redirect(303, '/login');
    }

    const parentData = await parent();

    if (!parentData.isOrg) {
        error(401, 'User not counted as organizer');
    }

    if (parentData.ctfData.end_time < new Date()) {
        error(401, 'CTF has ended.');
    }

    const unapprovedChallenges = await db
        .selectFrom('challenges')
        .where('ctf', '=', Number(params.ctfId))
        .where('approved', 'is not', true)
        .selectAll()
        .execute();

    return { unapprovedChallenges };
};
