import { db } from '$lib/db/database.js';
import { sql } from 'kysely';
import { json } from '@sveltejs/kit';
import type { WargameSubmissions } from '$lib/db/db';
import type { Insertable } from 'kysely';

export const GET = async ({ url, locals }) => {
	const query = url.searchParams.get('q');
	const matchThreshold = 0;
	const matchinUsers = await db
		.selectFrom('users')
		.select([
			'id',
			'display_name',
			'github_username',
			sql<number>`similarity(github_username, ${query})`.as('score')
		])
		.orderBy(sql`similarity(github_username, ${query})`, 'desc')
		.limit(20) // ← only take the 20 best
		.execute();

	return json(matchinUsers);
};
