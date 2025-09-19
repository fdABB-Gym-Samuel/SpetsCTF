import { db } from '$lib/db/database.js';
import { sql } from 'kysely';
import { json } from '@sveltejs/kit';
import type { SqlBool } from 'kysely';

export const GET = async ({ url, locals }) => {
    const query = url.searchParams.get('q');
    const ctfId = Number(url.searchParams.get('ctf'));
    const matchThreshold = 0;
    let matchingUsersQuery = db
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
    		`.as('score'),
        ])
        // wrap the raw SQL in a factory so it’s ExpressionOrFactory<…, SqlBool>
        .where('users.is_admin', 'is not', true)
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
        );
    if (ctfId) {
        matchingUsersQuery = matchingUsersQuery.where(sql<SqlBool>`
			NOT EXISTS (
			  SELECT 1
			  FROM ctf_organizers o
			  WHERE o.user_id = users.id
				AND o.ctf = ${ctfId}
			)
		  `);
    }
    const matchingUsers = await matchingUsersQuery.limit(20).execute();

    return json(matchingUsers);
};
