import type { Pool } from 'pg';
import type { Challenge, Session, User } from './schema';
import { Category } from './schema';
import pool from './pgpool';
import { createHash } from 'node:crypto';

export function validateCategory(value: any): Category {
	const normalizedValue = typeof value === 'string' ? value.toLowerCase() : '';
	return (Object.values(Category) as string[]).includes(normalizedValue)
		? (normalizedValue as Category)
		: Category.misc;
}

export async function insertChallenge(pool: Pool, challenge: Challenge) {
	const query =
		'INSERT INTO challenges (challenge_id, points, challenge_category, display_name, flag, flag_format) VALUES ($1, $2, $3, $4, $5, $6) RETURNING challenge_id;';
	const values = [
		challenge.challenge_id,
		challenge.points,
		challenge.challenge_category,
		challenge.display_name,
		challenge.flag,
		challenge.flag_format
	];

	const client = await pool.connect();

	try {
		const res = await client.query(query, values);
		return res.rows;
	} catch (err) {
		console.error('Failed to insert:', err);
		return [];
	} finally {
		client.release();
	}
}

export async function selectChallenges(pool: Pool): Promise<Challenge[]> {
	const query = 'SELECT * FROM challenges;';

	const client = await pool.connect();

	try {
		const res = await client.query(query);
		return res.rows.map((row) => ({
			challenge_category: row.challenge_category,
			challenge_id: row.challenge_id,
			points: row.points,
			display_name: row.display_name,
			flag: row.flag,
			flag_format: row.flag_format
		}));
	} catch (err) {
		console.error('Failed to select:', err);
		return [];
	} finally {
		client.release();
	}
}

export function generateSessionToken(): string {
	const token = crypto.randomUUID();
	return token;
}

export async function createSession(token: string, user_id: string): Promise<Session> {
	const sessionIdHash = createHash('sha256').update(new TextEncoder().encode(token)).digest('hex');
	const session: Session = {
		id: sessionIdHash,
		user_id,
		expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 day expiration
	};
	pool.query('INSERT INTO user_sessions (id, user_id, expires_at) VALUES ($1, $2, $3);', [
		session.id,
		session.user_id,
		session.expires_at
	]);
	return session;
}

export type SessionValidationResult = { session: Session } | { session: null };

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionIdHash = createHash('sha256').update(new TextEncoder().encode(token)).digest('hex');
	const res = await pool.query(
		'SELECT user_sessions.id, user_sessions.user_id, user_sessions.expires_at, users.id FROM user_sessions INNER JOIN users ON users.id = user_sessions.user_id WHERE user_sessions.id = $1;',
		[sessionIdHash]
	);

	if (!res.rows) {
		return { session: null };
	}
	const session: Session = {
		id: res.rows[0].id,
		user_id: res.rows[0].user_id,
		expires_at: res.rows[0].expires_at
	};

	if (Date.now() >= session.expires_at.getTime()) {
		pool.query('DELETE FROM user_sessions WHERE id = $1;', [sessionIdHash]);
		return { session: null };
	}

	if (Date.now() >= session.expires_at.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		pool.query('UPDATE user_sessions SET expires_at = $1 WHERE id = $2;', [
			session.expires_at,
			sessionIdHash
		]);
	}

	return { session };
}

export async function invalidateSession(session_id: string): Promise<void> {
	pool.query('DELETE FROM user_sessions WHERE id = $1;', [session_id]);
}

export async function invalidateAllSessions(user_id: string): Promise<void> {
	pool.query('DELETE FROM user_sessions WHERE user_id = $1;', [user_id]);
}
