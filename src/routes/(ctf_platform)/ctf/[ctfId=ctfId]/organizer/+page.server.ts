import {
    error,
    fail,
    redirect,
    type ServerLoadEvent,
    type Actions,
} from '@sveltejs/kit';
import { db } from '$lib/db/database';
import { getIsOrg } from '$lib/db/functions';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { sql, type SqlBool } from 'kysely';

interface SearchedUser {
    id: string;
    display_name: string;
    github_username: string;
}

export const load = async ({ locals, params, url, depends }: ServerLoadEvent) => {
    const user = locals.user;
    const ctfId = Number(params.ctfId);
    if (!user) {
        return redirect(303, '/login');
    }

    const isOrg = await getIsOrg(user.id, ctfId);

    if (!user.is_admin && !isOrg) {
        return error(401, { message: 'Not authorized' });
    }

    const organizers = await db
        .selectFrom('ctf_organizers')
        .where('ctf', '=', ctfId)
        .select(({ selectFrom }) =>
            jsonObjectFrom(
                selectFrom('users')
                    .whereRef('users.id', '=', 'ctf_organizers.user_id')
                    .select(['github_username', 'display_name', 'id'])
                    .limit(1)
            ).as('user')
        )
        .execute();
    depends(`data:ctf-${ctfId}-organizers`);

    const userSearchParam = url.searchParams.get('searchUser');
    let userSearchResults: Promise<SearchedUser[]> | undefined = undefined;
    if (userSearchParam !== null) {
        userSearchResults = db
            .selectFrom('users')
            .select(['id', 'github_username', 'display_name'])
            .where('users.is_admin', 'is not', true)
            .where(
                () =>
                    sql<boolean>`
                        GREATEST(
                            similarity(github_username, ${userSearchParam}),
                            similarity(display_name, ${userSearchParam})
                        ) > 0
                    `
            )
            .where(
                sql<SqlBool>`
                    NOT EXISTS (
                        SELECT 1
                        FROM ctf_organizers o
                        WHERE o.user_id = users.id
                            AND o.ctf = ${ctfId}
                    )
                `
            )
            .orderBy(
                () =>
                    sql<number>`
                        GREATEST(
                            similarity(github_username, ${userSearchParam}),
                            similarity(display_name, ${userSearchParam})
                        )
                    `,
                'desc'
            )
            .limit(20)
            .execute()
            .then((matchingUsers) =>
                matchingUsers.map((elem) => ({
                    id: elem.id,
                    display_name: elem.display_name ?? 'No display name',
                    github_username: elem.github_username ?? 'No GitHub username',
                }))
            );
    }

    return { userSearchResults, organizers };
};

