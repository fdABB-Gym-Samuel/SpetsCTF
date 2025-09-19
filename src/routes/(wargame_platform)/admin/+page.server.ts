import { error, redirect, type ServerLoadEvent } from '@sveltejs/kit';

export const load = async ({ locals }: ServerLoadEvent) => {
    if (!locals.user) {
        return redirect(303, '/login');
    }
    if (locals.user?.is_admin !== true) {
        return error(401, { message: 'Not authorized' });
    }
};
