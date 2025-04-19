import type { PageServerLoad } from '../$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { selectedCategoriesToBitset, validateCategory } from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import { promises as fs } from 'fs';
import path from 'path';

let categories = [
	'crypto',
	'forensics',
	'introduction',
	'misc',
	'osint',
	'pwn',
	'reversing',
	'web'
];

export const load: PageServerLoad = async ({ locals, params }) => {
	const user = locals.user;
	const ctfId = Number(params.ctf_id);
	const challengeId = params.challengeId;

	if (!user) {
		return redirect(304, '/login');
	}

	const org = await db
		.selectFrom('ctf_organizers')
		.where('ctf', '=', ctfId)
		.where('user_id', '=', user.id)
		.executeTakeFirst();

	const isOrg = org !== undefined;

	if (!isOrg) {
		return error(401, 'User not organizer for this CTF');
	}

	const unapprovedChallenge = await db
		.selectFrom('challenges as ch')
		.where('challenge_id', '=', challengeId)
		.where('ch.ctf', '=', ctfId)
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
			'ch.description as challenge_description',
			'ch.challenge_category',
			'ch.challenge_sub_categories',
			'ch.points',
			'f.flag_format',
			'f.flag',
			'a.display_name as author',
			'a.id as author_id',
			// Get an array of resources for the challenge (ordered by resource id).
			sql`
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
		// .orderBy('ch.points', 'asc')
		.executeTakeFirst();

	return { unapprovedChallenge };
};

export const actions = {
	default: async ({ request, params, locals }) => {
		try {
			const user = locals.user;
			const ctfId = Number(params.ctf_id);
			const challengeId = params.challengeId;

			if (!user) {
				return redirect(304, '/login');
			}

			const org = await db
				.selectFrom('ctf_organizers')
				.where('ctf', '=', ctfId)
				.where('user_id', '=', user.id)
				.executeTakeFirst();

			const isOrg = org !== undefined;

			if (!isOrg) {
				return error(401, 'User not organizer for this CTF');
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
					approved: false
				})
				.where('challenge_id', '=', challengeId)
				.where('ctf', '=', ctfId)
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
				.executeTakeFirst();

			// const authorAnonymous = formData.get("stay_anonymous") === "1"
			const originalFilesNew = formData.getAll('original_files') as string[];
			const new_files = formData.getAll('files');
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

			let newCommands = await db
				.insertInto('challenge_resources')
				.columns(['challenge', 'type', 'content'])
				.values(
					commands.map((command) => ({ challenge: challengeId, type: 'cmd', content: command }))
				)
				.onConflict((oc) => oc.columns(['challenge', 'type', 'content']).doNothing())
				.execute();

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
			let _newWebsites = await db
				.insertInto('challenge_resources')
				.columns(['challenge', 'type', 'content'])
				.values(
					websites.map((website) => ({ challenge: challengeId, type: 'web', content: website }))
				)
				.onConflict((oc) => oc.columns(['challenge', 'type', 'content']).doNothing())
				.execute();

			const challengeDir = path.join(process.cwd(), `files/${challengeId}`);
			updatedOriginalFiles.forEach((filepath) => {
				try {
					const filename = path.basename(filepath.content);
					const completeFilepath = path.join(challengeDir, filename);
					fs.unlink(completeFilepath);
				} catch (err) {
					console.error('Error deleting file', filepath.content);
				}
			});

			console.log(formData);
		} catch (err) {
			console.log(err);
		}
	}
};
