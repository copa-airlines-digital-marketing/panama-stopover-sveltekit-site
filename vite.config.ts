import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		allowedHosts: ['local-dev.panama-stopover.com'],
		fs: {
			allow: ['./design-sytem-svelte-components/', './directus-cms-collections/']
		}
	},
	resolve: {
		alias: {
			$cms: path.resolve('./directus-cms-collections/src'),
			$lib: path.resolve('./src/lib'),
			$ui: path.resolve('./design-sytem-svelte-components/src/lib')
		}
	}
});
