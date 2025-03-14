import type { Pool } from 'pg';
import type { Challenge } from './schema';
import { Category } from './schema';

export function validateCategory(value: any): Category {
	const normalizedValue = typeof value === 'string' ? value.toLowerCase() : '';
	return (Object.values(Category) as string[]).includes(normalizedValue)
		? (normalizedValue as Category)
		: Category.misc;
}

export async function insertChallenge(pool: Pool, challenge: Challenge) {
	const query =
		'INSERT INTO challenges (challenge_id, points, challenge_category, display_name, flag, flag_format) VALUES ($1, $2, $3, $4, $5, $6) RETURNING challenge_id;';
	const values = [challenge.challenge_id, challenge.points, challenge.challenge_category, challenge.display_name, challenge.flag, challenge.flag_format];

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
