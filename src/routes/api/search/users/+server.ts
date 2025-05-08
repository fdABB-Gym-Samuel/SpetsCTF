import { db } from '$lib/db/database.js';
import { json } from '@sveltejs/kit';
import type { WargameSubmissions } from '$lib/db/db';
import type { Insertable } from 'kysely';

export const GET = async ({ request, locals, params }) => {
	console.log(request.body);
	return json([]);
};
