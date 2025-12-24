import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/db/database';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { translations } = await parent();

    const challengeData = await db
        .selectFrom('challenges')
        .innerJoin('flag', 'challenges.flag', 'flag.id')
        .where('challenge_id', '=', params.challengeId)
        .selectAll(['challenges'])
        .select('flag.flag_format')
        .executeTakeFirst();

    if (!challengeData) {
        error(404, 'Challenge not found');
    }

    const firstSolvers = await db
        .selectFrom('ctf_submissions')
        .innerJoin('users', 'users.id', 'ctf_submissions.user_id')
        .where('challenge', '=', challengeData.challenge_id)
        .where('success', '=', true)
        .orderBy('ctf_submissions.time', 'asc')
        .selectAll(['users'])
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
