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
                // Exclude challenges where author is on this team
                .where(
                    sql<boolean>`NOT EXISTS (
                        SELECT 1 FROM challenges c
                        INNER JOIN ctf_teams_members ctm_auth ON c.author = ctm_auth.user_id
                        WHERE c.challenge_id = ctf_submissions.challenge
                          AND ctm_auth.team = ctf_teams.id
                    )`
                )
                .select([
                    'ctf_teams.id as team_id',
                    'ctf_teams.name as team_name',
                    'ctf_submissions.challenge as challenge_id',
                    sql<number>`(
                        CASE 
                          WHEN (
                            SELECT COUNT(DISTINCT ctm.team)
                            FROM ctf_submissions cs
                            INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
                            INNER JOIN ctf_teams ct ON ctm.team = ct.id
                            INNER JOIN challenges ch ON cs.challenge = ch.challenge_id
                            WHERE cs.challenge = ctf_submissions.challenge
                              AND cs.success = true
                              AND ct.ctf = ${ctfId}
                              AND ctm.team != COALESCE((
                                SELECT ctm_author.team 
                                FROM ctf_teams_members ctm_author
                                INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                                WHERE ctm_author.user_id = ch.author
                                  AND ct_author.ctf = ${ctfId}
                                LIMIT 1
                              ), -1)
                          ) = 0 
                          THEN 500
                          ELSE GREATEST(
                            CEIL(
                              (((100.0 - 500.0) / POWER(15.0, 2)) * 
                              POWER((
                                SELECT COUNT(DISTINCT ctm.team)
                                FROM ctf_submissions cs
                                INNER JOIN ctf_teams_members ctm ON cs.user_id = ctm.user_id
                                INNER JOIN ctf_teams ct ON ctm.team = ct.id
                                INNER JOIN challenges ch ON cs.challenge = ch.challenge_id
                                WHERE cs.challenge = ctf_submissions.challenge
                                  AND cs.success = true
                                  AND ct.ctf = ${ctfId}
                                  AND ctm.team != COALESCE((
                                    SELECT ctm_author.team 
                                    FROM ctf_teams_members ctm_author
                                    INNER JOIN ctf_teams ct_author ON ctm_author.team = ct_author.id
                                    WHERE ctm_author.user_id = ch.author
                                      AND ct_author.ctf = ${ctfId}
                                    LIMIT 1
                                  ), -1)
                              ), 2)) + 501
                            ),
                            100
                          )
                        END
                    )`.as('points'),
                ])
                .groupBy([
                    'ctf_teams.id',
                    'ctf_teams.name',
                    'ctf_submissions.challenge',
                    sql.ref('points'),
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
