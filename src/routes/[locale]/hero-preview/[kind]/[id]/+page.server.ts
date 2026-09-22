import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';
import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { z } from 'zod';
import { adaptHeroBlock } from '$lib/server/hero';
import { heroQueryFields, heroCarouselQueryFields } from '$lib/directus/hero';
import { createDirectus, rest, staticToken, readItem } from '@directus/sdk';

// No entries or links are generated for production. Draft access is local development only.
export const prerender = true;
export const entries = () => [];
export async function load({ params, url, request, setHeaders, getClientAddress }) {
	if (
		!dev ||
		!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
		!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(getClientAddress())
	)
		error(404);
	if (request.headers.get('sec-fetch-site') === 'cross-site') error(403);
	if (
		!['es', 'en', 'pt'].includes(params.locale) ||
		!['hero', 'carousel'].includes(params.kind) ||
		!z.string().uuid().safeParse(params.id).success
	)
		error(404);
	setHeaders({
		'Cache-Control': 'private, no-store',
		'X-Robots-Tag': 'noindex, nofollow',
		'Referrer-Policy': 'no-referrer'
	});
	const token = parse(readFileSync('.env.agent')).DIRECTUS_TOKEN;
	if (!token) error(503, 'Preview no disponible');
	const client = createDirectus('https://cm-marketing.directus.app')
		.with(staticToken(token))
		.with(rest());
	const collection = params.kind === 'hero' ? 'block_hero' : 'block_hero_carousel';
	let raw: unknown;
	try {
		raw = await client.request(
			readItem(collection, params.id, {
				fields: (params.kind === 'hero' ? heroQueryFields : heroCarouselQueryFields) as never
			})
		);
	} catch {
		error(502, 'No se pudo leer el contenido');
	}
	const item = adaptHeroBlock(collection, raw, params.locale, true, 'h1');
	return { item, previewLocale: params.locale };
}
