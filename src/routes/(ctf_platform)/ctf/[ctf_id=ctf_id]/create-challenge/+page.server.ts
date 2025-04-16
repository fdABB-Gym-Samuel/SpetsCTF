import type { Actions } from './$types';
import { fail, error, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import {
	validateCategory,
	get_challenge_id_from_display_name,
	selectedCategoriesToBitset
} from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import type { Insertable } from 'kysely';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sanitize from 'sanitize-filename';

// export const ssr = false
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

export const load = async ({ locals, params }: ServerLoadEvent) => {
	const user = locals.user;
	const ctfId = Number(params.ctf_id);
	if (!user) {
		error(401, { message: 'User not signed in.' });
	}

	const org = await db
		.selectFrom('ctf_organizers')
		.where('ctf', '=', ctfId)
		.where('user_id', '=', user.id)
		.executeTakeFirst();

	const isOrg = org !== undefined;
	if (locals.user?.is_admin || isOrg) {
		redirect(303, 'organizer/create-challenge');
	}
};

export const actions = {
	default: async ({ request, locals, params }) => {
		try {
			const formData = await request.formData();
			const ctfId = Number(params.ctf_id);

			const ctf = await db.selectFrom('ctf_events').where('id', '=', ctfId);

			if (!ctf) {
				return fail(404, { message: 'CTF not found.' });
			}

			const display_name = formData.get('display_name')?.toString() ?? null;
			if (!display_name) {
				return fail(422, { message: 'No display name' });
			}
			const challenge_id = get_challenge_id_from_display_name(display_name);

			const challenge_category: Category = validateCategory(
				formData.get('challenge_category')?.toString() ?? ''
			);
			if (!challenge_category) {
				return fail(422, { message: 'No main category' });
			}

			const sub_categories: string[] = formData.getAll('sub_categories') as string[];
			const categories_list = [challenge_category, ...sub_categories];

			// Check if all categories are allowed
			if (
				!categories_list ||
				categories_list.filter((category) => !categories.includes(category)).length > 0
			) {
				return fail(422, { message: 'Invalid Categories' });
			}

			const challenge_sub_categories = selectedCategoriesToBitset(categories, categories_list);

			const points = formData.get('points')?.toString() ?? '';
			if (!points) {
				return fail(422, { message: 'Cannot insert challenge with no points!' });
			}
			const pointsInt = parseInt(points);
			const flag = formData.get('flag')?.toString() ?? '';
			if (!flag) {
				return fail(422, { message: 'You need to provide flag.' });
			}

			const flag_format = formData.get('flag_format')?.toString() ?? null;

			const flagId = await db
				.insertInto('flag')
				.values({
					flag,
					flag_format
				})
				.returning('id')
				.executeTakeFirstOrThrow();

			const description = formData.get('description')?.toString() ?? null;

			const authorAnonymous = formData.get('stay_anonymous') === '1';

			const challenge: Insertable<Challenges> = {
				challenge_category,
				challenge_sub_categories,
				challenge_id,
				ctf: ctfId,
				points: pointsInt,
				flag: flagId.id,
				display_name,
				description,
				approved: false,
				author: locals.user?.id,
				anonymous_author: authorAnonymous
			};
			await db.insertInto('challenges').values(challenge).execute();

			const files: File[] | null = formData.getAll('files') as File[] | null;
			const commands: string[] | null = formData.getAll('commands') as string[] | null;
			const websites: string[] | null = formData.getAll('websites') as string[] | null;

			let resource_files;
			if (files !== null) {
				const challenge_dir = path.join(process.cwd(), `files/${challenge_id}`);
				await mkdir(challenge_dir, { recursive: true });

				files.forEach((file) => {
					return new File([file], sanitize(file.name), {
						type: file.type,
						lastModified: file.lastModified
					});
				});
				let currently_used_filenames: string[] = [];
				for (let [index, file] of files.entries()) {
					if (currently_used_filenames.includes(file.name)) {
						files[index] = new File([file], sanitize(`${file.name}_${index}`), {
							type: file.type,
							lastModified: file.lastModified
						});
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
						content: path.join(`/challenge_files/${challenge_id}`, file?.name),
						type: 'file'
					};
				});
			}

			let resource_commands;
			if (commands !== null) {
				resource_commands = commands.map((command) => {
					return { challenge: challenge_id, content: command, type: 'cmd' };
				});
			}

			let resource_websites;
			if (websites !== null) {
				resource_websites = websites.map((website) => {
					return { challenge: challenge_id, content: website, type: 'web' };
				});
			}

			if (resource_files && resource_commands && resource_websites) {
				if (
					resource_commands?.length > 0 ||
					resource_files?.length > 0 ||
					resource_websites?.length > 0
				) {
					const resources = [
						...resource_files,
						...resource_commands,
						...resource_websites
					] as Insertable<ChallengeResources>[];
					const _ = await db.insertInto('challenge_resources').values(resources).execute();
				}
			}
			return { success: true, message: 'Challenge successfully submitted for review' };
		} catch (err) {
			const error = err as Error;
			return { success: false, message: error.message };
		}
	}
};
