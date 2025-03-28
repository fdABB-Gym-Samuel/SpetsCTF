import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const ctfId = Number(event.params.ctf_id);
	const scores = await db
		.with('team_challenges', (qb) =>
			qb
				.selectFrom('ctf_submissions')
				.innerJoin('ctf_teams_members', 'ctf_submissions.user_id', 'ctf_teams_members.user_id')
				.innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
				.where('ctf_teams.ctf', '=', ctfId)
				.innerJoin('challenges', 'ctf_submissions.challenge', 'challenges.challenge_id')
				.where('challenges.ctf', '=', ctfId)
				.select([
					'ctf_teams.id as team_id',
					'ctf_teams.name as team_name',
					'ctf_submissions.challenge as challenge_id',
					'challenges.points as points'
				])
				.where('ctf_submissions.success', '=', true)
				// Group by team and challenge so each challenge is counted only once per team
				.groupBy([
					'ctf_teams.id',
					'ctf_teams.name',
					'ctf_submissions.challenge',
					'challenges.points'
				])
		)
		.selectFrom('team_challenges')
		.select(['team_id', 'team_name', sql`sum(points)`.as('total_points')])
		.groupBy(['team_id', 'team_name'])
		.orderBy('total_points', 'desc')
		.execute();

	return { scores };
};
