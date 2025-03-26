import { error, type ServerLoadEvent } from '@sveltejs/kit';

export const load = async ({ locals }: ServerLoadEvent) => {
	if (locals.user?.is_admin !== true) {
		error(400, { message: 'Not authorized' });
	}
};
