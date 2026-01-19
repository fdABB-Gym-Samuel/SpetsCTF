import type { Handle } from '@sveltejs/kit';
import { getTranslations } from '$lib/translations';
import {
    deleteSessionTokenCookie,
    setSessionTokenCookie,
    validateSessionToken,
} from '$lib/db/functions';

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('session') ?? null;

    event.locals.translations = getTranslations(
        event.request.headers.get('accept-language') ?? 'en-US'
    );

    if (event.request.method === 'POST') {
        console.log('=== POST Request Debug ===');
        console.log('URL:', event.url.href);
        console.log('URL Origin:', event.url.origin);
        console.log('URL Protocol:', event.url.protocol);
        console.log('URL Host:', event.url.host);

        console.log('\n--- Headers ---');
        console.log('Origin Header:', event.request.headers.get('origin'));
        console.log(
            'X-Forwarded-Proto:',
            event.request.headers.get('x-forwarded-proto')
        );
        console.log('X-Forwarded-Host:', event.request.headers.get('x-forwarded-host'));
        console.log('X-Forwarded-For:', event.request.headers.get('x-forwarded-for'));
        console.log('Host:', event.request.headers.get('host'));
        console.log('Content-Type:', event.request.headers.get('content-type'));

        console.log('\n--- All Headers ---');
        event.request.headers.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });
        console.log('======================\n');
    }

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
