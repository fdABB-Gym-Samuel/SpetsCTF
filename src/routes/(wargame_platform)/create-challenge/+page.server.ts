import type { Actions } from './$types';
import { fail, error, redirect, type ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/db/database';
import {
    validateCategory,
    get_challenge_id_from_display_name,
    selectedCategoriesToBitset
} from '$lib/db/functions';
import type { Category, ChallengeResources, Challenges } from '$lib/db/db';
import type { Insertable } from 'kysely';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sanitize from 'sanitize-filename';

// export const ssr = false
let categories = [
    'crypto',
    'forensics',
    'introduction',
    'misc',
    'osint',
    'pwn',
    'reversing',
    'web'
];

export const load = async ({ locals }: ServerLoadEvent) => {
    if (locals.user?.is_admin === true) {
        redirect(303, "/admin/create-challenge");
    }
};

export const actions = {
    default: async ({ request }) => {
        try{
            const formData = await request.formData();
            
            const display_name = formData.get('display_name')?.toString() ?? null;
            if (!display_name) {
                return fail(422, { message: 'No display name' });
            }
            const challenge_id = get_challenge_id_from_display_name(display_name);

            const challenge_category: Category = validateCategory(
                formData.get('challenge_category')?.toString() ?? ''
            );
            if (!challenge_category) {
                return fail(422, { message: 'No main category' });
            }

            const sub_categories: string[] = formData.getAll('sub_categories') as string[];
            const categories_list = [challenge_category, ...sub_categories];

            // Check if all categories are allowed
            if (
                !categories_list ||
                categories_list.filter((category) => !categories.includes(category)).length > 0
            ) {
                return fail(422, { message: 'Invalid Categories' });
            }

            const challenge_sub_categories = selectedCategoriesToBitset(categories, categories_list);

            const points = formData.get('points')?.toString() ?? '';
            if (!points) {
                return fail(422, { message: 'Cannot insert challenge with no points!' });
            }
            const pointsInt = parseInt(points);
            const flag = formData.get('flag')?.toString() ?? '';
            if (!flag) {
                return fail(422, { message: 'You need to provide flag.' });
            }

            const flag_format = formData.get('flag_format')?.toString() ?? null;

            const flagId = await db
                .insertInto('flag')
                .values({
                    flag,
                    flag_format
                })
                .returning('id')
                .executeTakeFirstOrThrow();

            const description = formData.get('description')?.toString() ?? null;

            const challenge: Insertable<Challenges> = {
                challenge_category,
                challenge_sub_categories,
                challenge_id,
                points: pointsInt,
                flag: flagId.id,
                display_name,
                description
            };
        }
     catch (err) {
        const error = err as Error;
        return { success: false, message: error.message };
    }
    }
}