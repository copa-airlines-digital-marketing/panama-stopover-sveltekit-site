import { expect, it } from 'vitest';
import config from '../svelte.config.js';

it('permits only the intentionally empty local preview route', () => {
	const check = config.kit.prerender.handleUnseenRoutes;
	expect(() => check({ routes: ['/[locale]/hero-preview/[kind]/[id]'] })).not.toThrow();
	expect(() =>
		check({ routes: ['/[locale]/hero-preview/[kind]/[id]', '/[locale]/offers/[slug]'] })
	).toThrow('/[locale]/offers/[slug]');
	expect(() => check({ routes: ['/[locale]/hero-preview/other'] })).toThrow();
});
