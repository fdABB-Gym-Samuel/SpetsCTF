import {
    fail,
    error,
    type ServerLoadEvent,
    redirect,
    type Actions,
} from '@sveltejs/kit';
import { db } from '$lib/db/database';
import {
    validateCategory,
    get_challenge_id_from_display_name,
    selectedCategoriesToBitset,
} from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import type { Insertable } from 'kysely';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sanitize from 'sanitize-filename';
import { categories } from '$lib/db/constants';
import { linkPattern } from '$lib/utils/utils';

export const load = async ({ locals }: ServerLoadEvent) => {
    const user = locals.user;

    if (!user) {
        return redirect(303, '/login');
    }
    if (user.is_admin !== true) {
        return error(401, { message: 'User not admin' });
    }
};

export const actions = {
    default: async ({ request, locals }) => {
        if (locals.user?.is_admin !== true) {
            return fail(401, { message: 'Not authorized' });
        }
        try {
            if (locals.user?.is_admin !== true) {
                return fail(401, { message: 'Not authorized' });
            }
            const formData = await request.formData();

            const display_name = formData.get('display_name')?.toString() ?? null;
            if (!display_name) {
                return fail(422, { message: 'No display name' });
            }
            const challenge_id = await get_challenge_id_from_display_name(display_name);

            const challenge_category: Category = validateCategory(
                formData.get('challenge_category')?.toString() ?? ''
            );
            if (!challenge_category) {
                return fail(422, { message: 'No main category' });
            }

            const sub_categories: string[] = formData.getAll(
                'sub_categories'
            ) as string[];
            const categories_list = [challenge_category, ...sub_categories];

            // Check if all categories are allowed
            if (
                !categories_list ||
                categories_list.filter((category) => !categories.includes(category))
                    .length > 0
            ) {
                return fail(422, { message: 'Invalid Categories' });
            }

            const challenge_sub_categories = selectedCategoriesToBitset(
                categories,
                categories_list
            );

            const points = formData.get('points')?.toString() ?? '';
            if (!points) {
                return fail(422, {
                    message: 'Cannot insert challenge with no points!',
                });
            }
            const pointsInt = Number(points);
            if (pointsInt < 0) {
                return fail(400, { message: 'Points must be a non-negative integer' });
            }
            const flag = formData.get('flag')?.toString() ?? '';
            if (!flag) {
                return fail(422, { message: 'You need to provide flag.' });
            }

            const flag_format = formData.get('flag_format')?.toString() ?? null;

            const flagId = await db
                .insertInto('flag')
                .values({
                    flag,
                    flag_format,
                })
                .returning('id')
                .executeTakeFirstOrThrow();

            const description = formData.get('description')?.toString() ?? null;

            const authorAnonymous = formData.get('privacy') === 'author_anonymous';

            const challenge: Insertable<Challenges> = {
                challenge_category,
                challenge_sub_categories,
                challenge_id,
                points: pointsInt,
                flag: flagId.id,
                display_name,
                description,
                author: locals.user?.id,
                anonymous_author: authorAnonymous,
                approved: true,
            };

            await db.insertInto('challenges').values(challenge).execute();

            const files: File[] | null = formData.getAll('files') as File[] | null;
            const commands: string[] | null = formData.getAll('commands') as
                | string[]
                | null;
            const websites: string[] | null = formData.getAll('websites') as
                | string[]
                | null;

            let resource_files: {
                challenge: string;
                content: string;
                type: 'file';
            }[] = [];
            if (files !== null) {
                const challenge_dir = path.join(process.cwd(), `files/${challenge_id}`);
                await mkdir(challenge_dir, { recursive: true });

                files.forEach((file) => {
                    return new File([file], sanitize(file.name), {
                        type: file.type,
                        lastModified: file.lastModified,
                    });
                });
                let currently_used_filenames: string[] = [];
                for (let [index, file] of files.entries()) {
                    if (currently_used_filenames.includes(file.name)) {
                        files[index] = new File(
                            [file],
                            sanitize(`${file.name}_${index}`),
                            {
                                type: file.type,
                                lastModified: file.lastModified,
                            }
                        );
                    }
                    currently_used_filenames.push(file.name);
                }

                for (let file of files) {
                    let filepath = path.join(challenge_dir, sanitize(file.name));

                    await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
                }

                resource_files = files.map((file) => {
                    return {
                        challenge: challenge_id,
                        content: path.join(
                            `/challenge_files/${challenge_id}`,
                            file?.name
                        ),
                        type: 'file',
                    };
                });
            }

            let resource_commands: {
                challenge: string;
                content: string;
                type: 'cmd';
            }[] = [];
            if (commands !== null) {
                resource_commands = commands.map((command) => {
                    return { challenge: challenge_id, content: command, type: 'cmd' };
                });
            }

            let resource_websites: {
                challenge: string;
                content: string;
                type: 'web';
            }[] = [];
            let allowedWebsites = websites?.filter((website) =>
                website.match(linkPattern)
            );
            if (allowedWebsites !== undefined && allowedWebsites.length > 0) {
                resource_websites = allowedWebsites.map((website) => {
                    return { challenge: challenge_id, content: website, type: 'web' };
                });
            }

            if (
                resource_commands?.length > 0 ||
                resource_files?.length > 0 ||
                resource_websites?.length > 0
            ) {
                const resources = [
                    ...resource_files,
                    ...resource_commands,
                    ...resource_websites,
                ] as Insertable<ChallengeResources>[];
                const _ = await db
                    .insertInto('challenge_resources')
                    .values(resources)
                    .execute();
            }
            return { success: true, message: 'Challenge uploaded successfully' };
        } catch (err) {
            const error = err as Error;
            return { success: false, message: error.message };
        }
    },
} satisfies Actions;
