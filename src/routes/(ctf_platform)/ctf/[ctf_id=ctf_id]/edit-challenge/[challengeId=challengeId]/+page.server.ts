import type { PageServerLoad } from './$types';
import { error, redirect, fail, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { selectedCategoriesToBitset, validateCategory } from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import sanitize from 'sanitize-filename';
import path from 'path';
import { type Insertable } from 'kysely';
import { categories } from '$lib/db/constants';

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;
	// This is giving an error that there is no challengeId in RouteParams, but there is and i do not konw how to fix it :(
	const challengeId = params.challengeId;
	const ctfId = Number(params.ctf_id);

	if (!user) {
		return redirect(303, '/login');
	}

	const org = await db
		.selectFrom('ctf_organizers')
		.where('ctf', '=', ctfId)
		.where('user_id', '=', user.id)
		.executeTakeFirst();

	const isOrg = org !== undefined;

	const editableChallengeQuery = db
		.selectFrom('challenges as ch')
		.where('challenge_id', '=', challengeId)
		.where('ctf', '=', ctfId)
		.leftJoin('flag as f', 'ch.flag', 'f.id')
		.leftJoin('users as a', 'ch.author', 'a.id')
		.select([
			'ch.challenge_id',
			'ch.display_name as challenge_name',
			'ch.description as challenge_description',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			'f.flag_format',
			'f.flag',
			'a.display_name as author',
			'a.id as author_id',
			sql<boolean>`ch.author = ${user.id}`.as('is_author'),
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
		]);

	let editableChallenge;
	if (!user.is_admin && !isOrg) {
		editableChallenge = await editableChallengeQuery
			.where('ch.author', '=', user.id)
			.executeTakeFirst();
	} else {
		editableChallenge = await editableChallengeQuery.executeTakeFirst();
	}

	if (editableChallenge === undefined) {
		return error(404, { message: 'Challenge not found' });
	}

	return { editableChallenge };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		try {
			const user = locals.user;
			const challengeId = params.challengeId;
			const ctfId = Number(params.ctf_id);

			if (!user) {
				return redirect(304, '/login');
			}

			const org = await db
				.selectFrom('ctf_organizers')
				.where('ctf', '=', ctfId)
				.where('user_id', '=', user.id)
				.executeTakeFirst();

			const isOrg = org !== undefined;

			const oldChallenge = await db
				.selectFrom('challenges')
				.select('author')
				.where('challenge_id', '=', challengeId)
				.executeTakeFirst();

			if (oldChallenge === undefined) {
				return fail(404, { message: 'Challenge not found' });
			}

			const isAuthor = oldChallenge.author === locals.user?.id;

			if (!user.is_admin && !isAuthor && !isOrg) {
				return error(401, 'User not author of challenge, admin or organizer for CTF');
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

			const updatedChallenge = await db
				.updateTable('challenges')
				.set({
					display_name: displayName,
					description,
					points,
					challenge_category: mainCategory,
					challenge_sub_categories: selectedCategoriesBitset,
					approved: locals.user?.is_admin || isOrg
				})
				.where('challenge_id', '=', challengeId)
				.returning('flag')
				.executeTakeFirst();

			if (updatedChallenge === undefined) {
				return fail(404, { message: 'Challenge not found' });
			}
			const updatedFlag = await db
				.updateTable('flag')
				.set({
					flag,
					flag_format: flagFormat
				})
				.where('id', '=', updatedChallenge.flag)
				.executeTakeFirstOrThrow();

			// const authorAnonymous = formData.get("stay_anonymous") === "1"
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
			if (websites.length > 0) {
				let _newWebsites = await db
					.insertInto('challenge_resources')
					.columns(['challenge', 'type', 'content'])
					.values(
						websites.map((website) => ({ challenge: challengeId, type: 'web', content: website }))
					)
					.onConflict((oc) => oc.columns(['challenge', 'type', 'content']).doNothing())
					.execute();
			}

			let message;
			locals.user?.is_admin || isOrg
				? (message = 'Challenge successfully edited')
				: (message = 'Challenge successfully edited and has been submitted for review');
			return { success: true, message };
		} catch (err) {
			const errorTyped = err as Error;
			return fail(500, { message: errorTyped.message });
		}
	}
};
