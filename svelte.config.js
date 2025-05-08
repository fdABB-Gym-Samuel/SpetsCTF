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
				'font-src': ['self'],
				'manifest-src': ['none'],
				'script-src-elem': ['self'],
				'script-src': ['self'],
				'worker-src': ['none']
			}
		}
	}
};

export default config;
