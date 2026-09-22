import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const directory = process.argv[2] || 'artifacts/hero-browser';
fs.mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const base = 'http://127.0.0.1:1615';
const carousel = '/hero-preview/carousel/97d2139d-11c5-494f-abec-aceb0983ad32';
const checks = [];
try {
	const response = await page.goto(`${base}/es${carousel}`, {
		waitUntil: 'domcontentloaded',
		timeout: 120000
	});
	assert.equal(response.status(), 200);
	await page.getByRole('button', { name: 'Siguiente', exact: true }).waitFor();
	assert.equal(await page.locator('h1').count(), 1);
	await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
	await page.waitForFunction(() =>
		document.querySelector('.slide[aria-hidden="true"]')?.textContent.includes('Hero A')
	);
	assert.equal(await page.locator('.slide[inert]').count(), 1);
	await page.getByRole('button', { name: 'Anterior', exact: true }).focus();
	await page.keyboard.press('Enter');
	await page.waitForFunction(() =>
		document.querySelector('.slide:not([inert])')?.textContent.includes('Hero A')
	);
	checks.push('navigation', 'one_h1', 'inactive_slides_inert', 'keyboard_controls');
	for (const [locale, width] of [
		['es', 1440],
		['en', 768],
		['pt', 390]
	]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(`${base}/${locale}${carousel}`, {
			waitUntil: 'domcontentloaded',
			timeout: 120000
		});
		await page.locator('.controls').waitFor();
		assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		assert.ok(
			await page
				.locator('.hero-photo img')
				.first()
				.evaluate((img) => img.complete && img.naturalWidth > 0)
		);
		await page.screenshot({ path: `${directory}/${locale}-${width}.png`, fullPage: true });
	}
	checks.push('es_en_pt', 'desktop_tablet_mobile', 'images_loaded', 'no_horizontal_overflow');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(`${base}/es${carousel}`, { waitUntil: 'domcontentloaded' });
	await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
	assert.equal(await page.locator('.slide:not([inert]) h2').textContent(), 'Hero B (es)');
	checks.push('reduced_motion');
	await page.goto(`${base}/es/hero-preview/hero/9756fda7-6c4d-4522-b951-1247c0cbaf80`, {
		waitUntil: 'domcontentloaded'
	});
	assert.equal(await page.locator('.controls').count(), 0);
	checks.push('standalone_no_controls');
	assert.equal(errors.length, 0, errors.join('\n'));
	checks.push('no_page_errors');
} finally {
	await browser.close();
}
fs.writeFileSync(`${directory}/result.json`, JSON.stringify({ checks, errors }, null, 2));
console.log(JSON.stringify(checks));
