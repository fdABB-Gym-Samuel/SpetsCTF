import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { getIsOrg } from '$lib/db/functions';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	try {

		const user = event.locals.user
		if (!user) {
			return { success: false, teamName: '', message: 'Log in to join a team' };
		}

		const ctfId = Number(event.params.ctf_id);

		const isOrg = await getIsOrg(user.id, ctfId)

		if (isOrg || user.is_admin) {
			return { success: false, message: 'Orgs and admins cannot join CTFs' };
		}

		const join_code = event.params.join_code ?? '';

		const ctf = await db
			.selectFrom('ctf_events')
			.select([
				'max_team_size as maxTeamSize',
				'display_name as displayName',
				'end_time as endTime'
			])
			.where('id', '=', ctfId)
			.executeTakeFirstOrThrow();

		if (!ctf) error(404, { message: 'CTF not found' });

		if (ctf?.endTime.getTime() < new Date().getTime()) {
			return { success: false, message: 'CTF is over' };
		}
		const team = await db
			.selectFrom('ctf_teams')
			.leftJoin('ctf_teams_members', 'ctf_teams.id', 'ctf_teams_members.team')
			.select([
				'ctf_teams.name as displayName',
				'ctf_teams.id as teamId',
				sql<number>`COUNT(ctf_teams_members.user_id)`.as('memberCount'),
				sql<string[]>`ARRAY_AGG(ctf_teams_members.user_id)`.as('members')
			])
			.where('ctf_teams.join_code', '=', join_code)
			.groupBy('ctf_teams.id')
			.executeTakeFirstOrThrow();

		if (!team) {
			return { success: false, message: 'No team found with join code.' };
		}

		// The SQL query makes it difficult for kysely to do type inference.
		if (team?.members.includes(user.id)) {
			return { success: false, message: 'User already part of team.' };
		}
		if (ctf.maxTeamSize !== null && ctf?.maxTeamSize <= team?.memberCount) {
			return { success: false, message: 'Team is full' };
		}

		const userTeam = await db
			.selectFrom('ctf_teams_members')
			.innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
			.select('ctf_teams.id as teamId')
			.where('ctf_teams_members.user_id', '=', user.id)
			.where('ctf_teams.ctf', '=', ctfId)
			.executeTakeFirst();

		if (userTeam) {
			return { success: false, message: 'User is already in a team for this CTF' };
		}

		await db
			.insertInto('ctf_teams_members')
			.values({
				user_id: user.id,
				team: team?.teamId
			})
			.execute();

		return { success: true, message: `Successfully joined team, ${team?.displayName}` };
	} catch (err) {
		const errorTyped = err as Error;
		return error(500, { message: 'Something went wrong' });
	}
};
