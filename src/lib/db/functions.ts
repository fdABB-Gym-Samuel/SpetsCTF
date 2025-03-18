import { createHash } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import type { Category, UserSessions, Users } from './db';
import { db } from './database';
import type { Insertable, Selectable } from 'kysely';

export function validateCategory(value: any): Category {
	if (
		[
			'blockchain',
			'crypto',
			'forensics',
			'introduction',
			'misc',
			'osint',
			'pwn',
			'reversing',
			'web'
		].includes(value)
	) {
		return value as Category;
	} else {
		return 'misc' as Category;
	}
}

export function generateSessionToken(): string {
	const token = crypto.randomUUID();
	return token;
}

export async function createSession(token: string, user_id: string) {
	const sessionIdHash = createHash('sha256').update(new TextEncoder().encode(token)).digest('hex');
	const session: Insertable<UserSessions> = {
		id: sessionIdHash,
		user_id,
		expires_at: new Date(Date.now() +  1000 * 60 * 60 * 24 * 30)
	};

	const res = await db
		.insertInto('user_sessions')
		.values(session)
		.returningAll()
		.executeTakeFirstOrThrow();

	return res;
}

export type SessionValidationResult = { session: UserSessions } | { session: null };

export async function getUserFromUserId(user_id: string) {
	const res = await db.selectFrom('users').where('id', '=', user_id).executeTakeFirst();
	return res;
}

export async function validateSessionToken(token: string) {
	const sessionIdHash = createHash('sha256').update(new TextEncoder().encode(token)).digest('hex');

	const res = await db
		.selectFrom('user_sessions')
		.innerJoin('users', 'users.id', 'user_sessions.user_id')
		.select([
			'user_sessions.id',
			'user_sessions.user_id',
			'user_sessions.expires_at',
			'users.id as uid',
			'users.display_name',
			'users.github_username',
			'users.github_id',
			'users.represents_class',
			'users.is_admin'
		])
		.where('user_sessions.id', '=', sessionIdHash)
		.executeTakeFirst();

	if (!res) {
		return { session: null, user: null };
	}

	const session: Selectable<UserSessions> = {
		expires_at: res.expires_at,
		id: res.uid,
		user_id: res.user_id
	};

	const user: Selectable<Users> = {
		display_name: res.display_name,
		github_id: res.github_id,
		github_username: res.github_username,
		id: res.uid,
		represents_class: res.represents_class,
		is_admin: res.is_admin
	};

	if (Date.now() >= session.expires_at.getTime()) {
		db.deleteFrom('user_sessions').where('id', '=', sessionIdHash).execute();
		return { session: null };
	}

	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		db.updateTable('user_sessions')
			.set({ expires_at: session.expires_at })
			.where('id', '=', sessionIdHash)
			.execute();
	}

	return { session, user };
}

export async function invalidateSession(session_id: string): Promise<void> {
	db.deleteFrom('user_sessions').where('id', '=', session_id).execute();
}

export async function invalidateAllSessions(user_id: string): Promise<void> {
	db.deleteFrom('user_sessions').where('user_id', '=', user_id).execute();
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expires_at: Date): void {
	event.cookies.set('session', token, {
		expires: expires_at,
		httpOnly: true,
		path: '/',
		sameSite: 'lax'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('session', '', {
		httpOnly: true,
		maxAge: 0,
		path: '/',
		sameSite: 'lax'
	});
}

export async function getUserFromGithubId(github_id: number) {
	const res = await db
		.selectFrom('users')
		.selectAll()
		.where('github_id', '=', github_id)
		.executeTakeFirst();

	return res;
}
