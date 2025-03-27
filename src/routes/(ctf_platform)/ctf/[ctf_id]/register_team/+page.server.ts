import { db } from '$lib/db/database.js';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, params, locals }) => {
		try {
			if (!locals.user) {
				error(401, { message: 'User not logged in' });
			}

			const formData = await request.formData();
			const team_name = formData.get('team_name')?.toString();
			const team_website = formData.get('team_website')?.toString();
			const ctf_id = parseInt(params.ctf_id ?? ''); // TODO replace with safer function

			const ctf_exists = await db
				.selectFrom('ctf_events')
				.where('id', '=', ctf_id)
				.executeTakeFirst();

			console.log(ctf_exists);
			if (ctf_exists === undefined) {
				return fail(422, { success: false, message: 'CTF does not exist' });
			}

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
				return fail(400, { success: false, message: 'User is already in team' });
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

			if (!team_id) {
				return fail(500, { success: false, message: 'Unknown error' });
			}

			const user_team = await db
				.insertInto('ctf_teams_members')
				.values({
					user_id: locals.user.id,
					team: team_id.id
				})
				.executeTakeFirst();

			redirect(303, `/ctf/${ctf_id}/team`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && (err as any).status === 303) {
				throw err;
			}

			return fail(500, { success: false, message: 'Something went wrong' });
		}
	}
} satisfies Actions;
