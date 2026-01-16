import {
    error,
    redirect,
    fail,
    type Actions,
    type ServerLoadEvent,
} from '@sveltejs/kit';
import { db } from '$lib/db/database';
import type { CtfEvents } from '$lib/generated/db';
import type { Insertable } from 'kysely';
import { formatRequestedName } from '$lib/utils/utils';

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
    default: async ({ locals, request }) => {
        if (locals.user?.is_admin === true) {
            const form = await request.formData();
            const displayName = form.get('display_name')?.toString();
            const maxTeamSize = form.get('max_team_size')?.toString();
            const startTime = form.get('start_time')?.toString();
            const endTime = form.get('end_time')?.toString();

            let maxTeamSizeParsed: number | null = Math.floor(
                Number(maxTeamSize ?? '')
            );
            if (isNaN(maxTeamSizeParsed)) {
                maxTeamSizeParsed = null;
            }

            if (!displayName) {
                return fail(422, { message: 'Display name missing' });
            }

            const shortName = formatRequestedName(displayName);

            if (shortName.length === 0) {
                return fail(422, { message: 'Short name missing' });
            }

            if (!endTime) {
                return fail(422, { message: 'End time missing.' });
            }

            if (!startTime) {
                return fail(422, { message: 'Start time missing.' });
            }

            const startTimeDate = new Date(startTime);
            const endTimeDate = new Date(endTime);

            if (startTimeDate >= endTimeDate) {
                return fail(422, { message: 'End time before start time.' });
            }

            const vals: Insertable<CtfEvents> = {
                start_time: startTime,
                end_time: endTime,
                max_team_size: maxTeamSizeParsed,
                display_name: displayName,
                short_name: shortName,
            };
            await db.insertInto('ctf_events').values(vals).execute();
        } else {
            return fail(401, { message: 'Not authorized' });
        }
    },
} satisfies Actions;
