import type { Handle } from '@sveltejs/kit';
import { getTranslations } from '$lib/translations';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from '$lib/db/functions';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;

	event.locals.translations = getTranslations(
		event.request.headers.get('accept-language') ?? 'en-US'
	);

	if (token === null) {
		event.locals.user = undefined;
		event.locals.session = null;
		const response = resolve(event);
		return response;
	}

	const { session, user } = await validateSessionToken(token);
	if (session !== null && user) {
		setSessionTokenCookie(event, token, session.expires_at);
		event.locals.session = session;
		event.locals.user = user;
	} else {
		deleteSessionTokenCookie(event);
	}

	const response = resolve(event);
	return response;
};
