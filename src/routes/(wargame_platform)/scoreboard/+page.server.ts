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
	const result = db
		.with('challenge_scores', (qb) =>
			qb
				.selectFrom('wargame_submissions as ws')
				.innerJoin('users as u', 'ws.user_id', 'u.id')
				.where('u.is_admin', 'is not', true)
				.innerJoin('challenges as ch', 'ch.challenge_id', 'ws.challenge')
				.leftJoin('ctf_events as ctf', 'ch.ctf', 'ctf.id')
				.where(sql<boolean>`ctf.end_time IS NULL OR ctf.end_time < NOW()`)
				.where('ch.approved', '=', true)
				.where('ws.success', '=', true)
				.where('u.is_admin', 'is not', true)
				.select([
					'u.represents_class as class',
					'ws.challenge',
					sql<number>`count(distinct ws.user_id)`.as('solves'),
					'ch.points as base_points'
				])
				.groupBy(['u.represents_class', 'ws.challenge', 'ch.points'])
		)
		.selectFrom('classes as cl')
		.leftJoin('challenge_scores as cs', 'cs.class', 'cl.name')
		.select([
			'cl.name as class_name',
			sql<number>`round(coalesce(sum(cs.base_points * power(cs.solves, 0.25)), 0), 1)`.as(
				'total_points'
			)
		])
		.groupBy('cl.name')
		.orderBy('total_points', 'desc')
		.execute();

	return result;
};
