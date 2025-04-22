import type { PageServerLoad } from '../$types';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;

	if (!user) {
		return redirect(303, '/login');
	}

	const editableChallengesQuery = db
		.selectFrom('challenges as ch')
		.leftJoin('flag as f', 'ch.flag', 'f.id')
		.leftJoin('users as a', 'ch.author', 'a.id')
		.select([
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			sql<boolean>`ch.author = ${locals.user.id}`.as('is_author')
		]);

	let editableChallenges;
	if (!locals.user.is_admin) {
		editableChallenges = await editableChallengesQuery
			.where('ch.author', '=', locals.user.id)
			.execute();
	} else {
		editableChallenges = await editableChallengesQuery.execute();
	}

	return { editableChallenges };
};
