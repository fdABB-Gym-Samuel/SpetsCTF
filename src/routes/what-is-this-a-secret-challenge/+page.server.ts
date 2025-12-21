import { type PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = () => {
    error(404);
};
