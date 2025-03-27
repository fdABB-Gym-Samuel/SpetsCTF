import { db } from '$lib/db/database';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends, params }) => {
    const user = locals.user;
    const team = await db
        .selectFrom('ctf_teams_members')
        .innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
        .select([
            'ctf_teams.id as teamId',
            'ctf_teams.name as teamName',
            'ctf_teams.website'
        ])
        .where('ctf_teams_members.user_id', '=', user.id)
        .where('ctf_teams.ctf', '=', params.ctf_id)
        .executeTakeFirst();

    depends('data:user');

    return {
        translations: locals.translations,
        user,
        team
    };
};