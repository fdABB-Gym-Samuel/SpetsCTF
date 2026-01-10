import { fail, redirect, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql, type Insertable } from 'kysely';
import type { Challenges } from '$lib/generated/db';
import { resolve } from '$app/paths';
import { formatRequestedName } from '$lib/utils/utils';

export const load: PageServerLoad = async ({ locals, depends }) => {
    const user = locals.user;

    depends('data:challenges');

    const allChallenges = await db
        .with('all_submissions', (qb) =>
            qb
                .selectFrom('wargame_submissions')
                .select(['challenge', 'user_id', 'time'])
                .where('success', '=', true)
                .union(
                    qb
                        .selectFrom('ctf_submissions')
                        .select(['challenge', 'user_id', 'time'])
                        .where('success', '=', true)
                )
        )
        .with('unique_success', (qb) =>
            qb
                .selectFrom('all_submissions')
                .innerJoin('users', 'all_submissions.user_id', 'users.id')
                .where('is_admin', 'is not', true)
                .select(['challenge', 'user_id'])
                .select(sql`MIN(time)`.as('first_time'))
                .groupBy(['challenge', 'user_id'])
        )
        .selectFrom('challenges')
        .leftJoin(
            'unique_success',
            'challenges.challenge_id',
            'unique_success.challenge'
        )
        .leftJoin('ctf_events', 'challenges.ctf', 'ctf_events.id')
        .where('challenges.approved', '=', true)
        .where(sql<boolean>`ctf_events.end_time IS NULL OR ctf_events.end_time < NOW()`)
        .groupBy('challenges.challenge_id')
        .select([
            'challenges.challenge_id',
            'challenges.display_name',
            'challenges.description',
            'challenges.points',
            'challenges.challenge_category',
            'challenges.challenge_sub_categories',
            'challenges.author',
            'challenges.anonymous_author',
            'challenges.approved',
            'challenges.created_at',
            'challenges.ctf',
            'challenges.flag',
        ])
        .select((eb) => [
            eb.fn.count<number>('unique_success.user_id').distinct().as('num_solvers'),
            sql<boolean>`EXISTS(
            SELECT 1 FROM (
                SELECT challenge, user_id FROM wargame_submissions WHERE success = true
                UNION
                SELECT challenge, user_id FROM ctf_submissions WHERE success = true
            ) unified
            WHERE unified.challenge = challenges.challenge_id
                AND unified.user_id = ${user?.id ?? null}
        )`.as('solved'),
        ])
        .orderBy('challenges.points', 'asc')
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
            sql<boolean>`ch.author = ${user?.id}`.as('is_author'),
        ]);

    let myChallenges;
    if (user) {
        if (!user?.is_admin) {
            myChallenges = await myChallengesQuery
                .where('ch.author', '=', user?.id ?? '')
                .execute();
        } else {
            myChallenges = await myChallengesQuery.execute();
        }
    } else {
        myChallenges = null;
    }

    return { allChallenges, myChallenges };
};

export const actions = {
    createChallenge: async ({ locals, request }) => {
        const user = locals.user;
        if (!user) {
            redirect(303, '/login');
        }

        const form = await request.formData();
        if (!form.has('name')) {
            return fail(400);
        }

        const requestedNameFormDataEntry = form.get('name');
        let requestedName: string = '';
        if (
            requestedNameFormDataEntry === null ||
            requestedNameFormDataEntry.toString() === ''
        ) {
            return fail(400);
        } else {
            requestedName = requestedNameFormDataEntry.toString();
        }

        const formattedRequestedName = formatRequestedName(requestedName);

        if (formattedRequestedName.length === 0) {
            return fail(400);
        }

        const existingChallengeWithSpecifiedName = await db
            .selectFrom('challenges')
            .where('challenge_id', '=', formattedRequestedName)
            .select('challenge_id')
            .executeTakeFirst();

        if (existingChallengeWithSpecifiedName) {
            return fail(409);
        }

        const newEmptyChallenge = await db.transaction().execute(async (trx) => {
            const newEmptyFlag = await trx
                .insertInto('flag')
                .values({
                    // These fields are empty here, editing a challenge will overwrite them.
                    flag: '',
                    flag_format: '',
                })
                .returning(['flag.id'])
                .executeTakeFirstOrThrow();

            const challengeStub: Insertable<Challenges> = {
                anonymous_author: null,
                approved: false,
                author: user.id,
                challenge_id: formattedRequestedName,
                challenge_sub_categories: '00000000',
                created_at: new Date(),
                ctf: null,
                description: '',
                display_name: requestedName,
                flag: newEmptyFlag.id,
                points: 0,
            };

            return await trx
                .insertInto('challenges')
                .values(challengeStub)
                .returningAll()
                .executeTakeFirst();
        });

        if (!newEmptyChallenge) {
            error(500, { message: 'Failed to create new challenge stub.' });
        }

        redirect(303, resolve(`/challenges/${newEmptyChallenge.challenge_id}/edit`));
    },
    delete: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) {
            redirect(303, '/login');
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

        await db
            .deleteFrom('challenges')
            .where('challenge_id', '=', challengeId)
            .executeTakeFirst();

        return { success: true, message: 'Challenge successfully deleted' };
    },
} satisfies Actions;
