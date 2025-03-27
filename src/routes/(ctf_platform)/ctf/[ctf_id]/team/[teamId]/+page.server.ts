import { db } from "$lib/db/database";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { sql } from "kysely";

export const load: PageLoad = async (event:ServerLoadEvent) => {
    const teamData = await db
        .selectFrom('ctf_teams as t')
        .select([
          't.name',
          't.website',
          // Conditionally select join_code if the current user is a member.
          sql`
            (
              SELECT t.join_code
              FROM ctf_teams_members m
              WHERE m.team = t.id
                AND m.user_id = ${event.locals.user.id}
              LIMIT 1
            )
          `.as('join_code'),
          // Aggregate all team members as JSON
          sql`
            (
              SELECT json_agg(u.display_name)
              FROM ctf_teams_members m
              INNER JOIN users u ON u.id = m.user_id
              WHERE m.team = t.id
            )
          `.as('users')
        ])
        .where('t.id', '=', event.params.teamId)
        .where('t.ctf', '=', event.params.ctf_id)
        .executeTakeFirst()

    return {teamData}
};