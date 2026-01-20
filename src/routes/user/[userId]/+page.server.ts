import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { sql, type Selectable } from 'kysely';
import type { Challenges, CtfTeams } from '$lib/generated/db';

export const load: PageServerLoad = async (event) => {
    const wantedUserId = event.params.userId;
    const userId = event.locals.user?.id;

    if (!wantedUserId) error(404);

    const wantedUser = await db
        .selectFrom('users')
        .where('id', '=', wantedUserId)
        .selectAll()
        .executeTakeFirst();

    if (!wantedUser || (!wantedUser.display_name && wantedUser.id != userId))
        error(404);

    const authoredChallenges: Selectable<Challenges>[] = await db
        .selectFrom('challenges')
        .where('author', '=', wantedUser.id)
        .selectAll()
        .execute();

    const solvedChallenges = await db
        .selectFrom('challenges')
        .innerJoin('wargame_submissions', (join) =>
            join
                .onRef('challenges.challenge_id', '=', 'wargame_submissions.challenge')
                .on('wargame_submissions.success', '=', true)
                .on('wargame_submissions.user_id', '=', wantedUser.id)
        )
        .selectAll('challenges')
        .select(sql<string>`MIN(wargame_submissions.time)`.as('solve_time'))
        .groupBy('challenges.challenge_id')
        .execute();

    const participatedCtfs = await db
        .selectFrom('ctf_teams_members')
        .where('ctf_teams_members.user_id', '=', wantedUser.id)
        .innerJoin('ctf_teams', 'ctf_teams_members.team', 'ctf_teams.id')
        .innerJoin('ctf_events', 'ctf_teams.ctf', 'ctf_events.id')
        .selectAll('ctf_events')
        .select(() => [sql<Selectable<CtfTeams>>`row_to_json(ctf_teams.*)`.as('team')])
        .execute();

    return {
        authoredChallenges,
        participatedCtfs,
        solvedChallenges,
        userInfo: wantedUser,
    };
};
