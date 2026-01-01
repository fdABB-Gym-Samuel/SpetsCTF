import { fail, redirect, error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { db } from '$lib/db/database';
import type { Insertable, Selectable, Updateable } from 'kysely';
import type { ChallengeResources, Challenges, Flag } from '$lib/generated/db';
import { validateCategory } from '$lib/db/functions';
import { selectedCategoriesToBitset } from '$lib/bitset';
import { categories, resourceTypes } from '$lib/db/constants';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
    const user = locals.user;
    if (!user) {
        redirect(303, resolve('/login'));
    }

    const challengeId = params.challengeId;
    if (!challengeId) error(404);

    const challenge: Selectable<Challenges> | undefined = await db
        .selectFrom('challenges')
        .where('challenge_id', '=', challengeId)
        .selectAll()
        .executeTakeFirst();

    depends(`data:challenge-edit-${challengeId}`);

    if (!challenge) error(404);

    if (challenge.author !== user.id && !user.is_admin) {
        error(401, { message: 'Challenge was not created by you.' });
    }

    const resources: Selectable<ChallengeResources>[] = await db
        .selectFrom('challenge_resources')
        .where('challenge', '=', challenge.challenge_id)
        .selectAll()
        .execute();

    const flag: Selectable<Flag> | undefined = await db
        .selectFrom('flag')
        .where('id', '=', challenge.flag)
        .selectAll()
        .executeTakeFirst();

    if (!flag) error(404);

    return {
        challenge,
        flag,
        resources,
    };
};

