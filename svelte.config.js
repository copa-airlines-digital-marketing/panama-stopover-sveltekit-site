import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		prerender: {
			handleUnseenRoutes: ({ routes }) => {
				// This development-only route deliberately has no production entries.
				const unexpected = routes.filter((route) => route !== '/[locale]/hero-preview/[kind]/[id]');
				if (unexpected.length) throw new Error(`Unseen prerender routes: ${unexpected.join(', ')}`);
			}
		},
		alias: {
			'@/*': './path/to/lib/*'
		}
	}
};

export default config;
