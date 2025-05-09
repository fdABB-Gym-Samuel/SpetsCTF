import { db } from '$lib/db/database.js';
import { sql } from 'kysely';
import { json } from '@sveltejs/kit';

export const GET = async ({ url, locals }) => {
	const query = url.searchParams.get('q');
	const matchThreshold = 0;
	const matchingUsers = await db
		.selectFrom('users')
		.select([
			'id',
			'github_username',
			'display_name',
			// compute the score column as before
			sql<number>`
      			GREATEST(
        			similarity(github_username, ${query}),
        			similarity(display_name, ${query})
      			)
    		`.as('score')
		])
		// wrap the raw SQL in a factory so it’s ExpressionOrFactory<…, SqlBool>
		.where(
			(eb) =>
				sql<boolean>`
      			GREATEST(
        			similarity(github_username, ${query}),
        			similarity(display_name, ${query})
      			) > ${matchThreshold}
    	`
		)
		// same idea for orderBy: give it a factory returning RawBuilder<number>
		.orderBy(
			(eb) =>
				sql<number>`
      			GREATEST(
        			similarity(github_username, ${query}),
        			similarity(display_name, ${query})
      			)
    		`,
			'desc'
		)
		.limit(20)
		.execute();

	return json(matchingUsers);
};
