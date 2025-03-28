import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		csrf: {
			checkOrigin: true
		},
		csp: {
			mode: 'auto',
			directives: {
				'connect-src': ['none'],
				'default-src': ['self'],
				'style-src': ['self'],
				'font-src': ['none'],
				'manifest-src': ['none'],
				'object-src': ['none'],
				'worker-src': ['none']
			}
		}
	}
};

export default config;
