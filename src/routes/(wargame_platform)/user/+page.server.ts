import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/database';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/db/functions';

export const load: PageServerLoad = async ({ locals, depends }) => {
    if (!locals.user) {
        redirect(302, '/login');
    }

    depends('data:user');

    const availableClasses = await db.selectFrom('classes').selectAll().execute();

    return {
        availableClasses: availableClasses,
        user: locals.user,
    };
};

export const actions = {
    settings: async ({ request, locals }) => {
        const user = locals.user;

        const form = await request.formData();
        const userId = user ? user.id : '';

        if (!user || !user.id) {
            return fail(400, { success: false });
        }

        const display_name = form.get('display_name')?.toString();
        if (display_name || display_name === '') {
            await db
                .updateTable('users')
                .set({ display_name })
                .where('id', '=', userId)
                .execute();
        }

        const represents_class = form.get('represents_class')?.toString();
        if (represents_class) {
            await db
                .updateTable('users')
                .set({ represents_class })
                .where('id', '=', userId)
                .execute();
        }

        // We want to return the new values for both display name and represents class.
        const updatedUser = await db
            .selectFrom('users')
            .select(['display_name', 'represents_class'])
            .where('id', '=', userId)
            .executeTakeFirst();

        console.log(updatedUser?.display_name);

        if (!updatedUser) {
            fail(500, {
                success: false,
                message: 'Something went wrong on the server.',
            });
        } else {
            return {
                success: true,
                display_name: updatedUser.display_name,
                represents_class: updatedUser.represents_class,
            };
        }
    },
    logout: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        } else {
            await invalidateSession(event.locals.session.id);
            event.locals.user = undefined;
            event.locals.session = undefined;
            deleteSessionTokenCookie(event);
            return { success: true };
        }
    },
} satisfies Actions;
