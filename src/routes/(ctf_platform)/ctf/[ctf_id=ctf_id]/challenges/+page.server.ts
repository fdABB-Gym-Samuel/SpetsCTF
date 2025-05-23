import { db } from '$lib/db/database';
import { error, fail, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { sql, type Insertable } from 'kysely';
import { get_flag_of_challenge, selectedCategoriesToBitset } from '$lib/db/functions';
import type { CtfSubmissions } from '$lib/db/db';
import { CssSyntaxError } from 'postcss';
import { TvMinimal } from '@lucide/svelte';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const user = event.locals.user;
	const ctfId = Number(event.params.ctf_id);
	const userId = user ? user.id : undefined;

	const allChallenges = await db
		.with('unique_success', (qb) =>
			qb
				.selectFrom('ctf_submissions')
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
		// Main query: join challenges, ranked submissions, users, and flag.
		.selectFrom('challenges as ch')
		.where('ch.ctf', '=', ctfId)
		.where('ch.approved', '=', true)
		.leftJoin('ranked_submissions as rs', 'ch.challenge_id', 'rs.challenge')
		.leftJoin('users as u', 'rs.user_id', 'u.id')
		.where('u.is_admin', 'is not', true)
		.leftJoin('flag as f', 'ch.flag', 'f.id')
		.leftJoin('users as a', 'ch.author', 'a.id')
		.groupBy([
			'ch.challenge_id',
			'ch.display_name',
			'ch.description',
			'ch.points',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'a.display_name',
			'a.id',
			'f.flag_format'
		])
		.select((eb) => [
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.description as challenge_description',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			'f.flag_format',
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
              SELECT 1 FROM ctf_submissions ws
              WHERE ws.challenge = ch.challenge_id
                AND ws.user_id = ${userId}
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
		.where('ctf', '=', ctfId)
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

			const ctfId = Number(params.ctf_id);
			const ctf = await db
				.selectFrom('ctf_events')
				.select(['start_time', 'end_time'])
				.where('id', '=', ctfId)
				.executeTakeFirst();

			if (ctf === undefined) {
				return fail(404, { message: 'CTF not found' });
			}

			const currentTime = new Date();
			const isOngoing = currentTime >= ctf.start_time && currentTime <= ctf.end_time;
			if (!isOngoing) {
				return fail(403, { messsage: 'CTF is not ongoing' });
			}

			const userTeam = await db
				.selectFrom('ctf_teams_members')
				.innerJoin('ctf_teams', 'ctf_teams.id', 'ctf_teams_members.team')
				.select([
					'ctf_teams.id as teamId',
					'ctf_teams.name as teamName',
					'ctf_teams.join_code as joinCode',
					'ctf_teams.website as website'
				])
				.where('ctf_teams_members.user_id', '=', user.id)
				.where('ctf_teams.ctf', '=', ctfId)
				.executeTakeFirst();

			if (userTeam === undefined) {
				return fail(401, { message: 'User not part of team for this CTF' });
			}

			const formData = await request.formData();
			const challengeId = formData.get('challenge_id') as string;
			const submittedFlag = formData.get('flag') as string;

			if (!challengeId) {
				return fail(400, { message: 'Challenge_id parameter missing' });
			}

			const successfulSubmission = await db
				.selectFrom('ctf_teams_members')
				.where('team', '=', userTeam.teamId)
				.innerJoin('ctf_submissions as cs', (join) =>
					join
						.onRef('cs.user_id', '=', 'ctf_teams_members.user_id')
						.on('cs.challenge', '=', challengeId)
						.on('cs.success', '=', true)
				)
				.select(['ctf_teams_members.user_id'])
				.execute();

			if (successfulSubmission.length >= 1) {
				return fail(403, { message: 'Team has already solved this challenge' });
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

			let submission: Insertable<CtfSubmissions> = {
				ctf: ctfId,
				challenge: challengeId,
				user_id: user.id,
				time: new Date(),
				success: flagIsCorrect,
				submitted_data: submittedFlag
			};

			const _ = await db.insertInto('ctf_submissions').values(submission).executeTakeFirst();

			let message;
			flagIsCorrect ? (message = 'Correct flag') : (message = 'Incorrect flag');

			return { success: flagIsCorrect, message };
		} catch (err) {
			throw err;
		}
	}
};
