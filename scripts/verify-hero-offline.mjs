import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const output = path.resolve('artifacts/hero-controls');
const url = pathToFileURL(path.join(output, 'hero-svelte.html')).href;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [],
	requests = [],
	checks = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.route(/^https?:/, (route) => {
	requests.push(route.request().url());
	return route.abort();
});
const open = async (query = 'count=5&locale=es') => {
	await page.goto(`${url}?${query}`);
	await page.locator('footer').waitFor();
};
const counter = () => page.locator('.counter').innerText();
try {
	for (const count of [0, 1, 2, 5]) {
		await open(`count=${count}&locale=es`);
		assert.equal(await page.locator('.hero-slide').count(), count);
		if (count < 2) assert.equal(await page.locator('.controls').count(), 0);
		else {
			await page.locator('.controls.positioned').waitFor();
			assert.equal(await counter(), `01 / 0${count}`);
			await page.getByRole('button', { name: 'Anterior', exact: true }).click();
			assert.equal(await counter(), `0${count} / 0${count}`);
			await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
			assert.equal(await counter(), `01 / 0${count}`);
		}
	}
	checks.push('0/1/2/5 slides, dynamic totals, previous/next wrap');
	for (const [locale, width] of [
		['es', 1440],
		['en', 768],
		['pt', 390]
	]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const long of [false, true]) {
			await open(`count=5&locale=${locale}${long ? '&long' : ''}`);
			await page.locator('.controls.positioned').waitFor();
			await page.evaluate(() => document.fonts.ready);
			const layout = await page.evaluate(() => {
				const c = document.querySelector('.controls').getBoundingClientRect();
				const p = document.querySelector('.hero-photo').getBoundingClientRect();
				const text = document.querySelector('.hero-copy').getBoundingClientRect();
				const img = document.querySelector('.hero-photo img');
				return {
					inside: c.left >= p.left && c.right <= p.right && c.top >= p.top && c.bottom <= p.bottom,
					overlap:
						c.left < text.right &&
						c.right > text.left &&
						c.top < text.bottom &&
						c.bottom > text.top,
					overflow: document.documentElement.scrollWidth > innerWidth,
					image: img.complete && img.naturalWidth > 0
				};
			});
			assert.deepEqual(
				layout,
				{ inside: true, overlap: false, overflow: false, image: true },
				`${locale}/${width}/long=${long}: ${JSON.stringify(layout)}`
			);
			if (!long)
				await page.screenshot({
					path: path.join(output, `${locale}-${width}.png`),
					fullPage: true
				});
		}
	}
	checks.push(
		'es/en/pt, 1440/768/390 px, long copy, controls inside image without overlap, embedded images'
	);
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await open();
	assert.equal(await page.locator('.progress-ring').count(), 0);
	await page.keyboard.press('Tab');
	assert.equal(await page.locator(':focus').getAttribute('aria-label'), 'Reproducir carrusel');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	assert.equal(await counter(), '05 / 05');
	assert.equal(await page.locator('.slide[inert]').count(), 4);
	assert.equal(await page.getByRole('link', { name: 'Explorar Panamá' }).count(), 1);
	checks.push('keyboard, first focus is playback, inactive slides inert, reduced motion');
	await page.emulateMedia({ reducedMotion: 'no-preference' });

	await page.clock.install();
	await open();
	await page.clock.runFor(6500);
	assert.equal(await counter(), '01 / 05');
	await page.getByRole('button', { name: 'Reproducir carrusel' }).click();
	await page.locator('footer').hover();
	await page.waitForTimeout(80);
	await page.clock.runFor(2500);
	await page.getByRole('button', { name: 'Pausar carrusel' }).click();
	const ring = await page.locator('.ring-value').getAttribute('stroke-dashoffset');
	assert.ok(Number(ring) < 65 && Number(ring) > 50, ring);
	await page.clock.runFor(10000);
	assert.equal(await counter(), '01 / 05');
	assert.equal(await page.locator('.ring-value').getAttribute('stroke-dashoffset'), ring);
	await page.getByRole('button', { name: 'Reproducir carrusel' }).click();
	await page.locator('footer').hover();
	await page.waitForTimeout(80);
	await page.clock.runFor(2000);
	assert.equal(await counter(), '01 / 05');
	await page.clock.runFor(1800);
	assert.equal(await counter(), '02 / 05');
	await page.mouse.move(500, 100);
	await page.waitForTimeout(80);
	await page.clock.runFor(10000);
	assert.equal(await counter(), '02 / 05');
	await page.locator('footer').hover();
	await page.waitForTimeout(80);
	await page.clock.runFor(6000);
	assert.equal(await counter(), '03 / 05');
	await page.getByRole('button', { name: 'Siguiente', exact: true }).focus();
	assert.equal(await page.getByRole('button', { name: 'Reproducir carrusel' }).count(), 1);
	await page.clock.runFor(10000);
	assert.equal(await counter(), '03 / 05');
	await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
	assert.equal(await counter(), '04 / 05');
	assert.equal(Number(await page.locator('.ring-value').getAttribute('stroke-dashoffset')), 100);
	checks.push(
		'starts paused, 6-second playback, pause/resume remainder, hover suspension, focus pause, manual reset'
	);
	await page.getByRole('button', { name: 'Reproducir carrusel' }).click();
	await page.locator('footer').hover();
	await page.waitForTimeout(80);
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	assert.equal(await page.getByRole('button', { name: 'Reproducir carrusel' }).count(), 1);
	await page.getByRole('button', { name: 'Montar/desmontar carrusel' }).click();
	await page.clock.runFor(12000);
	assert.equal(await page.locator('.hero-carousel').count(), 0);
	await page.getByRole('button', { name: 'Montar/desmontar carrusel' }).click();
	assert.equal(await counter(), '01 / 05');
	checks.push('hidden tab pause, unmount/remount');
	assert.deepEqual(errors, []);
	assert.deepEqual(requests, []);
	checks.push('no JavaScript errors, no network requests');
	await fs.writeFile(
		path.join(output, 'result.json'),
		JSON.stringify({ checks, errors, requests }, null, 2)
	);
	console.log(JSON.stringify(checks, null, 2));
} finally {
	await browser.close();
}
