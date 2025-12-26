import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals, depends, params }) => {
    const user = locals.user;

    depends(`data:ctf-${params.ctf_id}-challenges`);

    const ctf = await db
        .selectFrom('ctf_events')
        .where('ctf_events.id', '=', params.ctf_id)
        .selectAll()
        .executeTakeFirst();

    const allChallenges = await db
        .with('unique_success', (qb) =>
            qb
                .selectFrom('ctf_submissions')
                .innerJoin('users', 'ctf_submissions.user_id', 'users.id')
                .where('is_admin', 'is not', true)
                .where('ctf_submissions.ctf', '=', params.ctf_id)
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

        await db
            .deleteFrom('challenges')
            .where('challenge_id', '=', challengeId)
            .executeTakeFirst();

        return { success: true, message: 'Challenge successfully deleted' };
    },
} satisfies Actions;
