import type { Handle } from '@sveltejs/kit';
import pool from '$lib/db/pgpool';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pgpool = pool;

	const response = resolve(event);
	return response;
};
