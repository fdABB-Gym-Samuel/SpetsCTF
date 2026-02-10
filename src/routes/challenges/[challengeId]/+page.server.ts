import type { PageServerLoad } from './$types';
import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import { type Insertable, sql } from 'kysely';
import type { WargameSubmissions } from '$lib/generated/db';
import { getFlagOfChallenge } from '$lib/db/functions';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ params, parent, locals, depends }) => {
    const { translations } = await parent();

    const user = locals.user;
    const challengeData = await db
        .selectFrom('challenges')
        .innerJoin('flag', 'challenges.flag', 'flag.id')
        .innerJoin('users', 'challenges.author', 'users.id')
        .leftJoin('ctf_events', 'challenges.ctf', 'ctf_events.id')
        .where((eb) =>
            eb.or([
                eb('ctf_events.id', 'is', null),
                eb('ctf_events.end_time', '<=', new Date()),
            ])
        )
        .where('challenge_id', '=', params.challengeId)
        .select([
            'challenges.anonymous_author',
            'challenges.approved',
            'challenges.challenge_category',
            'challenges.challenge_id',
            'challenges.challenge_sub_categories',
            'challenges.created_at',
            'challenges.ctf',
            'challenges.description',
            'challenges.display_name',
            'challenges.flag',
            'challenges.points',
            'migrate_to_wargames',
        ])
        .select('flag.flag_format')
        .select([
            'challenges.author as author_id',
            sql<string>`
                CASE 
                    WHEN challenges.anonymous_author = true THEN '' 
                    ELSE COALESCE(users.display_name, '') 
                END
            `.as('author'),
        ])

        .select(() =>
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

    if (
        (!challengeData.approved || !challengeData.migrate_to_wargames) &&
        !user?.is_admin &&
        user?.id !== challengeData.author_id
    ) {
        error(404, 'Challenge not found');
    }

    if (challengeData.anonymous_author || challengeData.author === '') {
        challengeData.author_id = '00000000-0000-0000-0000-000000000000';
    }

    const firstSolvers = await db
        .with('first_solve_per_user', (qb) =>
            qb
                .selectFrom('wargame_submissions')
                .where('challenge', '=', challengeData.challenge_id)
                .where('success', '=', true)
                .select(['user_id'])
                .select(sql`MIN(time)`.as('first_time'))
                .groupBy('user_id')
        )
        .selectFrom('first_solve_per_user')
        .innerJoin('users', 'users.id', 'first_solve_per_user.user_id')
        .where('is_admin', '!=', true)
        .orderBy('first_solve_per_user.first_time', 'asc')
        .select([
            'users.display_name',
            sql<string>`
                case
                    when users.display_name is null or users.display_name = '' then '00000000-0000-0000-0000-000000000000'
                    else users.id
                end
            `.as('id'),
        ])
        .limit(5)
        .execute();

    const resources = await db
        .selectFrom('challenge_resources')
        .where('challenge', '=', challengeData.challenge_id)
        .selectAll()
        .execute();

    const numSolvers = await db
        .selectFrom('wargame_submissions')
        .innerJoin('users', 'users.id', 'wargame_submissions.user_id')
        .where('wargame_submissions.success', '=', true)
        .where('wargame_submissions.challenge', '=', challengeData.challenge_id)
        .where('users.is_admin', '!=', true)
        .select((eb) =>
            eb.fn.count<number>('wargame_submissions.user_id').distinct().as('count')
        )
        .executeTakeFirst();

    depends(`data:challenge-${challengeData.challenge_id}`);

    return {
        challengeData,
        firstSolvers,
        numSolvers: numSolvers?.count ?? 0,
        resources,
        translations,
        user,
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
            return fail(403, { message: 'User has already solved challenge' });

        const correctFlag = await getFlagOfChallenge(challengeId);
        if (!correctFlag.challengeExists) {
            return fail(404, { message: 'Challenge not found' });
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
