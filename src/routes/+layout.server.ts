import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, depends }) => {
	const user = locals.user;
	depends('data:user');
	console.log(user);
	return {
		translations: locals.translations,
		user
	};
};
