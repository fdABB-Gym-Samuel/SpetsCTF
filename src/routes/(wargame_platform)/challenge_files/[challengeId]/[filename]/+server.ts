import { db } from '$lib/db/database.js';
import { error, type RequestEvent } from '@sveltejs/kit';
import fs from 'fs/promises';
import { sql } from 'kysely';
import path from 'path';

export async function GET({ params }: RequestEvent) {
	const challengeId = params.challengeId ?? '';
	const filename = params.filename as string;

	const ctf = await db
		.selectFrom('challenges')
		.leftJoin('ctf_events', 'challenges.ctf', 'ctf_events.id')
		.select(sql`ctf_events.start_time < NOW() OR challenges.ctf IS NULL`.as('hasStarted'))
		.where('challenges.challenge_id', '=', challengeId)
		.executeTakeFirst();

	if (ctf?.hasStarted) {
		try {
			const challenge = await db
				.selectFrom('challenges')
				.select('approved')
				.where('challenge_id', '=', challengeId)
				.executeTakeFirstOrThrow();

			if (!challenge.approved) {
				return error(403, {
					message:
						"Challenge hasn't been approved, all resources belonging to this file have not been confirmed to be safe."
				});
			}
			const filepath = path.join(process.cwd(), 'files', challengeId, filename);
			const file = await fs.readFile(filepath);
			return new Response(file, {
				status: 200,
				headers: {
					'Content-Type': 'application/octet-stream',
					'Content-Disposition': `attachment; filename="${path.basename(filepath)}"`
				}
			});
		} catch (error) {
			throw error;
		}
	} else {
		return new Response("🤓☝️ Erm, ackshually, the CTF hasn't started yet. 🤓☝️", { status: 403 });
	}
}
