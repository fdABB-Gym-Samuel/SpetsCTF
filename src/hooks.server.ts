import type { Handle } from '@sveltejs/kit';
import pool from '$lib/db/pgpool';
import { getTranslations } from '$lib/translations';
import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from '$lib/db/functions';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;
	event.locals.pgpool = pool;

	event.locals.translations = getTranslations(
		event.request.headers.get('accept-language') ?? 'en-US'
	);

	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
		const response = resolve(event);
		return response;
	}

	const {session} = await validateSessionToken(token);
	if (session !== null) {
		setSessionTokenCookie(event, token, session.expires_at);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.session = session;
	
	const response = resolve(event);
	return response;
};
