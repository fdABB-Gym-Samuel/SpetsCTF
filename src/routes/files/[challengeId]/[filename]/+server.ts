import { db } from '$lib/db/database.js';
import { getStateDirectory } from '$lib/server/directories';
import { error, type RequestEvent } from '@sveltejs/kit';
import { createReadableStream } from '@sveltejs/kit/node';
import path from 'path';

export async function GET({ params }: RequestEvent) {
    const challengeId = params.challengeId ?? '';
    const filename = params.filename ?? '';
    if (!challengeId || !filename) {
        error(422, { message: 'You must provide both challengeId and file name.' });
    }

    const challenge = await db
        .selectFrom('challenges')
        .where('challenge_id', '=', challengeId)
        .select(['approved', 'ctf'])
        .executeTakeFirst();

    if (!challenge) {
        error(404);
    }

    if (!challenge.approved) {
        return error(403, {
            message:
                "Challenge hasn't been approved, all resources belonging to this file have not been confirmed to be safe.",
        });
    }

    if (challenge.ctf) {
        // Extra checks for CTF.
        const ctf = await db
            .selectFrom('ctf_events')
            .where('id', '=', challenge.ctf)
            .selectAll()
            .executeTakeFirst();

        if (!ctf) {
            error(404);
        }

        const now = new Date();
        if (now < ctf.start_time) {
            error(403, {
                message: "🤓☝️ Erm, ackshually, the CTF hasn't started yet. 🤓☝️",
            });
        }
    }

    const filepath = path.join(getStateDirectory(), 'files', challengeId, filename);

    const reader = createReadableStream(filepath);
    return new Response(reader, {
        status: 200,
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${path.basename(filepath)}"`,
        },
    });
}
