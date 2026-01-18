import { db } from '$lib/db/database.js';
import { getStateDirectory } from '$lib/server/directories';
import { error, type RequestEvent } from '@sveltejs/kit';
import { createReadableStream } from '@sveltejs/kit/node';
import path from 'node:path';
import sanitize from 'sanitize-filename';

export async function GET({ params }: RequestEvent) {
    const challengeId = params.challengeId ?? '';
    const filename = params.filename ?? '';
    if (!challengeId || !filename) {
        error(422, { message: 'You must provide both challengeId and file name.' });
    }

    const challenge = await db
        .selectFrom('challenges')
        .where('challenge_id', '=', challengeId)
        .select(['approved', 'ctf', 'challenge_id'])
        .executeTakeFirst();

    if (!challenge) {
        console.log('couldnt find chall');
        error(404, 'Challenge not found.');
    }

    if (!challenge.approved) {
        return error(403, {
            message:
                "Challenge hasn't been approved, all resources belonging to this file have not been confirmed to be safe.",
        });
    }

    const resource = await db
        .selectFrom('challenge_resources')
        .where('challenge', '=', challenge.challenge_id)
        .where('type', '=', 'file')
        .where('content', '=', filename)
        .selectAll()
        .executeTakeFirst();

    if (!resource) {
        console.log('couldnt find resource');
        error(404, 'Could not find file.');
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

    const sanitizedChallengeId = sanitize(challengeId);
    const sanitizedFilename = sanitize(filename);

    const baseDir = path.join(getStateDirectory(), 'files', sanitizedChallengeId);
    const filepath = path.join(baseDir, sanitizedFilename);

    const resolvedPath = path.resolve(filepath);
    const resolvedBase = path.resolve(baseDir);

    if (
        !resolvedPath.startsWith(resolvedBase + path.sep) &&
        resolvedPath !== resolvedBase
    ) {
        error(403, 'Invalid file path.');
    }

    try {
        const reader = createReadableStream(filepath);
        return new Response(reader, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${sanitize(path.basename(filepath))}"`,
            },
        });
    } catch {
        console.log('couldnt read file, ', filepath);
        error(404, 'Could not find file.');
    }
}
