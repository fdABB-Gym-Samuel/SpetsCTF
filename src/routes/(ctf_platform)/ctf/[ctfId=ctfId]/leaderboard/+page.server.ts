import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const ctfId = Number(event.params.ctfId);

    const scores = await db
        .with('team_challenges', (qb) =>
            qb
                .selectFrom('ctf_submissions')
                .leftJoin('users', 'ctf_submissions.user_id', 'users.id')
                .where('users.is_admin', 'is not', true)
                .innerJoin(
                    'ctf_teams_members',
                    'ctf_submissions.user_id',
                    'ctf_teams_members.user_id'
                )
                .innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
                .where('ctf_teams.ctf', '=', ctfId)
                .innerJoin(
                    'challenges',
                    'ctf_submissions.challenge',
                    'challenges.challenge_id'
                )
                .where('challenges.ctf', '=', ctfId)
                .where('approved', '=', true)
                .where('ctf_submissions.success', '=', true)
                .select([
                    'ctf_teams.id as team_id',
                    'ctf_teams.name as team_name',
                    'ctf_submissions.challenge as challenge_id',
                    'challenges.points as points',
                ])
                .groupBy([
                    'ctf_teams.id',
                    'ctf_teams.name',
                    'ctf_submissions.challenge',
                    'challenges.points',
                ])
        )
        .selectFrom('ctf_teams')
        .leftJoin('team_challenges', 'ctf_teams.id', 'team_challenges.team_id')
        .where('ctf_teams.ctf', '=', ctfId)
        .select([
            'ctf_teams.id as team_id',
            'ctf_teams.name as team_name',
            sql<number>`coalesce(sum(team_challenges.points), 0)`.as('total_points'),
        ])
        .groupBy(['ctf_teams.id', 'ctf_teams.name'])
        .orderBy('total_points', 'desc')
        .execute();

    return { scores };
};
