import { db } from '$lib/db/database';
import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getIsOrg } from '$lib/db/functions';

export const load: LayoutServerLoad = async ({ locals, depends, params }) => {
    const user = locals.user;
    const ctfId = Number(params.ctf_id);

    const ctf_data = await db
        .selectFrom('ctf_events')
        .select([
            'ctf_events.display_name',
            'ctf_events.start_time',
            'ctf_events.end_time',
            'ctf_events.max_team_size',
        ])
        .where('id', '=', ctfId)
        .executeTakeFirst();

    if (ctf_data === undefined) {
        error(404, { message: 'CTF does not exist.' });
    }

    let team;
    let isOrg;
    if (!user) {
        team = null;
    } else {
        isOrg = (await getIsOrg(user.id, ctfId)) || user.is_admin;

        team = await db
            .selectFrom('ctf_teams_members')
            .innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
            .select([
                'ctf_teams.id as teamId',
                'ctf_teams.name as teamName',
                'ctf_teams.website',
            ])
            .where('ctf_teams_members.user_id', '=', user.id)
            .where('ctf_teams.ctf', '=', ctfId)
            .executeTakeFirst();
    }
    depends('data:user');

    return {
        translations: locals.translations,
        user,
        team,
        isOrg,
        ctf_data,
    };
};
