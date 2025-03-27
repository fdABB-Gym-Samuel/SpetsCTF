import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = (event: ServerLoadEvent) => {
	const ctfId = event.params.ctf_id;
};
