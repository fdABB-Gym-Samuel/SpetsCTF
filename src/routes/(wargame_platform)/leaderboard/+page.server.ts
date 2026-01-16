import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';
import { User } from '@lucide/svelte';

export const load: PageServerLoad = async ({ locals }) => {
    const topUsers = await getTopUsers(locals.user);
    const topClasses = await getTopClasses();

    return { usersScoreboard: topUsers, classesScoreboard: topClasses };
};

const getTopUsers = async (user) => {
    const result = await db
        .selectFrom('users as u')
        .where('is_admin', 'is not', true)
        .leftJoin(
            db
                .selectFrom('wargame_submissions')
                .select(['user_id', 'challenge'])
                .where('success', '=', true)
                .distinctOn(['user_id', 'challenge'])
                .as('ws'),
            'u.id',
            'ws.user_id'
        )
        .leftJoin('challenges as c', 'ws.challenge', 'c.challenge_id')
        .leftJoin('ctf_events as ctf', 'c.ctf', 'ctf.id')
        .where(sql<boolean>`ctf.end_time IS NULL OR ctf.end_time < NOW()`)
        .where('c.approved', '=', true)
        .select([
            'u.display_name',
            sql<string>`
                CASE
                    WHEN (u.display_name = '' OR u.display_name IS NULL) and u.id != ${user.id} THEN '-'
                    else u.represents_class
                END
            `.as('represents_class'),
            sql<string>`
                case
                    when (u.display_name = '' or u.display_name IS NULL) and u.id != ${user.id} then '00000000-0000-0000-0000-000000000000'
                    else u.id
                end
            `.as('id'),
        ])
        .where('u.is_admin', 'is not', true)
        .select(({ fn }) => fn.coalesce(fn.sum('c.points'), sql`0`).as('total_points'))
        .groupBy(['u.id', 'u.display_name', 'u.represents_class'])
        .orderBy('total_points', 'desc')
        .execute();
    return result;
};

const getTopClasses = async () => {
    const result = await db
        .with('solved', (eb) =>
            eb
                .selectFrom('wargame_submissions')
                .select(['challenge', 'user_id'])
                .innerJoin(
                    'challenges',
                    'wargame_submissions.challenge',
                    'challenges.challenge_id'
                )
                .where('wargame_submissions.success', '=', true)
                .where('challenges.approved', '=', true)
                .unionAll((eb2) =>
                    eb2
                        .selectFrom('ctf_submissions')
                        .select(['challenge', 'user_id'])
                        .innerJoin(
                            'challenges',
                            'ctf_submissions.challenge',
                            'challenges.challenge_id'
                        )
                        .leftJoin('ctf_events', 'challenges.ctf', 'ctf_events.id')
                        .where('ctf_submissions.success', '=', true)
                        .where('challenges.approved', '=', true)
                        .where((qb) =>
                            qb.or([
                                qb('challenges.ctf', 'is', null),
                                qb('ctf_events.end_time', '<', new Date()),
                            ])
                        )
                )
        )

        .with('per_ch', (eb) =>
            eb
                .selectFrom('solved')
                .innerJoin('users', 'solved.user_id', 'users.id')
                .innerJoin('classes', 'users.represents_class', 'classes.name')
                .select([
                    sql`classes.name`.as('className'),
                    sql`solved.challenge`.as('challenge'),
                    sql`COUNT(DISTINCT solved.user_id)`.as('solved_count'),
                ])
                .where('users.is_admin', 'is not', true)
                .groupBy(['classes.name', 'solved.challenge'])
        )

        .with('scored', (eb) =>
            eb
                .selectFrom('per_ch')
                .innerJoin('challenges', 'per_ch.challenge', 'challenges.challenge_id')
                .select([
                    'per_ch.className',
                    sql<number>`POWER(per_ch.solved_count::float, 0.25) * challenges.points`.as(
                        'score'
                    ),
                ])
        )

        .selectFrom('classes')
        .leftJoin('scored', 'classes.name', 'scored.className')
        .select([
            'classes.name as className',
            sql<number>`ROUND(COALESCE(SUM(scored.score), 0)::numeric, 1)`.as(
                'totalPoints'
            ),
        ])
        .groupBy('classes.name')
        .orderBy('totalPoints', 'desc')
        .execute();

    return result;
};
