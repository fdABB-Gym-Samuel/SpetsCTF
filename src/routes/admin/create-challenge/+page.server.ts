import type { Actions } from './$types';
import { fail, error, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { validateCategory } from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import type { Insertable } from 'kysely';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// export const ssr = false

export const load = async ({ locals }: ServerLoadEvent) => {
	if (locals.user?.is_admin !== true) {
		error(400, { message: 'Not authorized' });
	}
};

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
			// files =
			console.log(formData);

			const challenge_category: Category = validateCategory(
				formData.get('challenge_category')?.toString() ?? ''
			);
			const challenge_id = formData.get('challenge_id')?.toString() ?? '';
			if (!challenge_id) {
				fail(422, { message: 'Cannot insert challenge with no ID!' });
			}
			const points = formData.get('points')?.toString() ?? '';
			if (!points) {
				fail(422, { message: 'Cannot insert challenge with no points!' });
			}
			const pointsInt = parseInt(points);
			const flag = formData.get('flag')?.toString() ?? '';
			if (!flag) {
				fail(422, { message: 'You need to provide flag.' });
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

			const display_name = formData.get('display_name')?.toString() ?? null;

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

			const files: (File | null)[] = formData.getAll('files') as File[] | null;
			const commands: (string | null)[] = formData.getAll('commands') as string[] | null;
			const websites: (string | null)[] = formData.getAll('websites') as string[] | null;

			const challenge_dir = path.join(process.cwd(), `files/${challenge_id}`);
			await mkdir(challenge_dir, { recursive: true });
			for (let file of files) {
				let filepath = path.join(challenge_dir, file.name);
				await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
			}
			// const filepath = path.join(challenge_dir, file.name);
			const resource_files = files.map((file) => {
				return {
					challenge: challenge_id,
					content: path.join(challenge_dir, file?.name),
					type: 'file'
				};
			});
			const resource_commands = commands.map((command) => {
				return { challenge: challenge_id, content: command, type: 'cmd' };
			});
			const resource_websites = commands.map((website) => {
				return { challenge: challenge_id, content: website, type: 'web' };
			});
			const resources = [...resource_files, ...resource_commands, ...resource_websites];

			if (resources.length > 0) {
				const _ = await db.insertInto('challenge_resources').values(resources).execute();
			}

			return { success: true };
		} catch {
			return { success: false };
		}
	}
} satisfies Actions;
