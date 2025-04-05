import { db } from '$lib/db/database.js';
import type { RequestEvent } from '@sveltejs/kit';
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
			console.error('Error reading file:', error);
			return new Response('File not found', { status: 404 });
		}
	} else {
		return new Response("🤓☝️ Erm, ackshually, the CTF hasn't started yet. 🤓☝️", { status: 400 });
	}
}
