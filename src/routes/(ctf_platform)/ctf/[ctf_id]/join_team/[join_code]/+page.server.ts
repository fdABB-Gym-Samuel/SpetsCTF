import { type ServerLoadEvent } from "@sveltejs/kit";
import type { PageServerLoad } from "../../$types";
import { db } from "$lib/db/database";
import { sql } from "kysely";

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    try{
        if(!event.locals.user){
            return { success: false, teamName: "", message: "Log in to join a team"}
        }
        
        const ctfId = event.params.ctf_id
        const join_code = event.params.join_code

    
        const ctf = await db
            .selectFrom("ctf_events")
            .select([
                "max_team_size as maxTeamSize",
                "display_name as displayName",
                "end_time as endTime"
            ])
            .where("id", "=", ctfId)
            .executeTakeFirst()
    
        if(ctf?.endTime.getTime() < new Date().getTime()){
            return { success: false, message: "CTF is over" }
        }
        console.log(join_code)
        const team = await db
            .selectFrom('ctf_teams')
            .leftJoin('ctf_teams_members', 'ctf_teams.id', 'ctf_teams_members.team')
            .select([
              'ctf_teams.name as displayName',
              'ctf_teams.id as teamId',
              sql`COUNT(ctf_teams_members.user_id)`.as('memberCount'),
              sql`ARRAY_AGG(ctf_teams_members.user_id)`.as('members')
            ])
            // .where('ctf_teams.ctf', '=', ctfId)
            .where('ctf_teams.join_code', '=', join_code)
            .groupBy('ctf_teams.id')
            .executeTakeFirst();

        if (!team){
            return {success: false, message: "No team found with join code" }
        }
    
        if (team?.members.includes(event.locals.user.id)){
            return { success: false, message: "User already part of team" }
        }
        if (ctf?.maxTeamSize <= team?.memberCount){
            return { success: false, message: "Team is full" }
        }
        const userTeam = await db
            .selectFrom('ctf_teams_members')
            .innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
            .select('ctf_teams.id as teamId')
            .where('ctf_teams_members.user_id', '=', event.locals.user.id)
            .where('ctf_teams.ctf', '=', ctfId)
            .executeTakeFirst();

        if (userTeam){
            return { success: false, message: "User is already in a team for this CTF" }
        }
    
        const result = await db
            .insertInto("ctf_teams_members")
            .values({
                user_id: event.locals.user.id,
                team: team?.teamId
            })
            .execute()
        return {success: true, message: `Successfully joined team, ${team?.displayName}`}

    }
    catch (err){
        console.error(err)
        return { succes: false, message: "Something went wrong"}
    }

}