import { type ServerLoadEvent, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { type Insertable } from 'kysely';
import type { WargameSubmissions } from '$lib/db/db';
import { get_flag_of_challenge } from '$lib/db/functions';

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
		.where('ch.approved', '=', true)
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

export const actions = {
	submit: async ({ request, locals, params }) => {
		try {
			const user = locals.user;

			if (!user) {
				return redirect(304, '/login');
			}

			const formData = await request.formData();
			const challengeId = formData.get('challenge_id') as string;
			const submittedFlag = formData.get('flag') as string;

			if (!challengeId) {
				return fail(400, { message: 'Challenge_id parameter missing' });
			}

			const challengeCtf = await db
				.selectFrom('challenges')
				.select('ctf')
				.where('challenge_id', '=', challengeId)
				.executeTakeFirst();

			if (challengeCtf && challengeCtf.ctf) {
				const ctf = await db
					.selectFrom('ctf_events')
					.select(['end_time'])
					.where('id', '=', challengeCtf.ctf)
					.executeTakeFirst();

				const currentTime = new Date();
				if (!ctf) {
					return fail(500, { message: 'Challenge belongs to ctf with unclear end-time' });
				}
				// User should submit this request through the ctf route
				const ctfHasEnded = currentTime > ctf?.end_time;
				if (!ctfHasEnded) {
					throw redirect(307, `/ctf/${challengeCtf.ctf}/challenges?/submit`);
				}
			}

			const correctFlag = await get_flag_of_challenge(challengeId);

			if (!correctFlag.challengeExists) {
				return fail(404, { message: 'Challenge not found' });
			}
			if (!correctFlag.flagExists) {
				return fail(404, { message: 'Flag of challenge not found' });
			}

			if (!correctFlag.flag) return fail(404, { message: 'Flag of challenge not found' });

			const flagIsCorrect = submittedFlag === correctFlag.flag;

			let submission: Insertable<WargameSubmissions> = {
				challenge: challengeId,
				user_id: user.id,
				time: new Date(),
				success: flagIsCorrect,
				submitted_data: submittedFlag
			};

			const _ = await db.insertInto('wargame_submissions').values(submission).executeTakeFirst();

			let message;
			flagIsCorrect ? (message = 'Correct flag') : (message = 'Incorrect flag');

			return { success: flagIsCorrect, message };
		} catch (err) {
			throw err;
		}
	}
};
