import { db } from '$lib/db/database.js';
import { sql } from 'kysely';
import { error, json } from '@sveltejs/kit';
import type { SqlBool } from 'kysely';
import type { RequestHandler } from './$types';

interface SearchedUser {
    id: string;
    display_name: string;
    github_username: string;
}

export const GET: RequestHandler = async ({ url }) => {
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
            () =>
                sql<boolean>`
      			GREATEST(
        			similarity(github_username, ${query}),
        			similarity(display_name, ${query})
      			) > ${matchThreshold}
    	`
        )
        // same idea for orderBy: give it a factory returning RawBuilder<number>
        .orderBy(
            () =>
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

    const retval: SearchedUser[] = matchingUsers.map((elem) => {
        return {
            id: elem.id,
            display_name: elem.display_name ?? 'No display name',
            github_username: elem.github_username ?? 'No GitHub username',
        };
    });

    return json(retval);
};
