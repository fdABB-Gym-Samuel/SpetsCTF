import { error, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import type { Category } from '$lib/db/db';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const session = event.locals.user;
	const wantedUserId = event.params.userId;

	if (session && wantedUserId === session.id) throw redirect(303, '/user');

	if (!wantedUserId) return;

	try {
		const userInfo = await db
			.selectFrom('users')
			.select((eb) => [
				// Select the basic user data.
				'users.id',
				'users.display_name as displayName',

				// Subquery for successful wargame submissions with challenge data.
				eb
					.selectFrom('wargame_submissions')
					.innerJoin('challenges', 'wargame_submissions.challenge', 'challenges.challenge_id')
					.select((eb2) => [
						sql<
							ArrayLike<{
								id: string;
								challenge_name: string;
								points: number;
								description: string;
								challenge_category: Category;
							}>
						>`json_agg(json_build_object(
                    'id', challenges.challenge_id,
                    'challenge_name', challenges.display_name,
                    'points', challenges.points,
                    'description', challenges.description,
                    'challenge_category', challenges.challenge_category
                  ))`.as('solves')
					])
					.whereRef('wargame_submissions.user_id', '=', 'users.id')
					.where('wargame_submissions.success', '=', true)
					.as('solves'),

				// Subquery for challenges authored by the user.
				eb
					.selectFrom('challenges')
					.select((eb2) => [
						sql<
							ArrayLike<{
								id: string;
								challenge_name: string;
								points: number;
								description: string;
								challenge_category: Category;
							}>
						>`json_agg(json_build_object(
                    'id', challenges.challenge_id,
                    'challenge_name', challenges.display_name,
                    'points', challenges.points,
                    'description', challenges.description,
                    'challenge_category', challenges.challenge_category
                  ))`.as('authoredChallenges')
					])
					.whereRef('challenges.author', '=', 'users.id')
					.as('authoredChallenges'),

				// Subquery for CTFS where the user is a team member.
				eb
					.selectFrom('ctf_teams_members')
					.innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
					.innerJoin('ctf_events', 'ctf_teams.ctf', 'ctf_events.id')
					.select((eb2) => [
						sql<ArrayLike<{
							ctfId: number;
							ctfName: string;
							teamId: number;
							teamName: string;
						}> | null>`json_agg(json_build_object(
                    'ctfId', ctf_events.id,
                    'ctfName', ctf_events.display_name,
                    'teamId', ctf_teams.id,
                    'teamName', ctf_teams.name
                  ))`.as('ctfs')
					])
					.whereRef('ctf_teams_members.user_id', '=', 'users.id')
					.as('ctfs')
			])
			.where('users.id', '=', wantedUserId)
			.executeTakeFirst();

		if (userInfo === undefined) {
			throw error(404, { message: 'No User with that id' });
		} else {
			return { userInfo };
		}
	} catch (err) {
		throw err;
	}
};
