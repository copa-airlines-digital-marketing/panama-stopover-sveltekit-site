import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:1615/es/hero-preview/hero/9756fda7-6c4d-4522-b951-1247c0cbaf80', { waitUntil: 'domcontentloaded' });
  const cta = page.locator('.hero-copy a').first();
  await cta.waitFor();
  const values = [];
  for (const state of ['idle', 'hover', 'focus']) {
    if (state === 'hover') await cta.hover();
    if (state === 'focus') { await page.mouse.move(0, 0); await cta.focus(); }
    const contrast = await cta.evaluate(element => {
      const style = getComputedStyle(element);
      const ctx = document.createElement('canvas').getContext('2d');
      const luminance = color => {
        ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
        const values = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
      };
      const a = luminance(style.color), b = luminance(style.backgroundColor);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
    assert.ok(contrast >= 4.5, `${state}: ${contrast}`);
    values.push({ state, contrast });
  }
  console.log(JSON.stringify(values));
} finally { await browser.close(); }
