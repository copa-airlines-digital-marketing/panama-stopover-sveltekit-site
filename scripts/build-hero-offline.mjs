// Compile the actual Svelte components, without a server or CMS requests.
// Pass the approved prototype assets.json as the first argument.
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

if (!process.argv[2]) throw new Error('Provide the local prototype assets.json path.');
const assets = JSON.parse(await fs.readFile(process.argv[2], 'utf8'));
const output = path.resolve('artifacts/hero-controls');
const result = await build({
	configFile: false,
	publicDir: false,
	plugins: [
		{
			name: 'offline-hero-assets',
			enforce: 'pre',
			transform(code, id) {
				if (id.endsWith('/hero-slide.svelte'))
					return code
						.replace(
							'`https://cm-marketing.directus.app/assets/${item.image}`',
							JSON.stringify(assets.heroes[0].image)
						)
						.replace(/\?key=(3-1x1920|3-1x1368|square-600)/g, '');
				if (id.endsWith('/hero-carousel.svelte'))
					return code
						.replace(
							'https://www.copaair.com/webassets/icons/regular/white/chevron_l.svg',
							assets.icons.l
						)
						.replace(
							'https://www.copaair.com/webassets/icons/regular/white/chevron_r.svg',
							assets.icons.r
						);
				if (id.endsWith('/src/app.css')) return code.replace(/@font-face\s*\{[^}]*\}/g, '');
			}
		},
		tailwindcss(),
		svelte({ configFile: false, preprocess: vitePreprocess() })
	],
	resolve: {
		alias: {
			'$app/stores': path.resolve('scripts/hero-fixture/stores.ts'),
			$lib: path.resolve('src/lib'),
			$ui: path.resolve('design-sytem-svelte-components/src/lib')
		}
	},
	build: {
		write: false,
		minify: true,
		lib: {
			entry: path.resolve('scripts/hero-fixture/entry.ts'),
			name: 'HeroFixture',
			formats: ['iife']
		}
	}
});
const files = (Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output);
const code = files
	.filter((file) => file.type === 'chunk')
	.map((file) => file.code)
	.join('\n');
const css = files
	.filter((file) => file.type === 'asset' && file.fileName.endsWith('.css'))
	.map((file) => file.source)
	.join('\n');
const fonts = `@font-face{font-family:Gilroy;src:url('${assets.fonts.heading}') format('woff');font-weight:700}@font-face{font-family:"Suisse Int'l";src:url('${assets.fonts.body}') format('woff');font-weight:400}`;
await fs.mkdir(output, { recursive: true });
await fs.writeFile(
	path.join(output, 'hero-svelte.html'),
	`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hero carousel · Svelte</title><style>${css}${fonts}</style><body><div id="app"></div><script>${code.replace(/<\/script/gi, '<\\/script')}</script></body></html>`
);
console.log(path.join(output, 'hero-svelte.html'));
