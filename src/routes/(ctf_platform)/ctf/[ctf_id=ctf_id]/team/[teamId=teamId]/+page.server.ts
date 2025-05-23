import { db } from '$lib/db/database';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { sql } from 'kysely';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }: ServerLoadEvent) => {
	const userId = locals.user?.id ?? null;
	const teamId = Number(params.teamId);
	const ctfId = Number(params.ctf_id);

	const teamData = await db
		.selectFrom('ctf_teams as t')
		.select([
			't.name',
			't.website',
			sql<string>`
                (
                    SELECT t.join_code
                    FROM ctf_teams_members m
                    WHERE m.team = t.id
                    AND m.user_id = ${userId}
                    LIMIT 1
                )
            `.as('join_code'),
			sql<string[]>`
                (
                    SELECT json_agg(u.display_name)
                    FROM ctf_teams_members m
                    INNER JOIN users u ON u.id = m.user_id
                    WHERE m.team = t.id
                )
            `.as('users')
		])
		.where('t.id', '=', teamId)
		.where('t.ctf', '=', ctfId)
		.executeTakeFirst();

	if (teamData === undefined) {
		return error(404, { message: 'Team not found.' });
	}

	return { teamData };
};
