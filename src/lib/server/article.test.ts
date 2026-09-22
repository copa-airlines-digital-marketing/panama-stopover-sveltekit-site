import { describe, expect, test } from 'vitest';
import { cleanArticleHtml, prepareArticleSections } from './article';

describe('article content', () => {
	test('preserves legal structure, images and links', () => {
		const input =
			'<h2 id="terms">Condiciones</h2><p>Texto <strong>exacto</strong></p><h3>Detalle</h3><ul><li>Uno</li></ul><a href="https://copaair.com/?a=1&amp;b=2">Enlace</a><img src="https://cm-marketing.directus.app/assets/image.png" width="150" height="35" alt="Sello" />';
		expect(cleanArticleHtml(input)).toBe(input);
	});
	test('removes scripts, event handlers and unsafe URLs', () => {
		const output = cleanArticleHtml(
			'<script>alert(1)</script><img src="data:image/svg+xml,bad" onerror="alert(1)"><a href="javascript:alert(1)" onclick="bad()">Texto</a><iframe src="https://example.com"></iframe>'
		);
		expect(output).not.toMatch(/script|onerror|onclick|iframe|data:/);
		expect(output).toContain('Texto');
	});
	test('secures new-window links and preserves relative links', () => {
		expect(cleanArticleHtml('<a href="/es/terms" target="_blank">Texto</a>')).toContain(
			'rel="noopener noreferrer"'
		);
	});
	test('creates a sanitized render field without changing the stored legal text', () => {
		const entry = {
			collection: 'Text_Content',
			component_name: 'article',
			item: { translations: [{ description: '<p onclick="bad()">Texto</p>' }] }
		};
		const result = prepareArticleSections([{ section_content: [entry] }]) as Array<{
			section_content: Array<{ item: { articleHtml: string } }>;
		}>;
		expect(result[0].section_content[0].item.articleHtml).toBe('<p>Texto</p>');
		expect(entry.item.translations[0].description).toBe('<p onclick="bad()">Texto</p>');
	});
});
