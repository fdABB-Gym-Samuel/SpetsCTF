import { error, fail, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { getIsOrg } from '$lib/db/functions';

export const load = async ({ locals, params }: ServerLoadEvent) => {
	const user = locals.user;
	const ctfId = Number(params.ctf_id);
	if (!user) {
		return redirect(303, '/login');
	}

	const isOrg = await getIsOrg(user.id, ctfId);

	if (!user.is_admin && !isOrg) {
		return error(401, { message: 'Not authorized' });
	}
};

export const actions = {
	addOrg: async ({ request, locals, params }) => {
		const user = locals.user;
		const ctfId = Number(params.ctf_id);

		if (!user) {
			return redirect(303, '/login');
		}

		const isOrg = await getIsOrg(user.id, ctfId);

		if (!user.is_admin && !isOrg) {
			return fail(401, { message: 'User not organizer of CTF or admin' });
		}

		const ctf = await db
			.selectFrom('ctf_events')
			.select('end_time')
			.where('id', '=', ctfId)
			.executeTakeFirst();

		if (ctf === undefined) {
			return fail(404, { message: 'CTF not found' });
		}
		if (ctf?.end_time < new Date()) {
			return fail(403, { message: 'CTF has already ended' });
		}

		const formData = await request.formData();
		const newOrgs = formData.getAll('newOrg') as string[];

		const currentOrgs = await db
			.selectFrom('users')
			.select(['users.id', 'display_name'])
			.where((eb) =>
				eb.or([
					// site‐wide admins
					eb('users.is_admin', '=', true),

					// OR users who exist in ctf_organizers for this CTF
					eb
						.unary(
							'exists',
							db
								.selectFrom('ctf_organizers')
								// .select(sql`1`)
								.whereRef('ctf_organizers.user_id', '=', 'users.id')
								.where('ctf_organizers.ctf', '=', ctfId)
						)
						.$castTo<boolean>()
				])
			)
			.execute();

		const uniqueNewOrgs = newOrgs.filter(
			(newOrg) => !currentOrgs.some((oldOrg) => oldOrg.id === newOrg)
		);

		for (let newOrg of uniqueNewOrgs) {
			console.log(newOrg, 'newOrg');
			const team = await db
				.selectFrom('ctf_teams as t')
				// pull whatever team fields you need:
				.select(['t.id'])
				// count all members via the join alias "m":
				.select(db.fn.count('m.user_id').as('member_count'))
				.innerJoin('ctf_teams_members as m', 'm.team', 't.id')
				// now filter: same CTF AND user must be on that team
				.where((eb) =>
					eb.and([
						eb('t.ctf', '=', ctfId),
						eb.exists(
							db
								.selectFrom('ctf_teams_members as mem')
								// .select(sql`1`)
								.whereRef('mem.team', '=', 't.id')
								.where('mem.user_id', '=', newOrg)
						)
					])
				)
				.groupBy('t.id')
				.executeTakeFirst();

			if (team !== undefined) {
				const _orgRemovedFromTeam = await db
					.deleteFrom('ctf_teams_members')
					.where('team', '=', team.id)
					.where('user_id', '=', newOrg)
					.executeTakeFirstOrThrow();

				if (Number(team.member_count) < 2) {
					const _deletedTeam = await db
						.deleteFrom('ctf_teams')
						.where('ctf_teams.id', '=', team.id)
						.executeTakeFirstOrThrow();
				}
			}

			const insertedOrg = await db
				.insertInto('ctf_organizers')
				.values({
					user_id: newOrg,
					ctf: ctfId
				})
				.returning('user_id')
				.executeTakeFirst();

			if (insertedOrg === undefined) {
				console.error(`Failed to insert new organizer with id: ${newOrg}`);
			}
		}
		return { success: true, message: 'All new orgs inserted successfully' };
	}
};
