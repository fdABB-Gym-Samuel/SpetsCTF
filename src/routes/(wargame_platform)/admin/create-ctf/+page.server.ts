import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import type { CtfEvents } from '$lib/db/db';
import type { Insertable } from 'kysely';

export const actions = {
	default: async ({ locals, request }) => {
		if (locals.user?.is_admin === true) {
			const form = await request.formData();
			const display_name = form.get('display_name')?.toString();
			const short_name = form.get('short_name')?.toString();
			const max_team_size = form.get('max_team_size')?.toString();
			const start_time = form.get('start_time')?.toString();
			const end_time = form.get('end_time')?.toString();

			let max_team_size_parsed: number | null = Math.floor(Number(max_team_size ?? ''));
			if (isNaN(max_team_size_parsed)) {
				max_team_size_parsed = null;
			}

			if (max_team_size_parsed !== null && max_team_size_parsed < 1){
				return fail(400, { message: "Max team-size must be at least 1"})
			}

			if (!display_name) {
				return fail(422, { message: 'Display name missing' });
			}

			if (!short_name) {
				return fail(422, { message: 'Short name missing' });
			}

			if (!end_time) {
				return fail(422, { message: 'End time missing.' });
			}

			if (!start_time) {
				return fail(422, { message: 'Start time missing.' });
			}

			const start_time_date = new Date(start_time);
			const end_time_date = new Date(end_time);

			if (start_time_date >= end_time_date) {
				return fail(422, { message: 'End time before start time.' });
			}

			const vals: Insertable<CtfEvents> = {
				start_time,
				end_time,
				max_team_size: max_team_size_parsed,
				display_name,
				short_name
			};
			await db.insertInto('ctf_events').values(vals).execute();
		} else {
			fail(401, { message: 'Not authorized' });
		}
	}
} satisfies Actions;
