import type { Actions } from './$types';
import { fail, error, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { validateCategory } from '$lib/db/functions';
import type { Category, Challenges } from '$lib/db/db';
import type { Insertable } from 'kysely';

export const load = async ({ locals }: ServerLoadEvent) => {
	if (locals.user?.is_admin !== true) {
		error(400, { message: 'Not authorized' });
	}
};

export const actions = {
	default: async ({ request }) => {
		try {
			const formData = await request.formData();
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

			const challenge: Insertable<Challenges> = {
				challenge_category,
				challenge_id,
				points: pointsInt,
				flag: flagId.id,
				display_name
			};

			await db.insertInto('challenges').values(challenge).execute();

			return { success: true };
		} catch {
			return { success: false };
		}
	}
} satisfies Actions;
