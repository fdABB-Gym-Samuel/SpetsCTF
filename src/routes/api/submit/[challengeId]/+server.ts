import { db } from '$lib/db/database.js';
import { error, json, redirect } from '@sveltejs/kit';
import type { WargameSubmissions } from '$lib/db/db';
import type { Insertable } from 'kysely';

export const POST = async ({ request, locals, params }) => {
	return redirect(301, `/challenges/`);
};