export const actions = {
    addOrganizer: async ({ request, locals, params }) => {
        const user = locals.user;
        const ctfId = Number(params.ctfId);

        if (!user) {
            return redirect(303, '/login');
        }

        const isOrg = await getIsOrg(user.id, ctfId);

        if (!user.is_admin && !isOrg) {
            return fail(401, { message: 'User not organizer of CTF or admin' });
        }

        const ctf = await db
            .selectFrom('ctf_events')
            .select('end_time')
            .where('id', '=', ctfId)
            .executeTakeFirst();

        if (ctf === undefined) {
            return fail(404, { success: false, message: 'CTF not found' });
        }
        if (ctf.end_time < new Date()) {
            return fail(403, { success: false, message: 'CTF has already ended' });
        }

        const formData = await request.formData();

        const githubUsername = formData.get('github_username')?.toString() ?? '';
        if (!githubUsername) {
            return fail(400, {
                success: false,
                message: 'No username to add as organizer was provided.',
            });
        }

        const targetUser = await db
            .selectFrom('users')
            .select(['id'])
            .where('github_username', '=', githubUsername)
            .executeTakeFirst();
        if (!targetUser) {
            return fail(404, {
                success: false,
                message: 'No such github username found.',
            });
        }

        const existingOrgRegistrations = await db
            .selectFrom('ctf_organizers')
            .where('user_id', '=', targetUser.id)
            .where('ctf', '=', ctfId)
            .execute();

        if (existingOrgRegistrations.length > 0) {
            return fail(401, { success: false, message: 'User is already organizer.' });
        }

        try {
            await db.transaction().execute(async (trx) => {
                const team = await trx
                    .selectFrom('ctf_teams as t')
                    .select(['t.id'])
                    .innerJoin('ctf_teams_members as m', 'm.team', 't.id')
                    .select(
                        trx.fn.count(trx.dynamic.ref('m.user_id')).as('member_count')
                    )
                    .where((eb) =>
                        eb.and([
                            eb('t.ctf', '=', ctfId),
                            eb.exists(
                                trx
                                    .selectFrom('ctf_teams_members as mem')
                                    .whereRef('mem.team', '=', trx.dynamic.ref('t.id'))
                                    .where('mem.user_id', '=', targetUser.id)
                            ),
                        ])
                    )
                    .groupBy('t.id')
                    .executeTakeFirst();

                if (team !== undefined) {
                    await trx
                        .deleteFrom('ctf_teams_members')
                        .where('team', '=', team.id)
                        .where('user_id', '=', targetUser.id)
                        .executeTakeFirstOrThrow();

                    if (Number(team.member_count) < 2) {
                        await trx
                            .deleteFrom('ctf_teams')
                            .where('ctf_teams.id', '=', team.id)
                            .executeTakeFirstOrThrow();
                    }
                }

                await trx
                    .insertInto('ctf_organizers')
                    .values({ user_id: targetUser.id, ctf: ctfId })
                    .executeTakeFirstOrThrow();
            });
        } catch {
            error(500, { message: 'Failed to insert records.' });
        }
        return { success: true, message: '' };
    },
    deleteOrganizer: async ({ request, locals, params }) => {
        const user = locals.user;
        const ctfId = Number(params.ctfId);

        if (!user) {
            return redirect(303, '/login');
        }

        const isOrg = await getIsOrg(user.id, ctfId);

        if (!user.is_admin && !isOrg) {
            return fail(401, { message: 'User not organizer of CTF or admin' });
        }

        const ctf = await db
            .selectFrom('ctf_events')
            .select('end_time')
            .where('id', '=', ctfId)
            .executeTakeFirst();

        if (ctf === undefined) {
            return fail(404, { success: false, message: 'CTF not found' });
        }
        if (ctf.end_time < new Date()) {
            return fail(403, { success: false, message: 'CTF has already ended' });
        }

        const formData = await request.formData();

        const userId = formData.get('user_id')?.toString() ?? '';
        if (!userId)
            return fail(400, {
                success: false,
                message: 'No user ID to delete provided.',
            });

        const userMetadata = await db
            .selectFrom('users')
            .where('id', '=', userId)
            .select(['id'])
            .executeTakeFirst();
        if (!userMetadata) {
            return fail(404, { success: false, message: 'No such user found.' });
        }

        if (userMetadata.id === user.id) {
            return fail(400, {
                success: false,
                message:
                    'You cannot delete yourself as an organizer. Contact an admin for help.',
            });
        }

        const existingOrganizerRegistrations = await db
            .selectFrom('ctf_organizers')
            .where('user_id', '=', userMetadata.id)
            .where('ctf', '=', ctfId)
            .execute();
        if (existingOrganizerRegistrations.length < 1) {
            return fail(404, {
                success: false,
                message: 'No such organizer exists on the CTF.',
            });
        }

        try {
            await db
                .deleteFrom('ctf_organizers')
                .where('user_id', '=', userMetadata.id)
                .where('ctf', '=', ctfId)
                .execute();
        } catch {
            error(500, { message: 'Failed to delete organizer.' });
        }
    },
} satisfies Actions;
