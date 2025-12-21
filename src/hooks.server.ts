import type { Handle } from '@sveltejs/kit';
import { getTranslations } from '$lib/translations';
import {
    deleteSessionTokenCookie,
    setSessionTokenCookie,
    validateSessionToken,
} from '$lib/db/functions';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
    if (
        dev &&
        event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json'
    ) {
        return new Response(undefined, { status: 404 });
    }
    const token = event.cookies.get('session') ?? null;

    event.locals.translations = getTranslations(
        event.request.headers.get('accept-language') ?? 'en-US'
    );

    if (token === null) {
        event.locals.user = undefined;
        event.locals.session = undefined;
        const response = resolve(event);
        return response;
    }

    const { session, user } = await validateSessionToken(token);
    if (session !== undefined && user) {
        setSessionTokenCookie(event, token, session.expires_at);
        event.locals.session = session;
        event.locals.user = user;
    } else {
        deleteSessionTokenCookie(event);
    }

    const response = resolve(event);
    return response;
};
