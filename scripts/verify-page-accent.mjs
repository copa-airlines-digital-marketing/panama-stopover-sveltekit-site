import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const baseline = JSON.parse(fs.readFileSync('artifacts/hero-controls/production-comparison.json'));
const routes = JSON.parse(fs.readFileSync('artifacts/hero-controls/migration-fixture.json')).filter(
	(r) => r.variant === 'hero-c'
);
const browser = await chromium.launch({ headless: true });
const results = [];
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
	const errors = [];
	page.on('pageerror', (e) => errors.push(e.message));
	for (const route of routes) {
		const response = await page.goto('http://127.0.0.1:1615' + route.path, {
			waitUntil: 'domcontentloaded',
			timeout: 60000
		});
		assert.equal(response.status(), 200, route.path);
		await page.locator('.hero-pillar').waitFor();
		for (const width of route.locale === 'es' ? [1440, 390] : [1440]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.evaluate(async () => {
				await document.fonts.ready;
				await Promise.all(
					[...document.querySelectorAll('.hero-pillar img')].map((i) => i.decode().catch(() => {}))
				);
			});
			const actual = await page.evaluate(() => {
				const root = document.querySelector('.hero-pillar');
				const rect = (e) => {
					const r = e.getBoundingClientRect();
					return { x: r.x, y: r.y, w: r.width, h: r.height };
				};
				const before = getComputedStyle(root).backgroundColor;
				const section = root.closest('section,header');
				if (section) section.style.backgroundColor = 'rgb(255, 0, 255)';
				return {
					bg: before,
					independent: before === getComputedStyle(root).backgroundColor,
					root: rect(root),
					heading: rect(root.querySelector('h1')),
					photo: rect(root.querySelector('img')),
					h1: document.querySelectorAll('h1').length,
					overflow: document.documentElement.scrollWidth > innerWidth
				};
			});
			const es = routes.find((r) => r.sourceId === route.sourceId && r.locale === 'es');
			const expected = baseline.find((r) => r.path === es.path && r.width === width)?.production;
			assert.ok(expected, route.path);
			assert.equal(actual.bg, expected.bg, route.path);
			assert.equal(actual.h1, 1);
			assert.equal(actual.overflow, false);
			assert.equal(actual.independent, true);
			if (route.locale === 'es')
				for (const key of ['root', 'heading', 'photo'])
					for (const axis of ['x', 'y', 'w', 'h'])
						assert.ok(
							Math.abs(actual[key][axis] - expected[key][axis]) <= 1,
							`${route.path} ${width} ${key}.${axis}`
						);
			results.push({ path: route.path, width, ...actual });
			if (route.locale === 'es' && route.sourceId === 126)
				await page.screenshot({ path: `artifacts/hero-controls/accent-hero-c-${width}.png` });
		}
		await page.setViewportSize({ width: 1440, height: 1000 });
	}
	assert.deepEqual(errors, []);
	fs.writeFileSync('artifacts/hero-controls/accent-browser.json', JSON.stringify(results, null, 2));
	console.log(JSON.stringify({ passed: results.length, routes: routes.length, errors }));
} finally {
	await browser.close();
}
