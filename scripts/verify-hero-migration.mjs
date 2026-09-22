import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const root = 'artifacts/hero-controls';
const routes = JSON.parse(fs.readFileSync(`${root}/migration-fixture.json`, 'utf8'));
const browser = await chromium.launch({ headless: true });
const results = [];
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
	const errors = [];
	page.on('pageerror', (e) => errors.push(e.message));
	for (const route of routes) {
		const response = await page.goto(`http://127.0.0.1:1615${route.path}`, {
			waitUntil: 'domcontentloaded',
			timeout: 120000
		});
		assert.equal(response.status(), 200, route.path);
		await page.locator('h1').first().waitFor();
		assert.equal(await page.locator('h1').count(), 1, `Heading count: ${route.path}`);
		assert.equal((await page.locator('h1').innerText()).trim(), route.title.trim(), route.path);
		assert.equal(
			await page.locator('.controls').count(),
			0,
			'Standalone hero must have no carousel controls'
		);
		const selector =
			route.variant === 'article'
				? '.legal-article'
				: route.variant === 'hero-a'
					? '.hero-slide'
					: route.variant === 'hero-c'
						? '.hero-pillar'
						: '.editorial-hero';
		assert.equal(await page.locator(selector).count(), 1, route.path);
		if (route.variant === 'article') {
			const comparison = await page.evaluate((html) => {
				const source = new DOMParser().parseFromString(html, 'text/html').body;
				const actual = document.querySelector('.article-body');
				const norm = (s) => s.replace(/\s+/g, ' ').trim();
				const extract = (node) => ({
					text: norm(node.textContent),
					links: [...node.querySelectorAll('a')].map((a) => a.getAttribute('href')),
					images: [...node.querySelectorAll('img')].map((a) => a.getAttribute('src')),
					headings: [...node.querySelectorAll('h2,h3,h4')].map((h) => [
						h.tagName,
						norm(h.textContent)
					])
				});
				return { expected: extract(source), actual: extract(actual) };
			}, route.html);
			assert.deepEqual(comparison.actual, comparison.expected, `Legal preservation: ${route.path}`);
		}
		if (route.locale === 'es' && [110, 118, 126, undefined].includes(route.sourceId)) {
			for (const width of [1440, 390]) {
				await page.setViewportSize({ width, height: 1000 });
				await page.evaluate(() => document.fonts.ready);
				await page.waitForTimeout(300);
				assert.ok(
					await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
					`Overflow: ${route.path} at ${width}`
				);
				await page.screenshot({
					path: `${root}/migration-${route.variant}-${width}.png`,
					fullPage: false
				});
			}
			await page.setViewportSize({ width: 1440, height: 1000 });
		}
		results.push({ path: route.path, variant: route.variant, status: response.status() });
		console.log(`PASS ${route.path}`);
	}
	assert.deepEqual(errors, []);
} finally {
	fs.writeFileSync(
		`${root}/migration-browser.json`,
		JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2)
	);
	await browser.close();
}
