import type { PageServerLoad } from '../$types';
import { error, redirect, fail, type Redirect, isRedirect } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { insertFlag, selectedCategoriesToBitset, validateCategory } from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import sanitize from 'sanitize-filename';
import path from 'path';
import { type Insertable } from 'kysely';
import { categories } from '$lib/db/constants';
import { linkPattern } from '$lib/utils/utils';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;
	// @ts-expect-error
	const challengeId = params.challengeId;

	if (!user) {
		return redirect(303, '/login');
	}

	if (!user.is_admin) {
		return error(401, 'User not admin');
	}

	const unapprovedChallenge = await db
		.selectFrom('challenges as ch')
		.where('challenge_id', '=', challengeId)
		.where('ch.approved', '=', false)
		.leftJoin('flag as f', 'ch.flag', 'f.id')
		.leftJoin('users as a', 'ch.author', 'a.id')
		.groupBy([
			'ch.challenge_id',
			'ch.display_name',
			'ch.description',
			'ch.points',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'a.display_name',
			'a.id',
			'f.flag_format',
			'f.flag'
		])
		.select([
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.description',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			'f.flag_format',
			'f.flag',
			'a.display_name as author',
			'a.id as author_id',
			// Get an array of resources for the challenge (ordered by resource id).
			sql<Pick<ChallengeResources, 'type' | 'content'>[]>`
                COALESCE(
                    (
                      SELECT JSON_AGG(
                        json_build_object('type', cr.type, 'content', cr.content)
                        ORDER BY cr.id
                      )
                      FROM challenge_resources cr
                      WHERE cr.challenge = ch.challenge_id
                    ),
                    '[]'::json
                  )
                `.as('resources')
		])
		.executeTakeFirst();

	if (unapprovedChallenge === undefined) {
		return error(404, { message: 'Challenge not found' });
	}

	return { unapprovedChallenge };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		try {
			const user = locals.user;
			const challengeId = params.challengeId;

			if (!user) {
				return redirect(304, '/login');
			}

			if (!user.is_admin) {
				return error(401, 'User not admin');
			}

			const currentChallenge = await db
				.selectFrom('challenges')
				.selectAll()
				.where('challenge_id', '=', challengeId)
				.executeTakeFirst();

			if (currentChallenge === undefined) {
				return fail(404, { message: 'Challenge not found' });
			}

			const isAuthor = currentChallenge.author === user.id;

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

			const mainCategory: Category = validateCategory(
				formData.get('challenge_category')?.toString() ?? ''
			);

			const subCategories = formData.getAll('sub_categories') as string[];
			const selectedCategories = [mainCategory, ...subCategories];
			if (
				!selectedCategories ||
				selectedCategories.filter((category) => !categories.includes(category)).length > 0
			) {
				return fail(422, { message: 'Invalid Categories' });
			}

			const selectedCategoriesBitset = selectedCategoriesToBitset(
				categories,
				selectedCategories as string[]
			);

			// const authorAnonymous = formData.get('privacy') === 'author_anonymous';
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
					approved: true,
					anonymous_author: authorAnonymous
				})
				.where('challenge_id', '=', challengeId)
				.returning('flag')
				.executeTakeFirst();

			if (updatedChallenge === undefined) {
				return fail(404, { message: 'Challenge not found' });
			}

			const updatedFlag = await insertFlag(flag, flagFormat, true, updatedChallenge.flag);

			if (updatedFlag === undefined) {
				return fail(500, { message: 'Failed to save new flag' });
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
				} catch (err) {
					console.error('Error deleting file', filepath.content);
				}
			});

			let resource_files;
			if (newFiles !== null) {
				await mkdir(challengeDir, { recursive: true });

				newFiles.forEach((file) => {
					return new File([file], sanitize(file.name), {
						type: file.type,
						lastModified: file.lastModified
					});
				});
				let currentlyUsedFilenames: string[] = originalFilesNew;
				for (let [index, file] of newFiles.entries()) {
					if (currentlyUsedFilenames.includes(file.name)) {
						newFiles[index] = new File([file], sanitize(`${file.name}_${index}`), {
							type: file.type,
							lastModified: file.lastModified
						});
					}
					currentlyUsedFilenames.push(file.name);
				}

				for (let file of newFiles) {
					let filepath = path.join(challengeDir, sanitize(file.name));

					await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
				}

				resource_files = newFiles.map((file) => {
					return {
						challenge: challengeId,
						content: path.join(`/challenge_files/${challengeId}`, file?.name),
						type: 'file'
					};
				}) as Insertable<ChallengeResources>[];

				if (resource_files.length > 0) {
					const _ = await db.insertInto('challenge_resources').values(resource_files).execute();
				}
			}

			const commands = formData.getAll('commands') as string[];
			let _deleteCommands;
			if (commands.length > 0) {
				_deleteCommands = await db
					.deleteFrom('challenge_resources')
					.where('challenge', '=', challengeId)
					.where('type', '=', 'cmd')
					.where('content', 'not in', commands)
					.execute();
			} else {
				_deleteCommands = await db
					.deleteFrom('challenge_resources')
					.where('challenge', '=', challengeId)
					.where('type', '=', 'cmd')
					.execute();
			}

			if (commands.length > 0) {
				let newCommands = await db
					.insertInto('challenge_resources')
					.columns(['challenge', 'type', 'content'])
					.values(
						commands.map((command) => ({ challenge: challengeId, type: 'cmd', content: command }))
					)
					.onConflict((oc) => oc.columns(['challenge', 'type', 'content']).doNothing())
					.executeTakeFirst();
			}
			const websites = formData.getAll('websites') as string[];
			let _deleteWebsites;
			if (websites.length > 0) {
				_deleteWebsites = await db
					.deleteFrom('challenge_resources')
					.where('challenge', '=', challengeId)
					.where('type', '=', 'web')
					.where('content', 'not in', websites)
					.returning('content')
					.execute();
			} else {
				_deleteWebsites = await db
					.deleteFrom('challenge_resources')
					.where('challenge', '=', challengeId)
					.where('type', '=', 'web')
					.returning('content')
					.execute();
			}
			let allowedWebsites = websites?.filter((website) => website.match(linkPattern));
			if (allowedWebsites.length > 0) {
				let _newWebsites = await db
					.insertInto('challenge_resources')
					.columns(['challenge', 'type', 'content'])
					.values(
						allowedWebsites.map((website) => ({
							challenge: challengeId,
							type: 'web',
							content: website
						}))
					)
					.onConflict((oc) => oc.columns(['challenge', 'type', 'content']).doNothing())
					.execute();
			}

			return redirect(304, '/admin/approve?status=approved');
		} catch (err) {
			const errTyped = err as Error;
			if (isRedirect(errTyped)) {
				throw err;
			}
			return fail(500, { message: 'Unable to save file' });
		}
	}
};
