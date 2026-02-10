import { fail, redirect, error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import type { Insertable, Selectable, Updateable } from 'kysely';
import type {
    ChallengeResources,
    Challenges,
    CtfChallenges,
    CtfEvents,
    Flag,
} from '$lib/generated/db';
import { validateCategory } from '$lib/db/functions';
import { selectedCategoriesToBitset } from '$lib/bitset';
import { categories } from '$lib/db/constants';
import path from 'node:path';
import sanitize from 'sanitize-filename';
import { stat } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { unlink } from 'node:fs/promises';
import { linkPattern } from '$lib/utils/utils';
import { getStateDirectory } from '$lib/server/directories';

export const load: PageServerLoad = async ({ locals, params, depends }) => {
    const user = locals.user;
    if (!user) {
        redirect(303, '/login');
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

    let ctf: Selectable<CtfEvents> | undefined = undefined;
    if (challenge.ctf) {
        ctf = await db
            .selectFrom('ctf_events')
            .where('id', '=', challenge.ctf)
            .selectAll()
            .executeTakeFirst();
    }

    if (!flag) error(404);

    // Check if there's a corresponding CTF challenge
    let ctfChallenge: Selectable<CtfChallenges> | undefined = undefined;
    if (ctf) {
        ctfChallenge = await db
            .selectFrom('ctf_challenges')
            .where('challenge_id', '=', challengeId)
            .selectAll()
            .executeTakeFirst();
    }

    // Determine if the CTF has ended
    const ctfEnded = ctf ? new Date(ctf.end_time) < new Date() : true;

    return {
        challenge,
        flag,
        resources,
        ctf,
        ctfChallenge,
        ctfEnded,
    };
};

// Helper function to check if CTF has ended for a challenge
async function getCtfStatus(
    challengeId: string
): Promise<{ ctfId: number | null; ctfEnded: boolean }> {
    const challenge = await db
        .selectFrom('challenges')
        .where('challenge_id', '=', challengeId)
        .select('ctf')
        .executeTakeFirst();

    if (!challenge?.ctf) {
        return { ctfId: null, ctfEnded: true };
    }

    const ctf = await db
        .selectFrom('ctf_events')
        .where('id', '=', challenge.ctf)
        .select('end_time')
        .executeTakeFirst();

    if (!ctf) {
        return { ctfId: challenge.ctf, ctfEnded: true };
    }

    return { ctfId: challenge.ctf, ctfEnded: new Date(ctf.end_time) < new Date() };
}

export const actions = {
    approveChallenge: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) redirect(303, '/login');

        const form = await request.formData();
        const challengeId = form.get('challenge_id')?.toString() ?? '';
        if (!challengeId) {
            return fail(404, { success: false, message: 'Challenge ID not provided.' });
        }

        if (user.is_admin) {
            const { ctfId, ctfEnded } = await getCtfStatus(challengeId);

            try {
                await db.transaction().execute(async (trx) => {
                    await trx
                        .updateTable('challenges')
                        .set({ approved: true })
                        .where('challenge_id', '=', challengeId)
                        .execute();

                    // Also update ctf_challenges if CTF hasn't ended
                    if (ctfId && !ctfEnded) {
                        await trx
                            .updateTable('ctf_challenges')
                            .set({ approved: true })
                            .where('challenge_id', '=', challengeId)
                            .execute();
                    }
                });
            } catch {
                error(500, { message: 'Failed to set approved bit.' });
            }
        } else {
            return fail(401, { success: false, message: 'Not authorized to approve.' });
        }

        return {
            success: true,
            message: '',
        };
    },
    disapproveChallenge: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) redirect(303, '/login');

        const form = await request.formData();
        const challengeId = form.get('challenge_id')?.toString() ?? '';
        if (!challengeId) {
            return fail(404, { success: false, message: 'Challenge ID not provided.' });
        }

        if (user.is_admin) {
            const { ctfId, ctfEnded } = await getCtfStatus(challengeId);

            try {
                await db.transaction().execute(async (trx) => {
                    await trx
                        .updateTable('challenges')
                        .set({ approved: false })
                        .where('challenge_id', '=', challengeId)
                        .execute();

                    // Also update ctf_challenges if CTF hasn't ended
                    if (ctfId && !ctfEnded) {
                        await trx
                            .updateTable('ctf_challenges')
                            .set({ approved: false })
                            .where('challenge_id', '=', challengeId)
                            .execute();
                    }
                });
            } catch {
                error(500, { message: 'Failed to set approved bit.' });
            }
        } else {
            return fail(401, { success: false, message: 'Not authorized to approve.' });
        }

        return {
            success: true,
            message: '',
        };
    },
    createResource: async ({ request, locals, params }) => {
        const user = locals.user;
        if (!user) redirect(303, '/login');

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

        const { ctfId, ctfEnded } = await getCtfStatus(challengeId);

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

            if (resourceType === 'web') {
                if (!linkPattern.test(insertableResource.content)) {
                    return fail(422, { success: false, message: 'Invalid link.' });
                }
            }

            try {
                await db.transaction().execute(async (trx) => {
                    await trx
                        .insertInto('challenge_resources')
                        .values(insertableResource)
                        .execute();
                    await trx
                        .updateTable('challenges')
                        .set({ approved: false })
                        .where('challenge_id', '=', challengeId)
                        .execute();

                    // Also add to ctf_challenge_resources if CTF hasn't ended
                    if (ctfId && !ctfEnded) {
                        await trx
                            .insertInto('ctf_challenge_resources')
                            .values({
                                type: resourceType as 'web' | 'cmd' | 'file',
                                challenge: currentChallenge.challenge_id,
                                content: form.get('content')?.toString() ?? '',
                            })
                            .execute();
                        await trx
                            .updateTable('ctf_challenges')
                            .set({ approved: false })
                            .where('challenge_id', '=', challengeId)
                            .execute();
                    }
                });
            } catch {
                error(500, { message: 'Failed to insert resource.' });
            }

            return {
                success: true,
                message: '',
            };
        } else if (resourceType === 'file') {
            const fileBufferFormEntry = form.get('file');
            if (fileBufferFormEntry === null) {
                return fail(422, {
                    success: false,
                    message:
                        'You need to attach a file to use with the file resource type.',
                });
            }

            const fileBuffer = fileBufferFormEntry.valueOf();
            if (!(fileBuffer instanceof File)) {
                return fail(422, {
                    success: false,
                    message: 'The file field must be of type File.',
                });
            }

            if (fileBuffer.size > 1e7) {
                return fail(422, {
                    success: false,
                    message: 'The file must be no larger than 10^7 bytes.',
                });
            }

            const arrayBuffer = await fileBuffer.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const stateDirectoryPath = getStateDirectory();
            if (!stateDirectoryPath || !path.isAbsolute(stateDirectoryPath))
                error(500, {
                    message:
                        'Could not determine file save location. Contact an admin if the issue persists.',
                });

            const filenameSanitized = sanitize(fileBuffer.name);
            const filePath = path.join(
                stateDirectoryPath,
                'files',
                challengeId,
                filenameSanitized
            );

            let fileExists: boolean = false;
            try {
                await stat(filePath);
                fileExists = true;
            } catch (err) {
                const errTyped = err as NodeJS.ErrnoException;
                if (errTyped.code === 'ENOENT') {
                    fileExists = false;
                } else {
                    throw err;
                }
            }

            if (fileExists) {
                return fail(422, { success: false, message: 'File already exists.' });
            }

            try {
                await mkdir(path.dirname(filePath), { recursive: true });
                await writeFile(filePath, buffer);
            } catch {
                error(500, {
                    message:
                        'Could not write file to disk. Contact an admin if the issue persists.',
                });
            }

            const fileResource: Insertable<ChallengeResources> = {
                challenge: challengeId,
                content: filenameSanitized,
                type: 'file',
            };

            try {
                await db.transaction().execute(async (trx) => {
                    await trx
                        .insertInto('challenge_resources')
                        .values(fileResource)
                        .execute();
                    await trx
                        .updateTable('challenges')
                        .set({ approved: false })
                        .where('challenge_id', '=', challengeId)
                        .execute();

                    // Also add to ctf_challenge_resources if CTF hasn't ended
                    if (ctfId && !ctfEnded) {
                        await trx
                            .insertInto('ctf_challenge_resources')
                            .values({
                                challenge: challengeId,
                                content: filenameSanitized,
                                type: 'file',
                            })
                            .execute();
                        await trx
                            .updateTable('ctf_challenges')
                            .set({ approved: false })
                            .where('challenge_id', '=', challengeId)
                            .execute();
                    }
                });
            } catch {
                await unlink(filePath);
                error(500, { message: 'Failed to register file in database.' });
            }
        } else {
            return fail(422, {
                success: false,
                message: 'Resource type has to be valid.',
            });
        }
    },
    deleteResource: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) redirect(303, '/login');

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

        const { ctfId, ctfEnded } = await getCtfStatus(resourceData.challenge);

        if (user.id === resourceData.author || user.is_admin) {
            if (resourceData.type === 'file') {
                const stateDirectoryPath = getStateDirectory();
                let deletedResource;

                try {
                    deletedResource = await db.transaction().execute(async (trx) => {
                        const resource = await trx
                            .deleteFrom('challenge_resources')
                            .where('id', '=', resourceData.id)
                            .returning(['content', 'challenge'])
                            .executeTakeFirstOrThrow();

                        // Also delete from ctf_challenge_resources if CTF hasn't ended
                        if (ctfId && !ctfEnded) {
                            await trx
                                .deleteFrom('ctf_challenge_resources')
                                .where('challenge', '=', resourceData.challenge)
                                .where('type', '=', resourceData.type)
                                .where('content', '=', resourceData.content)
                                .execute();
                        }

                        return resource;
                    });
                } catch (e) {
                    console.error('Failed to delete file resource from database:', e);
                    error(500, {
                        message: 'Failed to delete file resource from database.',
                    });
                }

                // Delete the file only after the database transaction commits successfully
                try {
                    await unlink(
                        path.join(
                            stateDirectoryPath,
                            'files',
                            deletedResource.challenge,
                            deletedResource.content
                        )
                    );
                } catch (e) {
                    console.error('Failed to delete file from filesystem:', e);
                    // File deletion failed but DB record is already deleted
                    // This is acceptable - orphaned files can be cleaned up separately
                }
            } else {
                try {
                    await db.transaction().execute(async (trx) => {
                        await trx
                            .deleteFrom('challenge_resources')
                            .where('id', '=', resourceData.id)
                            .execute();

                        // Also delete from ctf_challenge_resources if CTF hasn't ended
                        if (ctfId && !ctfEnded) {
                            await trx
                                .deleteFrom('ctf_challenge_resources')
                                .where('challenge', '=', resourceData.challenge)
                                .where('type', '=', resourceData.type)
                                .where('content', '=', resourceData.content)
                                .execute();
                        }
                    });
                } catch {
                    error(500, { message: 'Failed to delete resource.' });
                }
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
        if (!user) redirect(303, '/login');

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

        const flagUpdate: Updateable<Flag> = {};
        const challengeUpdate: Updateable<Challenges> = {};

        // Users must get an edit approved.
        challengeUpdate.approved = false;

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

        const { ctfId, ctfEnded } = await getCtfStatus(challengeId);

        // Handle migrate_to_wargames (only if CTF hasn't ended)
        const migrateToWargames = form.get('migrate_to_wargames') === 'on';
        if (ctfId && !ctfEnded) {
            challengeUpdate.migrate_to_wargames = migrateToWargames;
        }

        // Get the CTF challenge's flag ID if it exists and CTF hasn't ended
        let ctfChallengeFlag: number | null = null;
        if (ctfId && !ctfEnded) {
            const ctfChallenge = await db
                .selectFrom('ctf_challenges')
                .where('challenge_id', '=', challengeId)
                .select('flag')
                .executeTakeFirst();
            ctfChallengeFlag = ctfChallenge?.flag ?? null;
        }

        try {
            await db.transaction().execute(async (trx) => {
                // Update the wargame challenge's flag
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

                // Also update ctf_challenges and its flag if CTF hasn't ended
                if (ctfId && !ctfEnded) {
                    // Update CTF challenge's separate flag
                    if (ctfChallengeFlag) {
                        await trx
                            .updateTable('flag')
                            .set(flagUpdate)
                            .where('id', '=', ctfChallengeFlag)
                            .execute();
                    }

                    await trx
                        .updateTable('ctf_challenges')
                        .set({
                            approved: false,
                            display_name: challengeUpdate.display_name,
                            description: challengeUpdate.description,
                            challenge_category: challengeUpdate.challenge_category,
                            challenge_sub_categories:
                                challengeUpdate.challenge_sub_categories,
                            anonymous_author: challengeUpdate.anonymous_author,
                            points: challengeUpdate.points,
                            migrate_to_wargames: migrateToWargames,
                        })
                        .where('challenge_id', '=', challengeId)
                        .execute();
                }
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
