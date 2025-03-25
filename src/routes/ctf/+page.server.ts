import type { PageServerLoad, PageServerLoadEvent } from './$types';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ locals }: PageServerLoadEvent) => {
	const ctfs = await db.selectFrom('ctf_events').selectAll().execute();

	return {
		ctfs
	};
};
