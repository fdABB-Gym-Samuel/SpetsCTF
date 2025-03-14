import type { Handle } from '@sveltejs/kit';
import pool from '$lib/db/pgpool';
import { getTranslations } from '$lib/translations';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pgpool = pool;

	event.locals.translations = getTranslations(event.request.headers.get('accept-language') ?? 'en-US')

	const response = resolve(event);
	return response;
};
