import type { PageServerLoad } from './$types';
import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import { type Insertable, sql } from 'kysely';
import type { WargameSubmissions } from '$lib/generated/db';
import { get_flag_of_challenge } from '$lib/db/functions';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
    const { translations } = await parent();

    const user = locals.user;
    const challengeData = await db
        .selectFrom('challenges')
        .innerJoin('flag', 'challenges.flag', 'flag.id')
        .where('challenge_id', '=', params.challengeId)
        .selectAll(['challenges'])
        .select('flag.flag_format')
        .select((_) =>
            sql<boolean>`EXISTS(
                SELECT 1 FROM wargame_submissions ws
                WHERE ws.challenge = challenges.challenge_id
                    AND ws.user_id = ${user?.id ?? null}
                    AND ws.success = true
            )`.as('solved')
        )
        .executeTakeFirst();

    if (!challengeData) {
        error(404, 'Challenge not found');
    }

    const firstSolvers = await db
        .with('all_submissions', (qb) =>
            qb
                .selectFrom('ctf_submissions')
                .where('challenge', '=', challengeData.challenge_id)
                .where('success', '=', true)
                .select(['user_id', 'time'])
                .union(
                    qb
                        .selectFrom('wargame_submissions')
                        .where('challenge', '=', challengeData.challenge_id)
                        .where('success', '=', true)
                        .select(['user_id', 'time'])
                )
        )
        .with('first_solve_per_user', (qb) =>
            qb
                .selectFrom('all_submissions')
                .select(['user_id'])
                .select(sql`MIN(time)`.as('first_time'))
                .groupBy('user_id')
        )
        .selectFrom('first_solve_per_user')
        .innerJoin('users', 'users.id', 'first_solve_per_user.user_id')
        .orderBy('first_solve_per_user.first_time', 'asc')
        .selectAll('users')
        .limit(5)
        .execute();

    const resources = await db
        .selectFrom('challenge_resources')
        .where('challenge', '=', challengeData.challenge_id)
        .selectAll()
        .execute();

    const numSolvers = await db
        .selectFrom('ctf_submissions')
        .where('challenge', '=', challengeData.challenge_id)
        .where('success', '=', true)
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirstOrThrow();

    return {
        challengeData,
        firstSolvers,
        numSolvers,
        resources,
        translations,
    };
};

export const actions = {
    submit: async ({ request, locals }) => {
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

        let submissionTable: 'wargame_submissions' | 'ctf_submissions' =
            'wargame_submissions';
        if (challengeCtf && challengeCtf.ctf) {
            const ctf = await db
                .selectFrom('ctf_events')
                .select(['end_time'])
                .where('id', '=', challengeCtf.ctf)
                .executeTakeFirst();

            if (ctf === undefined) {
                return fail(404, {
                    message: 'Challenge belongs to CTF that could not be found',
                });
            }
            const currentTime = new Date();
            const ctfHasEnded = currentTime > ctf?.end_time;
            // User should submit this request through the ctf route
            if (!ctfHasEnded) {
                redirect(307, `/ctf/${challengeCtf.ctf}/challenges?/submit`);
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
            fail(403, { message: 'User has already solved challenge' });

        const correctFlag = await get_flag_of_challenge(challengeId);
        if (!correctFlag.challengeExists) {
            fail(404, { message: 'Challenge not found' });
        }
        if (!correctFlag.flagExists) {
            return fail(404, { message: 'Flag of challenge not found' });
        }

        if (!correctFlag.flag)
            return fail(404, { message: 'Flag of challenge not found' });

        const flagIsCorrect = submittedFlag === correctFlag.flag;

        const submission: Insertable<WargameSubmissions> = {
            challenge: challengeId,
            user_id: user.id,
            time: new Date(),
            success: flagIsCorrect,
            submitted_data: submittedFlag,
        };

        const submissionResult = await db
            .insertInto('wargame_submissions')
            .values(submission)
            .executeTakeFirst();

        if (submissionResult === undefined) {
            return fail(500, {
                message: 'Youre submission could not be recorded, please try again.',
            });
        }

        const message = flagIsCorrect ? 'Correct flag' : 'Incorrect flag';

        return { success: flagIsCorrect, message };
    },
} satisfies Actions;
