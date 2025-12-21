import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async () => {
    const ctfs = await db.selectFrom('ctf_events').selectAll().execute();

    return {
        ctfs,
    };
};
