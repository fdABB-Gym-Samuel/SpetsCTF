import { generateState } from 'arctic';
import { github } from '$lib/oauth';

import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const url = github.createAuthorizationURL(state, []);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 10 * 60,
		sameSite: 'lax'
	});

	console.log('redirecting to', url); // REMOVABLE
	return redirect(302, url);
}
