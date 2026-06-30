type StopoverBookingTripType = 'roundtrip' | 'one_way';
type StopoverPlacement = 'outbound' | 'return';
type CabinType = 'Y' | 'C';

type StopoverBookingUrlInput = {
	shoppingBaseUrl?: string | null;
	shoppingMulticityUrl?: string | null;
	tripType: StopoverBookingTripType;
	origin: string;
	destination: string;
	departureDate: string;
	returnDate?: string | null;
	stopoverNights: number;
	stopoverPlacement: StopoverPlacement;
	adults: number;
	children: number;
	infants: number;
	cabinType: CabinType;
	promoCode?: string | null;
	languageCode?: string | null;
	hubIata?: string | null;
};

type BookingLocaleParams = {
	sf: string;
	langid: string;
};

type FlightSegment = {
	from: string;
	to: string;
	date: string;
};

const defaultShoppingBaseUrl = 'https://shopping.copaair.com';
const defaultHubIata = 'PTY';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const iataPattern = /^[A-Z]{3}$/;
const millisecondsPerDay = 86_400_000;

function normalizeIata(value: string | null | undefined) {
	return String(value ?? '')
		.trim()
		.toUpperCase();
}

function assertIata(value: string, fieldName: string) {
	if (!iataPattern.test(value)) {
		throw new Error(`${fieldName} must be a valid IATA code.`);
	}
}

function assertDate(value: string, fieldName: string) {
	if (!datePattern.test(value)) {
		throw new Error(`${fieldName} must use YYYY-MM-DD.`);
	}
}

function assertInteger(value: number, fieldName: string) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${fieldName} must be a non-negative integer.`);
	}
}

function addDays(dateValue: string, days: number) {
	assertDate(dateValue, 'date');
	const [year, month, day] = dateValue.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	date.setTime(date.getTime() + days * millisecondsPerDay);
	return [
		date.getUTCFullYear(),
		String(date.getUTCMonth() + 1).padStart(2, '0'),
		String(date.getUTCDate()).padStart(2, '0')
	].join('-');
}

function getBookingLocaleParams(languageCode: string | null | undefined): BookingLocaleParams {
	const language = String(languageCode ?? '').toLowerCase();
	if (language.startsWith('pt')) return { sf: 'br', langid: 'pt' };
	if (language.startsWith('en')) return { sf: 'us', langid: 'en' };
	return { sf: 'pa', langid: 'es' };
}

function getStopoverUrl(input: StopoverBookingUrlInput) {
	const rawUrl = input.shoppingMulticityUrl || input.shoppingBaseUrl || defaultShoppingBaseUrl;
	const url = new URL(rawUrl);
	url.pathname = '/multicity';
	url.search = '';
	url.hash = '';
	return url;
}

function buildStopoverSegments(input: StopoverBookingUrlInput): FlightSegment[] {
	const origin = normalizeIata(input.origin);
	const destination = normalizeIata(input.destination);
	const hub = normalizeIata(input.hubIata || defaultHubIata);

	assertIata(origin, 'origin');
	assertIata(destination, 'destination');
	assertIata(hub, 'hubIata');
	assertDate(input.departureDate, 'departureDate');

	if (input.tripType === 'one_way') {
		const stopoverEndDate = addDays(input.departureDate, input.stopoverNights);
		return [
			{ from: origin, to: hub, date: input.departureDate },
			{ from: hub, to: destination, date: stopoverEndDate }
		];
	}

	if (!input.returnDate) {
		throw new Error('returnDate is required for roundtrip stopover booking.');
	}

	assertDate(input.returnDate, 'returnDate');

	if (input.stopoverPlacement === 'return') {
		const stopoverEndDate = addDays(input.returnDate, input.stopoverNights);
		return [
			{ from: origin, to: destination, date: input.departureDate },
			{ from: destination, to: hub, date: input.returnDate },
			{ from: hub, to: origin, date: stopoverEndDate }
		];
	}

	const stopoverEndDate = addDays(input.departureDate, input.stopoverNights);
	return [
		{ from: origin, to: hub, date: input.departureDate },
		{ from: hub, to: destination, date: stopoverEndDate },
		{ from: destination, to: origin, date: input.returnDate }
	];
}

function appendMulticityDates(params: URLSearchParams, segments: FlightSegment[]) {
	for (let index = 0; index < 5; index += 1) {
		params.append(`date${index + 1}`, segments[index]?.date ?? 'null');
	}
}

function appendMulticityAreas(params: URLSearchParams, segments: FlightSegment[]) {
	for (let index = 0; index < 5; index += 1) {
		const segment = segments[index];
		params.append(`area${index * 2 + 1}`, segment?.from ?? '');
		params.append(`area${index * 2 + 2}`, segment?.to ?? '');
	}
}

function buildStopoverBookingUrl(input: StopoverBookingUrlInput) {
	if (input.stopoverNights < 1 || input.stopoverNights > 15) {
		throw new Error('stopoverNights must be between 1 and 15.');
	}

	assertInteger(input.adults, 'adults');
	assertInteger(input.children, 'children');
	assertInteger(input.infants, 'infants');

	const segments = buildStopoverSegments(input);
	const { sf, langid } = getBookingLocaleParams(input.languageCode);
	const effectiveStopoverPlacement =
		input.tripType === 'one_way' ? 'outbound' : input.stopoverPlacement;
	const params = new URLSearchParams();

	params.append('roundtrip', 'false');
	params.append('seniors', '0');
	params.append('adults', String(input.adults));
	params.append('children', String(input.children));
	params.append('infants', String(input.infants));
	appendMulticityDates(params, segments);
	params.append('promocode', input.promoCode?.trim() ?? '');
	appendMulticityAreas(params, segments);
	params.append('advanced_air_search', 'true');
	params.append('flexible_dates_v2', 'false');
	params.append('stopoverNights', String(input.stopoverNights));
	params.append('stopoverLegNumber', effectiveStopoverPlacement === 'return' ? '2' : '1');
	params.append('stopover', 'true');
	params.append('cabinType', input.cabinType);
	params.append('stopoverType', effectiveStopoverPlacement === 'return' ? 'arrival' : 'origin');
	params.append('isMiles', 'false');
	params.append('sf', sf);
	params.append('langid', langid);

	const url = getStopoverUrl(input);
	url.search = params.toString();
	return url.toString();
}

export { addDays, buildStopoverBookingUrl, getBookingLocaleParams };
export type { CabinType, StopoverBookingTripType, StopoverBookingUrlInput, StopoverPlacement };
