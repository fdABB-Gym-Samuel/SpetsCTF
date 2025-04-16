import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';

export const load = async ({ locals, params }: ServerLoadEvent) => {
	const user = locals.user;
	const ctfId = Number(params.ctf_id);
	if (!user) {
		error(401, { message: 'User not signed in' });
	}

	const org = await db
		.selectFrom('ctf_organizers')
		.where('ctf', '=', ctfId)
		.where('user_id', '=', user.id)
		.executeTakeFirst();

	const isOrg = org !== undefined;

	if (!locals.user?.is_admin && !isOrg) {
		error(401, { message: 'Not authorized' });
	}
};
