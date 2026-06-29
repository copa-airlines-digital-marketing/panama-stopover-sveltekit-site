import { describe, expect, test } from 'vitest';
import {
	addDays,
	buildStopoverBookingUrl,
	getBookingLocaleParams,
	type StopoverBookingUrlInput
} from './booking-url';

function paramsFrom(input: StopoverBookingUrlInput) {
	const url = new URL(buildStopoverBookingUrl(input));
	return { url, params: url.searchParams };
}

const baseInput = {
	shoppingBaseUrl: 'https://shopping.copaair.com',
	shoppingMulticityUrl: 'https://shopping.copaair.com/multicity',
	origin: 'MIA',
	destination: 'BOG',
	departureDate: '2026-07-10',
	returnDate: '2026-07-20',
	stopoverNights: 3,
	stopoverPlacement: 'outbound',
	adults: 1,
	children: 0,
	infants: 0,
	cabinType: 'Y',
	promoCode: '',
	languageCode: 'es',
	hubIata: 'PTY'
} satisfies Omit<StopoverBookingUrlInput, 'tripType'>;

describe('stopover booking URL builder', () => {
	test('adds calendar days with a stable YYYY-MM-DD output', () => {
		expect(addDays('2026-07-10', 3)).toBe('2026-07-13');
		expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
	});

	test('maps storefront and language parameters from the page language', () => {
		expect(getBookingLocaleParams('en-US')).toEqual({ sf: 'us', langid: 'en' });
		expect(getBookingLocaleParams('pt-BR')).toEqual({ sf: 'br', langid: 'pt' });
		expect(getBookingLocaleParams('es-PA')).toEqual({ sf: 'pa', langid: 'es' });
		expect(getBookingLocaleParams(null)).toEqual({ sf: 'pa', langid: 'es' });
	});

	test('builds one-way stopover as two multicity segments through PTY', () => {
		const { url, params } = paramsFrom({
			...baseInput,
			tripType: 'one_way',
			stopoverPlacement: 'return'
		});

		expect(url.origin).toBe('https://shopping.copaair.com');
		expect(url.pathname).toBe('/multicity');
		expect(params.get('roundtrip')).toBe('false');
		expect(params.get('seniors')).toBe('0');
		expect(params.get('adults')).toBe('1');
		expect(params.get('children')).toBe('0');
		expect(params.get('infants')).toBe('0');
		expect(params.get('date1')).toBe('2026-07-10');
		expect(params.get('date2')).toBe('2026-07-13');
		expect(params.get('date3')).toBe('null');
		expect(params.get('date4')).toBe('null');
		expect(params.get('date5')).toBe('null');
		expect(params.get('area1')).toBe('MIA');
		expect(params.get('area2')).toBe('PTY');
		expect(params.get('area3')).toBe('PTY');
		expect(params.get('area4')).toBe('BOG');
		expect(params.get('area5')).toBe('');
		expect(params.get('area10')).toBe('');
		expect(params.get('advanced_air_search')).toBe('true');
		expect(params.get('flexible_dates_v2')).toBe('false');
		expect(params.get('stopoverNights')).toBe('3');
		expect(params.get('stopoverLegNumber')).toBe('1');
		expect(params.get('stopover')).toBe('true');
		expect(params.get('stopoverType')).toBe('origin');
		expect(params.get('cabinType')).toBe('Y');
		expect(params.get('isMiles')).toBe('false');
		expect(params.get('sf')).toBe('pa');
		expect(params.get('langid')).toBe('es');
	});

	test('builds roundtrip outbound stopover as outbound split plus direct return', () => {
		const { params } = paramsFrom({
			...baseInput,
			tripType: 'roundtrip',
			origin: 'GRU',
			destination: 'MIA',
			departureDate: '2026-07-16',
			returnDate: '2026-08-13',
			stopoverNights: 15,
			stopoverPlacement: 'outbound',
			adults: 2,
			children: 1,
			cabinType: 'C',
			languageCode: 'pt-BR'
		});

		expect(params.get('date1')).toBe('2026-07-16');
		expect(params.get('date2')).toBe('2026-07-31');
		expect(params.get('date3')).toBe('2026-08-13');
		expect(params.get('area1')).toBe('GRU');
		expect(params.get('area2')).toBe('PTY');
		expect(params.get('area3')).toBe('PTY');
		expect(params.get('area4')).toBe('MIA');
		expect(params.get('area5')).toBe('MIA');
		expect(params.get('area6')).toBe('GRU');
		expect(params.get('stopoverLegNumber')).toBe('1');
		expect(params.get('stopoverType')).toBe('origin');
		expect(params.get('cabinType')).toBe('C');
		expect(params.get('sf')).toBe('br');
		expect(params.get('langid')).toBe('pt');
	});

	test('builds roundtrip return stopover as direct outbound plus return split', () => {
		const { params } = paramsFrom({
			...baseInput,
			tripType: 'roundtrip',
			origin: 'BOG',
			destination: 'MEX',
			departureDate: '2026-06-18',
			returnDate: '2026-06-24',
			stopoverNights: 13,
			stopoverPlacement: 'return',
			promoCode: 'SO25',
			languageCode: 'en-US'
		});

		expect(params.get('date1')).toBe('2026-06-18');
		expect(params.get('date2')).toBe('2026-06-24');
		expect(params.get('date3')).toBe('2026-07-07');
		expect(params.get('area1')).toBe('BOG');
		expect(params.get('area2')).toBe('MEX');
		expect(params.get('area3')).toBe('MEX');
		expect(params.get('area4')).toBe('PTY');
		expect(params.get('area5')).toBe('PTY');
		expect(params.get('area6')).toBe('BOG');
		expect(params.get('stopoverLegNumber')).toBe('2');
		expect(params.get('stopoverType')).toBe('arrival');
		expect(params.get('promocode')).toBe('SO25');
		expect(params.get('sf')).toBe('us');
		expect(params.get('langid')).toBe('en');
	});

	test('rejects unsupported night counts and missing roundtrip return dates', () => {
		expect(() =>
			buildStopoverBookingUrl({ ...baseInput, tripType: 'one_way', stopoverNights: 0 })
		).toThrow('stopoverNights');
		expect(() =>
			buildStopoverBookingUrl({ ...baseInput, tripType: 'one_way', stopoverNights: 16 })
		).toThrow('stopoverNights');
		expect(() =>
			buildStopoverBookingUrl({
				...baseInput,
				tripType: 'roundtrip',
				returnDate: null
			})
		).toThrow('returnDate');
	});
});
