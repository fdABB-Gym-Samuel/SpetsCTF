import { db } from '$lib/db/database.js';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { getIsOrg } from '$lib/db/functions';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user
	if (!user) {
		error(401, { message: 'User not logged in' });
	}

	const ctfId = Number(params.ctf_id);

	const isOrg = await getIsOrg(user.id, ctfId)

	if (isOrg || user.is_admin) {
		return error(403, { message: 'Orgs and admins cannot join CTFs' });
	}
};

export const actions = {
	default: async ({ request, params, locals }) => {
		try {
			if (!locals.user) {
				error(401, { message: 'User not logged in' });
			}

			const ctf_id = Number(params.ctf_id);

			let org = await db
				.selectFrom('ctf_organizers')
				.where('ctf', '=', ctf_id)
				.where('user_id', '=', locals.user.id)
				.executeTakeFirst();

			const isOrg = org !== undefined;

			if (isOrg || locals.user.is_admin) {
				return fail(403, { message: 'Orgs and admins cannot join CTFs' });
			}

			const formData = await request.formData();
			const team_name = formData.get('team_name')?.toString();
			const team_website = formData.get('team_website')?.toString();

			const ctf = await db
				.selectFrom('ctf_events')
				.selectAll()
				.where('id', '=', ctf_id)
				.executeTakeFirst();

			if (ctf === undefined) {
				return fail(422, { message: 'CTF not found' });
			}

			if (ctf.end_time.getTime() < new Date().getTime())
				return fail(400, { message: 'CTF is over' });

			const current_user_team = await db
				.selectFrom('ctf_teams_members')
				.innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
				.innerJoin('ctf_events', 'ctf_teams.ctf', 'ctf_events.id')
				.select([
					'ctf_teams.id as teamId',
					'ctf_teams.name as teamName',
					'ctf_teams.website',
					'ctf_events.short_name as eventShortName'
				])
				.where('ctf_teams_members.user_id', '=', locals.user.id)
				.where('ctf_teams.ctf', '=', ctf_id)
				.executeTakeFirst();

			if (current_user_team !== undefined) {
				return fail(401, { success: false, message: 'User is already in team' });
			}

			if (!team_name) {
				return fail(422, { success: false, message: 'No team name' });
			}

			const team_id = await db
				.insertInto('ctf_teams')
				.values({
					name: team_name,
					website: team_website,
					ctf: ctf_id
				})
				.returning('id')
				.executeTakeFirst();

			if (team_id === undefined) {
				return fail(500, { success: false, message: 'Unknown error' });
			}

			await db
				.insertInto('ctf_teams_members')
				.values({
					user_id: locals.user.id,
					team: team_id.id
				})
				.execute();

			redirect(303, `/ctf/${ctf_id}/team/${team_id.id}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && (err as any).status === 303) {
				throw err;
			}

			return fail(500, { success: false, message: 'Something went wrong' });
		}
	}
} satisfies Actions;
