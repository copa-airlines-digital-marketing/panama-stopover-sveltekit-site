import { describe, expect, test } from 'vitest';
import {
	getAirportLabel,
	getDestinationOptions,
	getOriginOptions,
	getRoutePairKey,
	isValidStopoverRoute,
	normalizeIata,
	type StopoverRouteIndex
} from './stopover-routes';

const fixture: StopoverRouteIndex = {
	schemaVersion: 1,
	hubIata: 'PTY',
	excludedEndpointIatas: ['PTY', 'DAV'],
	airports: {
		ASU: {
			iata: 'ASU',
			country: 'PY',
			cityNames: { es: 'Asuncion' },
			countryNames: { es: 'Paraguay' },
			airportNames: {},
			labels: {
				es: 'Asuncion (ASU), Paraguay',
				en: 'Asuncion (ASU), Paraguay',
				pt: 'Assuncao (ASU), Paraguay'
			}
		},
		GRU: {
			iata: 'GRU',
			country: 'BR',
			cityNames: { es: 'Sao Paulo' },
			countryNames: { es: 'Brasil' },
			airportNames: {},
			labels: {
				es: 'Sao Paulo (GRU), Brasil',
				en: 'Sao Paulo (GRU), Brasil',
				pt: 'Sao Paulo (GRU), Brasil'
			}
		},
		HAV: {
			iata: 'HAV',
			country: 'CU',
			cityNames: { es: 'La Habana' },
			countryNames: { es: 'Cuba' },
			airportNames: {},
			labels: {
				es: 'La Habana (HAV), Cuba',
				en: 'Havana (HAV), Cuba',
				pt: 'Havana (HAV), Cuba'
			}
		}
	},
	origins: ['ASU', 'GRU'],
	destinations: ['GRU', 'HAV'],
	destinationsByOrigin: {
		ASU: ['GRU', 'HAV'],
		GRU: ['HAV']
	},
	validRoutePairs: ['ASU-GRU', 'ASU-HAV', 'GRU-HAV'],
	source: {
		collection: 'valid_routes',
		filter: {
			endpointDestinationStatus: 'active',
			excludedEndpointIatas: ['PTY', 'DAV'],
			excludeSelfRoutes: true
		},
		readRouteCount: 3,
		usableRouteCount: 3,
		activeDestinationEndpointCount: 3,
		routeEndpointCount: 3,
		excludedEndpointCount: 0,
		excludedPtyEndpointCount: 0,
		duplicateRouteCount: 0,
		destinationMetadataCount: 3,
		destinationTranslationCount: 3,
		statusCounts: { draft: 3 }
	}
};

describe('stopover route helpers', () => {
	test('normalizes IATA values and route pair keys', () => {
		expect(normalizeIata(' asu ')).toBe('ASU');
		expect(getRoutePairKey('asu', 'gru')).toBe('ASU-GRU');
	});

	test('returns localized origin options sorted by label', () => {
		expect(getOriginOptions(fixture, 'es')).toEqual([
			{
				value: 'ASU',
				label: 'Asuncion (ASU), Paraguay',
				primaryLabel: 'Asuncion',
				emphasisLabel: 'ASU',
				secondaryLabel: 'Paraguay'
			},
			{
				value: 'GRU',
				label: 'Sao Paulo (GRU), Brasil',
				primaryLabel: 'Sao Paulo',
				emphasisLabel: 'GRU',
				secondaryLabel: 'Brasil'
			}
		]);
	});

	test('filters origins after a destination is selected', () => {
		expect(getOriginOptions(fixture, 'es', 'GRU')).toEqual([
			{
				value: 'ASU',
				label: 'Asuncion (ASU), Paraguay',
				primaryLabel: 'Asuncion',
				emphasisLabel: 'ASU',
				secondaryLabel: 'Paraguay'
			}
		]);

		expect(getOriginOptions(fixture, 'es', 'HAV')).toEqual([
			{
				value: 'ASU',
				label: 'Asuncion (ASU), Paraguay',
				primaryLabel: 'Asuncion',
				emphasisLabel: 'ASU',
				secondaryLabel: 'Paraguay'
			},
			{
				value: 'GRU',
				label: 'Sao Paulo (GRU), Brasil',
				primaryLabel: 'Sao Paulo',
				emphasisLabel: 'GRU',
				secondaryLabel: 'Brasil'
			}
		]);
	});

	test('filters destinations after an origin is selected', () => {
		expect(getDestinationOptions(fixture, 'GRU', 'es')).toEqual([
			{
				value: 'HAV',
				label: 'La Habana (HAV), Cuba',
				primaryLabel: 'La Habana',
				emphasisLabel: 'HAV',
				secondaryLabel: 'Cuba'
			}
		]);
	});

	test('rejects excluded endpoints and unavailable pairs', () => {
		expect(isValidStopoverRoute(fixture, 'ASU', 'GRU')).toBe(true);
		expect(isValidStopoverRoute(fixture, 'PTY', 'GRU')).toBe(false);
		expect(isValidStopoverRoute(fixture, 'DAV', 'GRU')).toBe(false);
		expect(isValidStopoverRoute(fixture, 'GRU', 'ASU')).toBe(false);
	});

	test('falls back to the IATA code when metadata is unavailable', () => {
		expect(getAirportLabel(fixture, 'XXX', 'en')).toBe('XXX');
	});
});
