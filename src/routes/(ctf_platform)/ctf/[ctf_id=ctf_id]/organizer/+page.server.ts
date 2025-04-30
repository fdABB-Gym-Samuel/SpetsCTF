import { error, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { getIsOrg } from '$lib/db/functions';

export const load = async ({ locals, params }: ServerLoadEvent) => {
	const user = locals.user;
	const ctfId = Number(params.ctf_id);
	if (!user) {
		return redirect(303, '/login');
	}

	const isOrg = await getIsOrg(user.id, ctfId)

	if (!user.is_admin && !isOrg) {
		return error(401, { message: 'Not authorized' });
	}
};
