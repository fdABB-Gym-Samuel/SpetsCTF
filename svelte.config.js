import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter(),
        csrf: {
            trustedOrigins: ['https://ctf.spetsen.net'],
        },
        csp: {
            mode: 'auto',
            directives: {
                'font-src': ['self'],
                'manifest-src': ['none'],
                'script-src-elem': ['self'],
                'script-src': ['self'],
                'worker-src': ['self'],
            },
        },
    },
};

export default config;
