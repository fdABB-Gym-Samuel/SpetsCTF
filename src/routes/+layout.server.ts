import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = locals.user;
	console.log(user);
	return {
		translations: locals.translations,
		user
	};
};
