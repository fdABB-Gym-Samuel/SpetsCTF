import { fail, redirect, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql, type Insertable } from 'kysely';
import type { Challenges } from '$lib/generated/db';
import { formatRequestedName } from '$lib/utils/utils';
import { rm } from 'node:fs/promises';
import { getStateDirectory } from '$lib/server/directories';
import { join } from 'node:path';
import sanitize from 'sanitize-filename';

export const load: PageServerLoad = async ({ locals, depends }) => {
    const user = locals.user;

    depends('data:challenges');

    const allChallenges = await db
        .with('unique_success', (qb) =>
            qb
                .selectFrom('wargame_submissions')
                .select(['challenge', 'user_id'])
                .select(sql<Date>`MIN(time)`.as('first_time'))
                .where('success', '=', true)
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
        .where('challenges.migrate_to_wargames', '=', true)
        .where(sql<boolean>`ctf_events.end_time IS NULL OR ctf_events.end_time < NOW()`)
        .where('challenges.approved', '=', true)
        .where('challenges.migrate_to_wargames', '=', true)
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
            // 'challenges.flag',
            sql<number>`
                  COUNT(DISTINCT 
                    CASE WHEN EXISTS(
                      SELECT 1 FROM users 
                      WHERE users.id = unique_success.user_id 
                        AND users.is_admin != true
                    ) THEN unique_success.user_id END
                  )
            `.as('num_solvers'),
            sql<boolean>`EXISTS(
                SELECT challenge, user_id FROM wargame_submissions 
                WHERE success = true
                    AND challenge = challenges.challenge_id
                    AND user_id = ${user?.id ?? null}
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

        // Check if challenge ID exists in either table
        const existingChallenge = await db
            .selectFrom('challenges')
            .where('challenge_id', '=', formattedRequestedName)
            .select('challenge_id')
            .executeTakeFirst();

        const existingCtfChallenge = await db
            .selectFrom('ctf_challenges')
            .where('challenge_id', '=', formattedRequestedName)
            .select('challenge_id')
            .executeTakeFirst();

        if (existingChallenge || existingCtfChallenge) {
            return fail(409, { success: false, message: 'Challenge ID not available' });
        }

        let desiredCtf: { id: number } | null = null;

        if (form.has('ctfId')) {
            const ctfId = form.get('ctfId');
            if (!ctfId) {
                return fail(400, {
                    success: false,
                    message: 'CTF Id provided but empty.',
                });
            } else {
                desiredCtf =
                    (await db
                        .selectFrom('ctf_events')
                        .select(['id'])
                        .where('id', '=', Number(ctfId.toString()))
                        .executeTakeFirst()) ?? null;
            }
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
                ctf: desiredCtf?.id ?? null,
                description: '',
                display_name: requestedName,
                flag: newEmptyFlag.id,
                points: 0,
            };

            const challenge = await trx
                .insertInto('challenges')
                .values(challengeStub)
                .returningAll()
                .executeTakeFirst();

            // Also create in ctf_challenges to reserve the ID (with separate flag)
            if (desiredCtf) {
                const ctfFlag = await trx
                    .insertInto('flag')
                    .values({
                        flag: '',
                        flag_format: '',
                    })
                    .returning(['flag.id'])
                    .executeTakeFirstOrThrow();

                await trx
                    .insertInto('ctf_challenges')
                    .values({
                        anonymous_author: null,
                        approved: false,
                        author: user.id,
                        challenge_id: formattedRequestedName,
                        challenge_sub_categories: '00000000',
                        created_at: new Date(),
                        ctf: desiredCtf.id,
                        description: '',
                        display_name: requestedName,
                        flag: ctfFlag.id,
                        points: 0,
                        migrate_to_wargames: true,
                    })
                    .execute();
            }

            return challenge;
        });

        if (!newEmptyChallenge) {
            error(500, { message: 'Failed to create new challenge stub.' });
        }

        redirect(303, `/challenges/${newEmptyChallenge.challenge_id}/edit`);
    },
    deleteChallenge: async ({ request, locals }) => {
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

        try {
            await db.transaction().execute(async (trx) => {
                const result = await trx
                    .deleteFrom('challenges')
                    .where('challenge_id', '=', challengeId)
                    .executeTakeFirst();

                await rm(join(getStateDirectory(), 'files', sanitize(challengeId)), {
                    recursive: true,
                    force: true,
                });

                return result;
            });
        } catch {
            error(500, {
                message:
                    'Could not delete challenge properly, please contact an administrator.',
            });
        }

        return { success: true, message: 'Challenge successfully deleted' };
    },
} satisfies Actions;
