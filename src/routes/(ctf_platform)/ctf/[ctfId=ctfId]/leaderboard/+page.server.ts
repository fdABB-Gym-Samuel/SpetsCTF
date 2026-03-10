import {
    error,
    fail,
    redirect,
    type Actions,
    type ServerLoadEvent,
} from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { getIsOrg } from '$lib/db/functions';

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const ctfId = Number(event.params.ctfId);

    const ctf = await db
        .selectFrom('ctf_events')
        .selectAll()
        .where('ctf_events.id', '=', ctfId)
        .executeTakeFirst();

    event.depends(`data:ctf-${ctfId}`);

    if (!ctf) {
        error(404, 'CTF not found');
    }

    const scores = await db
        .with('team_challenges', (qb) =>
            qb
                .selectFrom('ctf_submissions')
                .where('ctf_submissions.time', '<=', ctf.freeze_time)
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
                              AND cs.time <= ${ctf.end_time}
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
                                  AND cs.time <= ${ctf.freeze_time}
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

export const actions = {
    freezeScoreboard: async ({ locals, params }) => {
        const user = locals.user;
        if (!user) {
            return redirect(303, '/login');
        }
        const ctfId = Number(params.ctfId);
        const isOrg = await getIsOrg(user?.id ?? '', ctfId);

        if (!isOrg && !user?.is_admin) {
            return fail(401, {
                success: false,
                message: 'Only admins and organisers can freeze scoreboard',
            });
        }

        const ctf = await db
            .selectFrom('ctf_events')
            .selectAll()
            .where('ctf_events.id', '=', ctfId)
            .executeTakeFirst();

        if (!ctf) {
            return fail(404, {
                success: false,
                message: 'Ctf not found',
            });
        }

        const currentTime = new Date();
        if (ctf?.end_time < currentTime) {
            return fail(403, {
                success: false,
                message: 'Ctf has ended',
            });
        }

        await db
            .updateTable('ctf_events')
            .set('freeze_time', currentTime)
            .where('ctf_events.id', '=', ctf.id)
            .execute();

        return { success: true, message: 'Scoreboard has been frozen' };
    },
    unfreezeScoreboard: async ({ locals, params }) => {
        const user = locals.user;
        if (!user) {
            return redirect(303, '/login');
        }
        const ctfId = Number(params.ctfId);
        const isOrg = await getIsOrg(user?.id ?? '', ctfId);

        if (!isOrg && !user?.is_admin) {
            return fail(401, {
                success: false,
                message: 'Only admins and organisers can unfreeze scoreboard',
            });
        }

        const ctf = await db
            .selectFrom('ctf_events')
            .selectAll()
            .where('ctf_events.id', '=', ctfId)
            .executeTakeFirst();

        if (!ctf) {
            return fail(404, {
                success: false,
                message: 'Ctf not found',
            });
        }

        if (ctf?.end_time.getTime() == ctf?.freeze_time.getTime()) {
            return fail(403, {
                success: false,
                message: 'Scoreboard is already unfrozen',
            });
        }

        await db
            .updateTable('ctf_events')
            .set('freeze_time', ctf.end_time)
            .where('ctf_events.id', '=', ctf.id)
            .execute();

        return { success: true, message: 'Scoreboard has been unfrozen' };
    },
} satisfies Actions;
