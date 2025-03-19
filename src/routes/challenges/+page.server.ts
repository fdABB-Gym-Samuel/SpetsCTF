import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async (_event: ServerLoadEvent) => {
	const rows = await db.selectFrom('challenges').selectAll().execute();
	return { challenges: rows };
};
