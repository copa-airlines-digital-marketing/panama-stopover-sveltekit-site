type StopoverRouteLanguage = 'es' | 'en' | 'pt';

type StopoverAirport = {
	iata: string;
	country?: string | null;
	cityNames: Partial<Record<StopoverRouteLanguage, string>>;
	countryNames?: Partial<Record<StopoverRouteLanguage, string>>;
	airportNames: Partial<Record<StopoverRouteLanguage, string>>;
	labels: Record<StopoverRouteLanguage, string>;
};

type StopoverRouteIndex = {
	schemaVersion: 1;
	hubIata: string;
	excludedEndpointIatas?: string[];
	airports: Record<string, StopoverAirport>;
	origins: string[];
	destinations: string[];
	destinationsByOrigin: Record<string, string[]>;
	validRoutePairs: string[];
	source: {
		collection: 'valid_routes';
		filter: {
			endpointDestinationStatus: 'active';
			excludedEndpointIatas?: string[];
			excludeSelfRoutes?: boolean;
		};
		readRouteCount: number;
		usableRouteCount: number;
		activeDestinationEndpointCount?: number;
		routeEndpointCount?: number;
		excludedEndpointCount?: number;
		excludedPtyEndpointCount: number;
		excludedInactiveEndpointCount?: number;
		selfRouteCount?: number;
		duplicateRouteCount: number;
		destinationMetadataCount: number;
		destinationTranslationCount: number;
		statusCounts: Record<string, number>;
	};
};

type AirportOption = {
	value: string;
	label: string;
	primaryLabel?: string;
	emphasisLabel?: string;
	secondaryLabel?: string;
	disabled?: boolean;
};

const routeLanguages: StopoverRouteLanguage[] = ['es', 'en', 'pt'];
const iataPattern = /^[A-Z]{3}$/;

function normalizeIata(value: string | null | undefined) {
	return String(value ?? '')
		.trim()
		.toUpperCase();
}

function normalizeRouteLanguage(value: string | null | undefined): StopoverRouteLanguage {
	const normalized = String(value ?? '').toLowerCase();
	if (normalized.startsWith('en')) return 'en';
	if (normalized.startsWith('pt')) return 'pt';
	return 'es';
}

function getRoutePairKey(origin: string, destination: string) {
	return `${normalizeIata(origin)}-${normalizeIata(destination)}`;
}

function isValidIata(value: string | null | undefined) {
	return iataPattern.test(normalizeIata(value));
}

function isStopoverRouteIndex(value: unknown): value is StopoverRouteIndex {
	if (!value || typeof value !== 'object') return false;

	const candidate = value as Partial<StopoverRouteIndex>;
	return (
		candidate.schemaVersion === 1 &&
		typeof candidate.hubIata === 'string' &&
		typeof candidate.airports === 'object' &&
		Array.isArray(candidate.origins) &&
		Array.isArray(candidate.destinations) &&
		typeof candidate.destinationsByOrigin === 'object' &&
		Array.isArray(candidate.validRoutePairs)
	);
}

function getAirportLabel(
	index: StopoverRouteIndex | null,
	iata: string,
	language: string | null | undefined = 'es'
) {
	const normalizedIata = normalizeIata(iata);
	const airport = index?.airports[normalizedIata];
	const normalizedLanguage = normalizeRouteLanguage(language);

	return airport?.labels[normalizedLanguage] || airport?.labels.es || normalizedIata;
}

function getAirportDisplayParts(
	index: StopoverRouteIndex,
	iata: string,
	language: string | null | undefined = 'es'
) {
	const normalizedIata = normalizeIata(iata);
	const airport = index.airports[normalizedIata];
	const normalizedLanguage = normalizeRouteLanguage(language);

	if (!airport) return null;

	const primaryLabel =
		airport.cityNames[normalizedLanguage] ||
		airport.cityNames.es ||
		airport.cityNames.en ||
		normalizedIata;
	const secondaryLabel =
		airport.countryNames?.[normalizedLanguage] ||
		airport.countryNames?.es ||
		airport.countryNames?.en ||
		airport.country?.toUpperCase() ||
		undefined;

	return {
		primaryLabel,
		emphasisLabel: normalizedIata,
		secondaryLabel
	};
}

function getAirportOptions(
	index: StopoverRouteIndex | null,
	iatas: string[],
	language: string | null | undefined = 'es'
): AirportOption[] {
	if (!index) return [];

	return iatas
		.map((iata) => normalizeIata(iata))
		.filter((iata) => isValidIata(iata) && Boolean(index.airports[iata]))
		.map((iata) => ({
			value: iata,
			label: getAirportLabel(index, iata, language),
			...getAirportDisplayParts(index, iata, language)
		}))
		.sort((a, b) => a.label.localeCompare(b.label, normalizeRouteLanguage(language)));
}

function getOriginOptions(
	index: StopoverRouteIndex | null,
	language: string | null | undefined = 'es',
	destination = ''
) {
	if (!index) return [];

	const normalizedDestination = normalizeIata(destination);
	const originIatas =
		normalizedDestination && isValidIata(normalizedDestination)
			? index.origins.filter((origin) =>
					(index.destinationsByOrigin[origin] ?? []).includes(normalizedDestination)
				)
			: index.origins;

	return getAirportOptions(index, originIatas, language);
}

function getDestinationOptions(
	index: StopoverRouteIndex | null,
	origin: string,
	language: string | null | undefined = 'es'
) {
	if (!index) return [];

	const normalizedOrigin = normalizeIata(origin);
	const destinationIatas =
		normalizedOrigin && index.destinationsByOrigin[normalizedOrigin]
			? index.destinationsByOrigin[normalizedOrigin]
			: index.destinations;

	return getAirportOptions(index, destinationIatas, language);
}

function isValidStopoverRoute(
	index: StopoverRouteIndex | null,
	origin: string,
	destination: string
) {
	const normalizedOrigin = normalizeIata(origin);
	const normalizedDestination = normalizeIata(destination);

	if (!index || !isValidIata(normalizedOrigin) || !isValidIata(normalizedDestination)) {
		return false;
	}

	const excludedEndpointIatas = index.excludedEndpointIatas ?? [index.hubIata];
	if (
		excludedEndpointIatas.includes(normalizedOrigin) ||
		excludedEndpointIatas.includes(normalizedDestination)
	) {
		return false;
	}

	return index.validRoutePairs.includes(getRoutePairKey(normalizedOrigin, normalizedDestination));
}

export {
	getAirportLabel,
	getDestinationOptions,
	getOriginOptions,
	getRoutePairKey,
	isStopoverRouteIndex,
	isValidIata,
	isValidStopoverRoute,
	normalizeIata,
	normalizeRouteLanguage,
	routeLanguages
};

export type { AirportOption, StopoverAirport, StopoverRouteIndex, StopoverRouteLanguage };
