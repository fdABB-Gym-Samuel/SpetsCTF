import { db } from '$lib/db/database';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }: ServerLoadEvent) => {
    const ctfId = Number(params.ctfId);
    if (!params.ctfId) error(404);

    const ctfData = await db
        .selectFrom('ctf_events')
        .select([
            'ctf_events.display_name',
            'ctf_events.end_time',
            'ctf_events.id',
            'ctf_events.max_team_size',
            'ctf_events.start_time',
        ])
        .where('id', '=', ctfId)
        .executeTakeFirst();

    if (!ctfData) {
        error(404, { message: 'CTF does not exist.' });
    }

    return { ctfData };
};
