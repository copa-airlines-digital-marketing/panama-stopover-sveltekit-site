import adapter from '@sveltejs/adapter-static';
// import adapter from '@sveltejs/adapter-node';
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
			// Cloudflare Pages configuration
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // SPA fallback for dynamic routes
			precompress: false,
			strict: false // Allow dynamic routes without prerendering
		}),
		alias: {
			"@/*": "./path/to/lib/*",
		},
	}
};

export default config;
