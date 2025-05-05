import { type ServerLoadEvent, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { type Insertable } from 'kysely';
import type { WargameSubmissions } from '$lib/db/db';
import { get_flag_of_challenge } from '$lib/db/functions';

export const load: PageServerLoad = async ({ locals }: ServerLoadEvent) => {
	const user = locals.user;

	const allChallenges = await db
		// First CTE: get each user's earliest successful submission per challenge.
		.with('unique_success', (qb) =>
			qb
				.selectFrom('wargame_submissions')
				.innerJoin('users', 'wargame_submissions.user_id', 'users.id')
				.where('is_admin', 'is not', true)
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
		// For some reason both of the ch.approved are needed, or else there are some challs that slip through the gap
		.where('ch.approved', '=', true)
		.where(sql<boolean>`ctf.end_time IS NULL OR ctf.end_time < NOW()`)
		.where('ch.approved', '=', true)
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
		.select((eb) => [
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.description as challenge_description',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			eb
				.case()
				.when(sql.ref('ch.anonymous_author'), '=', true)
				.then(sql.lit('Anonymous'))
				.else(sql.ref('a.display_name'))
				.end()
				.as('author'),
			// 'a.id as author_id',
			eb
				.case()
				.when(sql.ref('ch.anonymous_author'), '=', true)
				.then(sql.lit(null))
				.else(sql.ref('a.id'))
				.end()
				.as('author_id'),
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
				AND ws.user_id = ${user?.id}
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

	const myChallengesQuery = db
		.selectFrom('challenges as ch')
		.leftJoin('flag as f', 'ch.flag', 'f.id')
		.leftJoin('users as a', 'ch.author', 'a.id')
		.select([
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			sql<boolean>`ch.author = ${user?.id}`.as('is_author')
		]);

	let myChallenges;
	if (user) {
		if (!user?.is_admin) {
			myChallenges = await myChallengesQuery.where('ch.author', '=', user?.id ?? '').execute();
		} else {
			myChallenges = await myChallengesQuery.execute();
		}
	} else {
		myChallenges = null;
	}

	return { allChallenges, myChallenges };
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

			let submissionTable: 'wargame_submissions' | 'ctf_submissions' = 'wargame_submissions';
			if (challengeCtf && challengeCtf.ctf) {
				const ctf = await db
					.selectFrom('ctf_events')
					.select(['end_time'])
					.where('id', '=', challengeCtf.ctf)
					.executeTakeFirst();

				if (ctf === undefined) {
					return fail(404, { message: 'Challenge belongs to CTF that could not be found' });
				}
				const currentTime = new Date();
				const ctfHasEnded = currentTime > ctf?.end_time;
				// User should submit this request through the ctf route
				if (!ctfHasEnded) {
					throw redirect(307, `/ctf/${challengeCtf.ctf}/challenges?/submit`);
				}

				submissionTable = 'ctf_submissions';
			}

			const successfulSubmission = await db
				.selectFrom(submissionTable)
				.where('user_id', '=', user.id)
				.where('challenge', '=', challengeId)
				.where('success', '=', true)
				.executeTakeFirst();

			if (successfulSubmission !== undefined)
				return fail(403, { message: 'User has already solved challenge' });

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

			const submissionResult = await db
				.insertInto('wargame_submissions')
				.values(submission)
				.executeTakeFirst();

			if (submissionResult === undefined) {
				return fail(500, { message: 'Youre submission could not be recorded, please try again.' });
			}

			let message;
			flagIsCorrect ? (message = 'Correct flag') : (message = 'Incorrect flag');

			return { success: flagIsCorrect, message };
		} catch (err) {
			throw err;
		}
	},
	delete: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return redirect(304, '/login');
		}

		const formData = await request.formData();
		const challengeId = formData.get('challengeId') as string;

		const challengeAuthor = await db
			.selectFrom('challenges')
			.select('author')
			.where('challenge_id', '=', challengeId)
			.executeTakeFirst();

		if (challengeAuthor === undefined) {
			return fail(404, { message: 'Challenge not found' });
		}

		if (challengeAuthor.author !== user.id && !user.is_admin) {
			return fail(401, { message: 'User not author of challenge or admin' });
		}

		const deletedChallenge = await db
			.deleteFrom('challenges')
			.where('challenge_id', '=', challengeId)
			.executeTakeFirst();

		return { success: true, message: 'Challenge successfully deleted' };
	}
};
