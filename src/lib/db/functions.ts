import type { Pool } from "pg";
import type { Challenge } from './schema';
import { Category } from './schema';

export function validateCategory(value: any): Category {
    const normalizedValue = typeof value === "string" ? value.toLowerCase() : "";
    return (Object.values(Category) as string[]).includes(normalizedValue)
        ? (normalizedValue as Category)
        : Category.misc;
}

export async function insertChallenge(pool: Pool, challenge: Challenge) {
  const query = 'INSERT INTO challenges (challenge_id, points, challenge_category) VALUES ($1, $2, $3) RETURNING challenge_id;';
  const values = [challenge.challenge_id, challenge.points, challenge.challenge_category];

  const client = await pool.connect();

  try {
    const res = await client.query(query, values);
    return res.rows;
  } catch (err) {
    return [];
  } finally {
    client.release();
  }
}
