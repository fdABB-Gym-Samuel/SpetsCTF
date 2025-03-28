import { db } from '$lib/db/database';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }: ServerLoadEvent) => {
	const ctfId = Number(params.ctf_id)
	if (!params.ctf_id) return { ctf_data: null };

	const ctf_data = await db
		.selectFrom('ctf_events')
		.select([
			'ctf_events.display_name',
			'ctf_events.start_time',
			'ctf_events.end_time',
			'ctf_events.max_team_size'
		])
		.where('id', '=', ctfId)
		.executeTakeFirst();

	return { ctf_data };
};
