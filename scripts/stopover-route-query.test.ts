import { describe, expect, test } from 'vitest';
import {
	buildRouteEndpointIatas,
	buildSelfRoutePairCsv,
	buildValidRoutesQueryEntries
} from './stopover-route-query.mjs';

describe('stopover route Directus query helpers', () => {
	test('builds route endpoints from active destinations without PTY or DAV', () => {
		expect(
			buildRouteEndpointIatas(['pty', 'ASU', 'DAV', 'GRU', 'ASU', 'B4D'], ['PTY', 'DAV'])
		).toEqual(['ASU', 'GRU']);
	});

	test('pushes simple route exclusions into the Directus query', () => {
		const entries = buildValidRoutesQueryEntries(['ASU', 'GRU', 'HAV']);
		const query = Object.fromEntries(entries);
		const flattened = entries.flat().join('&');

		expect(query['filter[origin][_in]']).toBe('ASU,GRU,HAV');
		expect(query['filter[destination][_in]']).toBe('ASU,GRU,HAV');
		expect(query['filter[originDestinationPair][_nin]']).toBe('ASUASU,GRUGRU,HAVHAV');
		expect(query.fields).toContain('originDestinationPair');
		expect(flattened).not.toContain('validate');
	});

	test('builds self-route pairs for originDestinationPair exclusions', () => {
		expect(buildSelfRoutePairCsv(['ASU', 'GRU'])).toBe('ASUASU,GRUGRU');
	});

	test('fails before querying when no usable route endpoints remain', () => {
		expect(() => buildValidRoutesQueryEntries([])).toThrow(
			'zero usable route endpoint IATA values'
		);
	});
});
