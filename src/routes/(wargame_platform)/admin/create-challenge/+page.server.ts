import type { Actions } from './$types';
import { fail, error, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { validateCategory, get_challenge_id_from_display_name } from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import type { Insertable } from 'kysely';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sanitize from 'sanitize-filename';

// export const ssr = false

export const load = async ({ locals }: ServerLoadEvent) => {
	if (locals.user?.is_admin !== true) {
		error(401, { message: 'Not authorized' });
	}
};

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = await request.formData();

			const display_name = formData.get('display_name')?.toString() ?? null;
			if (!display_name) {
				return fail(422, { message: 'No display name' });
			}
			const challenge_id = get_challenge_id_from_display_name(display_name);

			const challenge_category: Category = validateCategory(
				formData.get('challenge_category')?.toString() ?? ''
			);
			// const challenge_id = formData.get('challenge_id')?.toString() ?? '';
			// const valid_challenge_id_chars = /^[a-zA-Z0-9_]+/
			// console.log(sanitize(challenge_id))
			// if (!challenge_id) {
			// 	fail(422, { message: 'Cannot insert challenge with no ID!' });
			// }
			// if (!valid_challenge_id_chars.test(challenge_id)){
			// 	console.log("not allowed")
			// 	fail(422, {message: "Challenge ID includes characters that are not allowed (A-Z, a-z, 0-9, _"})
			// }

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

			const challenge: Insertable<Challenges> = {
				challenge_category,
				challenge_id,
				points: pointsInt,
				flag: flagId.id,
				display_name,
				description
			};

			await db.insertInto('challenges').values(challenge).execute();

			const files: File[] | null = formData.getAll('files') as File[] | null;
			const commands: string[] | null = formData.getAll('commands') as string[] | null;
			const websites: string[] | null = formData.getAll('websites') as string[] | null;

			let resource_files;
			if (files !== null) {
				const challenge_dir = path.join(process.cwd(), `files/${challenge_id}`);
				await mkdir(challenge_dir, { recursive: true });

				for (let file of files) {
					let filepath = path.join(challenge_dir, sanitize(file.name));

					await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
				}

				// const filepath = path.join(challenge_dir, file.name);
				resource_files = files.map((file) => {
					return {
						challenge: challenge_id,
						content: path.join(challenge_dir, file?.name),
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
			return { success: true, message: 'Challenge uploaded successfully' };
		} catch (err) {
			const error = err as Error;
			return { success: false, message: error.message };
		}
	}
} satisfies Actions;
