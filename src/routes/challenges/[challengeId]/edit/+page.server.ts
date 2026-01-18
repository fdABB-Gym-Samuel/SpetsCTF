import { fail, redirect, error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { resolve } from '$app/paths';
import { db } from '$lib/db/database';
import type { Insertable, Selectable, Updateable } from 'kysely';
import type {
    ChallengeResources,
    Challenges,
    CtfEvents,
    Flag,
} from '$lib/generated/db';
import { validateCategory } from '$lib/db/functions';
import { selectedCategoriesToBitset } from '$lib/bitset';
import { categories } from '$lib/db/constants';
import { spawn } from 'node:child_process';
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

    let ctf: Selectable<CtfEvents> | undefined = undefined;
    if (challenge.ctf) {
        ctf = await db
            .selectFrom('ctf_events')
            .where('id', '=', challenge.ctf)
            .selectAll()
            .executeTakeFirst();
    }

    if (!flag) error(404);

    return {
        challenge,
        flag,
        resources,
        ctf,
    };
};

export const actions = {
    approveChallenge: async ({ request, locals }) => {
        const user = locals.user;
        if (!user) redirect(303, resolve('/login'));

        const form = await request.formData();
        const challengeId = form.get('challenge_id')?.toString() ?? '';
        if (!challengeId) {
            return fail(404, { success: false, message: 'Challenge ID not provided.' });
        }

        if (user.is_admin) {
            try {
                await db
                    .updateTable('challenges')
                    .set({ approved: true })
                    .where('challenge_id', '=', challengeId)
                    .executeTakeFirstOrThrow();
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
        if (!user) redirect(303, resolve('/login'));

        const form = await request.formData();
        const challengeId = form.get('challenge_id')?.toString() ?? '';
        if (!challengeId) {
            return fail(404, { success: false, message: 'Challenge ID not provided.' });
        }

        if (user.is_admin) {
            try {
                await db
                    .updateTable('challenges')
                    .set({ approved: false })
                    .where('challenge_id', '=', challengeId)
                    .executeTakeFirstOrThrow();
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

            if (resourceType === 'web') {
                if (!linkPattern.test(insertableResource.content)) {
                    return fail(422, { success: false, message: 'Invalid link.' });
                }
            }

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

            const mimeType = await new Promise<string>((resolve, reject) => {
                const fileProcess = spawn('file', ['-b', '--mime-type', '-']);
                let output = '';
                fileProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                fileProcess.stderr.on('data', (data) => {
                    reject(new Error(data.toString()));
                });

                fileProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve(output.trim());
                    } else {
                        reject(new Error(`file command exited with code ${code}`));
                    }
                });

                fileProcess.stdin.write(buffer);
                fileProcess.stdin.end();
            });

            if (fileBuffer.type.split(';').at(0)?.trim() !== mimeType) {
                return fail(422, {
                    success: false,
                    message: 'Stop lying about the mimetype!',
                });
            }

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
                await db
                    .insertInto('challenge_resources')
                    .values(fileResource)
                    .execute();
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
            if (resourceData.type === 'file') {
                try {
                    const stateDirectoryPath = getStateDirectory();
                    const filePathToDelete = await db
                        .deleteFrom('challenge_resources')
                        .where('id', '=', resourceData.id)
                        .returning(['content', 'challenge'])
                        .executeTakeFirstOrThrow();
                    await unlink(
                        path.join(
                            stateDirectoryPath,
                            'files',
                            filePathToDelete.challenge,
                            filePathToDelete.content
                        )
                    );
                } catch {
                    error(500, { message: 'Failed to delete file resource.' });
                }
            } else {
                try {
                    await db
                        .deleteFrom('challenge_resources')
                        .where('id', '=', resourceData.id)
                        .executeTakeFirstOrThrow();
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
