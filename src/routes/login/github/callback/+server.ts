import { db } from '$lib/db/database';
import { generateSessionToken, createSession, getUserFromGithubId, setSessionTokenCookie } from '$lib/db/functions';
import { github } from '$lib/oauth';

import type { RequestEvent } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	console.trace('code state', code, state) // REMOVABLE
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	console.trace('storedstate', storedState) // REMOVABLE
	if (code === null || state === null || storedState === null) {
		return error(400);
	}

	if (state !== storedState) {
		return error(400);
	}

	let tokens: OAuth2Tokens;

	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		// Invalid code or client credentials
		return error(400);
	}

	const githubUserResponse = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});
	const githubUser = await githubUserResponse.json();

	console.trace('githubuserresponse', githubUser) // REMOVABLE

	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;


	const existingUser = await getUserFromGithubId(githubUserId);
	console.trace('existingUser', existingUser) // REMOVABLE
	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expires_at)
		return redirect(302, '/');
	}

	const userId = await db.insertInto('users').values({
		github_id: githubUserId,
		github_username: githubUsername
	}).returning('id').executeTakeFirstOrThrow();

	console.trace('userId', userId) // REMOVABLE

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, userId.id);
	setSessionTokenCookie(event, sessionToken, session.expires_at);
	console.trace('session generated in callback', session) // REMOVABLE

	console.log('redirecting to /')

	return redirect(302, '/');
	
}