export const actions = {
    createResource: async ({ request, locals, params }) => {
        const user = locals.user;
        if (!user) redirect(303, resolve('/login'));

        const challengeId = params.challengeId ?? '';
        if (!challengeId) return fail(404);

        const currentChallenge = await db
            .selectFrom('challenges')
            .where('challenge_id', '=', challengeId)
            .selectAll()
            .executeTakeFirst();
        if (!currentChallenge)
            return fail(404, { success: false, message: 'No such challenge found.' });

        if (!user.is_admin && currentChallenge.author !== user.id) {
            return fail(401);
        }

        const form = await request.formData();

        const resourceType = form.get('resource_type')?.toString() ?? '';
        if (!resourceType)
            return fail(422, {
                success: false,
                message: 'Resource type has to be provided.',
            });

        if (resourceType === 'web' || resourceType === 'cmd') {
            const insertableResource: Insertable<ChallengeResources> = {
                type: resourceType,
                challenge: currentChallenge.challenge_id,
                content: form.get('content')?.toString() ?? '',
            };

            try {
                await db
                    .insertInto('challenge_resources')
                    .values(insertableResource)
                    .execute();
            } catch {
                error(500, { message: 'Failed to insert resource.' });
            }

            return {
                success: true,
                message: '',
            };
        } else if (resourceType === 'file') {
            error(501);
        } else {
            return fail(422, {
                success: false,
                message: 'Resource type has to be valid.',
            });
        }
    },
    deleteResource: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) redirect(303, resolve('/login'));

        const form = await request.formData();

        const resourceId = form.get('resource_id');
        if (resourceId === null)
            return fail(422, { success: false, message: 'Resource ID not provided.' });

        const parsedResourceId = parseInt(resourceId.toString().trim(), 10);
        if (isNaN(parsedResourceId))
            return fail(422, { success: false, message: 'Invalid resource ID.' });

        const resourceData = await db
            .selectFrom('challenge_resources')
            .where('id', '=', parsedResourceId)
            .innerJoin(
                'challenges',
                'challenge_resources.challenge',
                'challenges.challenge_id'
            )
            .selectAll('challenge_resources')
            .select('challenges.author')
            .executeTakeFirst();

        if (!resourceData) error(404, { message: 'No such resource found.' });

        if (user.id === resourceData.author || user.is_admin) {
            try {
                await db
                    .deleteFrom('challenge_resources')
                    .where('id', '=', parsedResourceId)
                    .execute();
            } catch {
                error(500, { message: 'Failed to delete resource.' });
            }
            return {
                success: true,
                message: '',
            };
        } else {
            return fail(401, {
                success: false,
                message: 'Unauthorized to alter this challenge.',
            });
        }
    },
    editChallenge: async ({ request, locals, params }) => {
        const user = locals.user;
        if (!user) redirect(303, resolve('/login'));

        const challengeId = params.challengeId;
        if (challengeId === undefined)
            return fail(404, { success: false, message: 'No such challenge found.' });

        const currentChallenge = await db
            .selectFrom('challenges')
            .where('challenge_id', '=', challengeId)
            .selectAll()
            .executeTakeFirst();
        if (!currentChallenge)
            return fail(404, { success: false, message: 'No such challenge found.' });

        if (!user.is_admin && currentChallenge.author !== user.id) {
            return fail(401);
        }

        const form = await request.formData();

        console.log(Array.from(form.entries()));

        let flagUpdate: Updateable<Flag> = {};
        let challengeUpdate: Updateable<Challenges> = {};

        const displayName = form.get('display_name');
        if (!displayName || displayName.toString() === '') {
            return fail(422, {
                success: false,
                message: 'Display name cannot be empty.',
            });
        } else {
            challengeUpdate.display_name = displayName.toString();
        }

        const description = form.get('description');
        if (description === null) {
            return fail(422, {
                success: false,
                message: 'Description must be supplied, even if empty.',
            });
        } else {
            challengeUpdate.description = description.toString();
        }

        const flag = form.get('flag');
        if (!flag || flag.toString() === '') {
            return fail(422, { success: false, message: 'Flag cannot be empty.' });
        } else {
            flagUpdate.flag = flag.toString();
        }

        const flagFormat = form.get('flag_format');
        if (flagFormat === null) {
            return fail(422, {
                success: false,
                message: 'Flag format must be supplied, even if empty.',
            });
        } else {
            flagUpdate.flag_format = flagFormat.toString();
        }

        const points = form.get('points');
        const pointsStr = points?.toString().trim() ?? '';
        if (pointsStr === '')
            return fail(422, {
                success: false,
                message: 'Invalid points specification.',
            });

        const mainCategory = form.get('challenge_category');
        if (mainCategory === null || mainCategory.toString() === '') {
            return fail(422, {
                success: false,
                message: 'Main category must be specified.',
            });
        } else {
            challengeUpdate.challenge_category = validateCategory(
                mainCategory.toString()
            );
        }

        const subCategories = form.getAll('sub_categories');
        const subCategoriesBitSet = selectedCategoriesToBitset(categories, [
            ...new Set(
                subCategories
                    .map((elem) => elem.toString())
                    .map((elem) => validateCategory(elem))
                    .filter((elem) => elem !== mainCategory)
                    .sort()
            ),
        ]);

        challengeUpdate.challenge_sub_categories = subCategoriesBitSet;

        const privacy = form.getAll('privacy').map((elem) => elem.toString());
        if (privacy.find((elem) => elem === 'author_anonymous')) {
            challengeUpdate.anonymous_author = true;
        } else {
            challengeUpdate.anonymous_author = false;
        }

        const pointsParsed = parseInt(pointsStr, 10);
        if (isNaN(pointsParsed))
            return fail(422, {
                success: false,
                message: 'Points must be a valid integer.',
            });

        if (pointsParsed < 0)
            return fail(422, {
                success: false,
                message: 'Points must be a positive integer.',
            });

        challengeUpdate.points = pointsParsed;

        try {
            await db.transaction().execute(async (trx) => {
                await trx
                    .updateTable('flag')
                    .set(flagUpdate)
                    .where('id', '=', currentChallenge.flag)
                    .execute();
                await trx
                    .updateTable('challenges')
                    .set(challengeUpdate)
                    .where('challenge_id', '=', challengeId)
                    .execute();
            });
        } catch {
            error(500, { message: 'Failed to update challenge.' });
        }

        return {
            success: true,
            message: '',
        };
    },
} satisfies Actions;
