import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals }: ServerLoadEvent) => {
	const user_id = locals.user?.id;

	const challenges = await db
		// First CTE: get each user's earliest successful submission per challenge.
		.with('unique_success', (qb) =>
			qb
				.selectFrom('wargame_submissions')
				.select(['challenge', 'user_id'])
				.select(sql`MIN(time)`.as('first_time'))
				.where('success', '=', true)
				.groupBy(['challenge', 'user_id'])
		)
		// Second CTE: rank these unique successful submissions per challenge.
		.with('ranked_submissions', (qb) =>
			qb
				.selectFrom('unique_success')
				.select(['challenge', 'user_id', 'first_time'])
				.select(sql`ROW_NUMBER() OVER (PARTITION BY challenge ORDER BY first_time)`.as('rn'))
		)
		// Main query: join challenges, ranked submissions, users, flag, and ctf_events.
		.selectFrom('challenges as ch')
		.leftJoin('ranked_submissions as rs', 'ch.challenge_id', 'rs.challenge')
		.leftJoin('users as u', 'rs.user_id', 'u.id')
		.leftJoin('flag as f', 'ch.flag', 'f.id')
		.leftJoin('ctf_events as ctf', 'ch.ctf', 'ctf.id')
		.leftJoin('users as a', 'ch.author', 'a.id')
		.where(sql<boolean>`ctf.end_time IS NULL OR ctf.end_time < NOW()`)
		.groupBy([
			'ch.challenge_id',
			'ch.display_name',
			'ch.description',
			'ch.points',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'a.display_name',
			'a.id',
			'f.flag_format',
			'ctf.end_time'
		])
		.select([
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.description as challenge_description',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			'a.display_name as author',
			'a.id as author_id',
			'f.flag_format',
			// Aggregate up to the first 5 solver display_names into a JSON array, ordered by submission time.
			sql`
			  COALESCE(
				JSON_AGG(
				  json_build_object('display_name', u.display_name)
				  ORDER BY rs.first_time
				) FILTER (WHERE rs.rn <= 5),
				'[]'::json
			  )
			`.as('first_solvers'),
			// Count the total number of unique successful solves for the challenge.
			sql`(
			  SELECT COUNT(*)
			  FROM unique_success us
			  WHERE us.challenge = ch.challenge_id
			)`.as('num_solves'),
			// Check if the current user has a successful submission on this challenge.
			sql`EXISTS(
			  SELECT 1 FROM wargame_submissions ws
			  WHERE ws.challenge = ch.challenge_id
				AND ws.user_id = ${user_id}
				AND ws.success = true
			)`.as('solved'),
			// Get an array of resources for the challenge (ordered by resource id).
			sql`
			  COALESCE(
				(
				  SELECT JSON_AGG(
					json_build_object('type', cr.type, 'content', cr.content)
					ORDER BY cr.id
				  )
				  FROM challenge_resources cr
				  WHERE cr.challenge = ch.challenge_id
				),
				'[]'::json
			  )
			`.as('resources')
		])
		.orderBy('ch.points', 'asc')
		.execute();

	return { challenges };
};
