import { db } from '$lib/db/database';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { sql } from 'kysely';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }: ServerLoadEvent) => {
    const userId = locals.user?.id ?? null;
    const teamId = Number(params.teamId);
    const ctfId = Number(params.ctf_id);

    const teamData = await db
        .selectFrom('ctf_teams as t')
        .select([
            't.name',
            't.website',
            't.id',
            sql<string[]>`
                (
                    SELECT t.join_code
                    FROM ctf_teams_members m
                    WHERE m.team = t.id
                    AND m.user_id = ${userId}
                    LIMIT 1
                )
            `.as('join_code'),
            sql<{ display_name: string; id: string }[]>`
                (
                    SELECT json_agg(json_build_object(
                        'display_name', COALESCE(u.display_name, ''),
                        'id', CASE 
                            WHEN u.display_name IS NOT NULL AND u.display_name != '' 
                            THEN u.id 
                            ELSE '00000000-0000-0000-0000-000000000000' 
                        END
                    ))                    
                    FROM ctf_teams_members m
                    INNER JOIN users u ON u.id = m.user_id
                    WHERE m.team = t.id
                )
            `.as('users'),
        ])
        .where('t.id', '=', teamId)
        .where('t.ctf', '=', ctfId)
        .executeTakeFirst();

    if (teamData === undefined) {
        return error(404, { message: 'Team not found.' });
    }

    return { teamData };
};

export const actions = {
    default: async ({ locals, params }) => {
        const user = locals.user;

        if (!user) {
            return error(403, { message: 'User not logged in.' });
        }
        const teamId = Number(params.teamId);

        const userOnTeam = await db
            .selectFrom('ctf_teams_members')
            .selectAll()
            .where('team', '=', teamId)
            .where('user_id', '=', user.id)
            .executeTakeFirst();

        if (!userOnTeam) {
            return error(400, { message: 'User is not a member of this team.' });
        }

        const removeUser = await db
            .deleteFrom('ctf_teams_members')
            .where('team', '=', teamId)
            .where('user_id', '=', user.id)
            .returningAll()
            .execute();

        if (!removeUser) {
            return error(500, { message: 'Unable to remove user from team.' });
        }

        const teamMembers = await db
            .selectFrom('ctf_teams_members')
            .selectAll()
            .where('team', '=', teamId)
            .execute();

        if (teamMembers.length === 0) {
            await db.deleteFrom('ctf_teams').where('id', '=', teamId).execute();
        } else {
            return { success: true };
        }

        // Redirect to CTF main page since team no longer exists
        redirect(303, `/ctf/${params.ctf_id}`);
    },
};
