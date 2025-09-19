import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from '../user/$types';
import { db } from '$lib/db/database';
import { sql } from 'kysely';

export const load: PageServerLoad = async ({ locals }: ServerLoadEvent) => {
    const top_users = await get_top_users();
    const top_classes = await get_top_classes();

    return { users_scoreboard: top_users, classes_scoreboard: top_classes };
};

const get_top_users = async () => {
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
        .select(['u.id', 'u.display_name', 'u.represents_class'])
        .where('u.is_admin', 'is not', true)
        .select(({ fn }) => fn.coalesce(fn.sum('c.points'), sql`0`).as('total_points'))
        .groupBy(['u.id', 'u.display_name', 'u.represents_class'])
        .orderBy('total_points', 'desc')
        .execute();

    return result;
};

const get_top_classes = async () => {
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
