import { page } from '$app/state';
import { db } from '$lib/db/database';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (_event: ServerLoadEvent) => {
	if (_event.params.ctf_id === undefined) return { ctf_data: null };

	const ctf_data = await db
		.selectFrom('ctf_events')
		.select([
			'ctf_events.display_name',
			'ctf_events.start_time',
			'ctf_events.end_time',
			'ctf_events.max_team_size'
		])
		.where('id', '=', _event.params.ctf_id)
		.executeTakeFirst();

	return { ctf_data };
};
