import { db } from '$lib/db/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const nextCtf = await db
        .selectFrom('ctf_events')
        .select('start_time')
        .where('start_time', '>', new Date())
        .orderBy('start_time', 'asc')
        .executeTakeFirst();

    return { nextCtf };
};
