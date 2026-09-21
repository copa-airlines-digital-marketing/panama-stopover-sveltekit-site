import { describe, expect, it } from 'vitest';
import { resolvePageAccent } from './accent';

describe('page accent', () => {
	const colors = [
		{ name: 'primary', color: '#0033A2' },
		{ name: 'warm', color: '#FF8400' }
	];
	it('resolves the same key separately for each site', () => {
		expect(resolvePageAccent('warm', colors)).toBe('#FF8400');
		expect(resolvePageAccent('warm', [{ name: 'warm', color: '#abc' }])).toBe('#abc');
	});
	it('uses the site primary for empty or removed keys', () => {
		for (const accent of [null, undefined, '', 'removed', '#FF8400'])
			expect(resolvePageAccent(accent, colors)).toBe('#0033A2');
	});
	it('rejects CSS injection and malformed palettes', () => {
		expect(
			resolvePageAccent('warm', [{ name: 'warm', color: 'red; background:url(x)' }])
		).toBeUndefined();
		expect(resolvePageAccent('warm', null)).toBeUndefined();
		expect(resolvePageAccent('warm', [null, {}, 7])).toBeUndefined();
	});
});
