import type { PageServerLoad } from './$types';
import { error, redirect, fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { insertFlag, validateCategory } from '$lib/db/functions';
import { selectedCategoriesToBitset } from '$lib/bitset';
import type { ChallengeResources } from '$lib/generated/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import sanitize from 'sanitize-filename';
import path from 'path';
import { type Insertable } from 'kysely';
import { categories } from '$lib/db/constants';
import { linkPattern } from '$lib/utils/utils';
import { jsonBuildObject, jsonArrayFrom } from 'kysely/helpers/postgres';

export const load: PageServerLoad = async ({ locals, params }) => {
    const user = locals.user;
    const challengeId = params.challengeId;

    if (!user) {
        return redirect(303, '/login');
    }

    const editableChallenge = await db
        .selectFrom('challenges as ch')
        .where('challenge_id', '=', challengeId)
        .leftJoin('flag as f', 'ch.flag', 'f.id')
        .leftJoin('users as a', 'ch.author', 'a.id')
        .selectAll('ch')
        .select((eb) => [
            jsonBuildObject({
                id: eb.ref('f.id'),
                flag: eb.ref('f.flag'),
                flag_format: eb.ref('f.flag_format'),
            }).as('flag'),
            jsonBuildObject({
                id: eb.ref('a.id'),
                display_name: eb.ref('a.display_name'),
            }).as('author_info'),
            eb(eb.ref('ch.author'), '=', user.id).as('is_author'),
            jsonArrayFrom(
                eb
                    .selectFrom('challenge_resources as cr')
                    .selectAll('cr')
                    .whereRef('cr.challenge', '=', 'ch.challenge_id')
                    .orderBy('cr.id')
            ).as('resources'),
        ])
        .executeTakeFirst();

    if (editableChallenge === undefined) {
        return error(404, { message: 'Challenge not found' });
    }

    if (!user.is_admin && !editableChallenge.is_author) {
        return error(401, {
            message:
                'Challenges can only be edited by the author of a specific challenge or an admin',
        });
    }

    return { editableChallenge };
};

export const actions = {
    default: async ({ request, params, locals }) => {
        try {
            const user = locals.user;
            const challengeId = params.challengeId ?? '';
            if (challengeId === '') fail(404);

            if (!user) return redirect(304, '/login');

            const currentChallenge = await db
                .selectFrom('challenges')
                .selectAll()
                .where('challenge_id', '=', challengeId)
                .executeTakeFirst();

            if (currentChallenge === undefined) {
                return fail(404, { message: 'Challenge not found' });
            }

            const isAuthor = currentChallenge.author === user.id;

            if (!user.is_admin && !isAuthor) {
                return error(401, 'User not author of challenge or admin');
            }

            const formData = await request.formData();
            const displayName = formData.get('display_name') as string;
            if (!displayName) {
                return fail(422, { message: 'No display name' });
            }
            const description = (formData.get('description') as string) ?? null;

            const flag = (formData.get('flag') as string) ?? '';
            if (!flag) {
                return fail(422, { message: 'You need to provide flag.' });
            }
            const flagFormat = formData.get('flag_format') as string;

            const points = Number(formData.get('points'));
            if (points < 0) {
                return fail(404, { message: 'Points must be a non-negative integer' });
            }

            const mainCategory = validateCategory(
                formData.get('challenge_category')?.toString() ?? ''
            );

            const subCategories = formData.getAll('sub_categories') as string[];
            const selectedCategories = [mainCategory, ...subCategories];
            if (
                !selectedCategories ||
                selectedCategories.filter((category) => !categories.includes(category))
                    .length > 0
            ) {
                return fail(422, { message: 'Invalid Categories' });
            }

            const selectedCategoriesBitset = selectedCategoriesToBitset(
                categories,
                selectedCategories as string[]
            );

            const authorAnonymous = isAuthor
                ? formData.get('privacy') === 'author_anonymous'
                : currentChallenge.anonymous_author;

            const updatedChallenge = await db
                .updateTable('challenges')
                .set({
                    display_name: displayName,
                    description,
                    points,
                    challenge_category: mainCategory,
                    challenge_sub_categories: selectedCategoriesBitset,
                    approved: user.is_admin,
                    anonymous_author: authorAnonymous,
                })
                .where('challenge_id', '=', challengeId)
                .returning('flag')
                .executeTakeFirst();

            if (updatedChallenge === undefined) {
                return fail(404, { message: 'Challenge not found' });
            }

            const updatedFlag = await insertFlag(
                flag,
                flagFormat,
                true,
                updatedChallenge.flag
            );

            if (updatedFlag === undefined) {
                return error(500, { message: 'Failed to save new flag' });
            }

            const originalFilesNew = formData.getAll('original_files') as string[];
            const newFiles = formData.getAll('files') as File[];

            // Remove deleted files from db
            let updatedOriginalFiles;
            if (originalFilesNew.length > 0) {
                updatedOriginalFiles = await db
                    .deleteFrom('challenge_resources')
                    .where('challenge', '=', challengeId)
                    .where('type', '=', 'file')
                    .where('content', 'not in', originalFilesNew)
                    .returning('content')
                    .execute();
            } else {
                updatedOriginalFiles = await db
                    .deleteFrom('challenge_resources')
                    .where('challenge', '=', challengeId)
                    .where('type', '=', 'file')
                    .returning('content')
                    .execute();
            }

            const challengeDir = path.join(process.cwd(), `files/${challengeId}`);
            // Delete old files from server
            updatedOriginalFiles.forEach((filepath) => {
                try {
                    const filename = path.basename(filepath.content);
                    const completeFilepath = path.join(challengeDir, filename);
                    unlink(completeFilepath);
                } catch {
                    console.error('Error deleting file', filepath.content);
                }
            });

            let resource_files;
            if (newFiles !== null) {
                await mkdir(challengeDir, { recursive: true });

                newFiles.forEach((file) => {
                    return new File([file], sanitize(file.name), {
                        type: file.type,
                        lastModified: file.lastModified,
                    });
                });
                const currentlyUsedFilenames: string[] = originalFilesNew;
                for (const [index, file] of newFiles.entries()) {
                    if (currentlyUsedFilenames.includes(file.name)) {
                        newFiles[index] = new File(
                            [file],
                            sanitize(`${file.name}_${index}`),
                            {
                                type: file.type,
                                lastModified: file.lastModified,
                            }
                        );
                    }
                    currentlyUsedFilenames.push(file.name);
                }

                for (const file of newFiles) {
                    const filepath = path.join(challengeDir, sanitize(file.name));

                    await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
                }

                resource_files = newFiles.map((file) => {
                    return {
                        challenge: challengeId,
                        content: path.join(
                            `/challenge_files/${challengeId}`,
                            file?.name
                        ),
                        type: 'file',
                    };
                }) as Insertable<ChallengeResources>[];

                if (resource_files.length > 0) {
                    await db
                        .insertInto('challenge_resources')
                        .values(resource_files)
                        .execute();
                }
            }

            const commands = formData.getAll('commands') as string[];
            if (commands.length > 0) {
                await db
                    .deleteFrom('challenge_resources')
                    .where('challenge', '=', challengeId)
                    .where('type', '=', 'cmd')
                    .where('content', 'not in', commands)
                    .execute();
            } else {
                await db
                    .deleteFrom('challenge_resources')
                    .where('challenge', '=', challengeId)
                    .where('type', '=', 'cmd')
                    .execute();
            }

            if (commands.length > 0) {
                await db
                    .insertInto('challenge_resources')
                    .columns(['challenge', 'type', 'content'])
                    .values(
                        commands.map((command) => ({
                            challenge: challengeId,
                            type: 'cmd',
                            content: command,
                        }))
                    )
                    .onConflict((oc) =>
                        oc.columns(['challenge', 'type', 'content']).doNothing()
                    )
                    .executeTakeFirst();
            }

            const websites = formData.getAll('websites') as string[];
            if (websites.length > 0) {
                await db
                    .deleteFrom('challenge_resources')
                    .where('challenge', '=', challengeId)
                    .where('type', '=', 'web')
                    .where('content', 'not in', websites)
                    .returning('content')
                    .execute();
            } else {
                await db
                    .deleteFrom('challenge_resources')
                    .where('challenge', '=', challengeId)
                    .where('type', '=', 'web')
                    .returning('content')
                    .execute();
            }
            const allowedWebsites = websites?.filter((website) =>
                website.match(linkPattern)
            );
            if (allowedWebsites.length > 0) {
                await db
                    .insertInto('challenge_resources')
                    .columns(['challenge', 'type', 'content'])
                    .values(
                        allowedWebsites.map((website) => ({
                            challenge: challengeId,
                            type: 'web',
                            content: website,
                        }))
                    )
                    .onConflict((oc) =>
                        oc.columns(['challenge', 'type', 'content']).doNothing()
                    )
                    .execute();
            }

            const message: string = locals.user?.is_admin
                ? 'Challenge successfully edited'
                : 'Challenge successfully edited and has been submitted for review';
            return { success: true, message };
        } catch (err) {
            const errorTyped = err as Error;
            return fail(500, { message: errorTyped.message });
        }
    },
} satisfies Actions;
