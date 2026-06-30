import fs from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { buildRouteEndpointIatas, buildValidRoutesQueryEntries } from './stopover-route-query.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'static', 'data');
const hubIata = 'PTY';
const excludedEndpointIatas = [hubIata, 'DAV'];
const pageSize = 500;
const languages = [
	{ code: 'es', locale: 'es-PA' },
	{ code: 'en', locale: 'en-US' },
	{ code: 'pt', locale: 'pt-BR' }
];
const iataPattern = /^[A-Z]{3}$/;
const totalTimer = startPerfTimer('total');

dotenv.config({ path: path.join(projectRoot, '.env') });

const agentEnv = readEnvFile('.env.agent');
const directusUrl = normalizeBaseUrl(
	process.env.DIRECTUS_REST_URL || process.env.DIRECTUS_URL || agentEnv.DIRECTUS_REST_URL
);
const directusToken =
	process.env.DIRECTUS_ROUTES_TOKEN ||
	agentEnv.DIRECTUS_ROUTES_TOKEN ||
	agentEnv.DIRECTUS_TOKEN ||
	process.env.DIRECTUS_STATIC_TOKEN ||
	process.env.DIRECTUS_TOKEN;

if (!directusUrl || !directusToken) {
	throw new Error(
		'Missing Directus credentials. Set DIRECTUS_REST_URL/DIRECTUS_URL and DIRECTUS_ROUTES_TOKEN or DIRECTUS_TOKEN.'
	);
}

const destinations = await measureAsync('fetch destinations', () =>
	fetchAllItems('destinations', [
		['fields', 'iata_code,country,status'],
		['filter[status][_eq]', 'active'],
		['sort', 'iata_code']
	])
);

const destinationByIata = measureSync('index destinations', () => {
	const destinationIndex = new Map();
	for (const destination of destinations) {
		const iata = normalizeIata(destination.iata_code);
		if (!isValidIata(iata)) continue;
		destinationIndex.set(iata, {
			country: typeof destination.country === 'string' ? destination.country.toUpperCase() : null,
			status: destination.status ?? null
		});
	}
	return destinationIndex;
});
const activeDestinationIatas = new Set(destinationByIata.keys());
const activeDestinationCsv = [...activeDestinationIatas].sort().join(',');
const routeEndpointIatas = buildRouteEndpointIatas(
	[...activeDestinationIatas],
	excludedEndpointIatas
);

if (!activeDestinationCsv) {
	throw new Error('destinations returned zero active IATA values for Stopover route generation.');
}

const validRoutesQueryEntries = buildValidRoutesQueryEntries(routeEndpointIatas);
const validRoutes = await measureAsync('fetch valid_routes', () =>
	fetchAllItems('valid_routes', validRoutesQueryEntries)
);
const destinationTranslations = await measureAsync('fetch destination translations', () =>
	fetchAllItems('destinations_translations', [
		['fields', 'destinations_iata_code,languages_code,name,airport_name'],
		['filter[destinations_iata_code][_in]', activeDestinationCsv],
		['sort', 'destinations_iata_code,languages_code']
	])
);

const translationsByIata = measureSync('index destination translations', () => {
	const translationsIndex = new Map();
	for (const translation of destinationTranslations) {
		const iata = normalizeIata(translation.destinations_iata_code);
		const language = normalizeLanguage(translation.languages_code);
		if (!isValidIata(iata) || !language) continue;

		const byLanguage = translationsIndex.get(iata) ?? {};
		byLanguage[language] = {
			name: cleanString(translation.name),
			airportName: cleanString(translation.airport_name)
		};
		translationsIndex.set(iata, byLanguage);
	}
	return translationsIndex;
});

const malformedRoutes = [];
const selfRouteRoutes = [];
const excludedEndpointRoutes = [];
const excludedInactiveEndpointRoutes = [];
const statusCounts = {};
const routePairSet = new Set();
const destinationsByOriginSets = new Map();
let duplicateRouteCount = 0;

measureSync('build route index', () => {
	for (const route of validRoutes) {
		const origin = normalizeIata(route.origin);
		const destination = normalizeIata(route.destination);
		const status = cleanString(route.status) || 'unknown';
		statusCounts[status] = (statusCounts[status] ?? 0) + 1;

		if (!isValidIata(origin) || !isValidIata(destination)) {
			malformedRoutes.push({
				origin: route.origin ?? null,
				destination: route.destination ?? null,
				originDestinationPair: route.originDestinationPair ?? null
			});
			continue;
		}

		if (origin === destination) {
			selfRouteRoutes.push(`${origin}-${destination}`);
			continue;
		}

		if (excludedEndpointIatas.includes(origin) || excludedEndpointIatas.includes(destination)) {
			excludedEndpointRoutes.push(`${origin}-${destination}`);
			continue;
		}

		if (!activeDestinationIatas.has(origin) || !activeDestinationIatas.has(destination)) {
			excludedInactiveEndpointRoutes.push(`${origin}-${destination}`);
			continue;
		}

		const pairKey = `${origin}-${destination}`;
		if (routePairSet.has(pairKey)) {
			duplicateRouteCount += 1;
			continue;
		}

		routePairSet.add(pairKey);
		const destinationSet = destinationsByOriginSets.get(origin) ?? new Set();
		destinationSet.add(destination);
		destinationsByOriginSets.set(origin, destinationSet);
	}
});

if (malformedRoutes.length) {
	throw new Error(
		`valid_routes contains ${malformedRoutes.length} malformed route(s): ${JSON.stringify(
			malformedRoutes.slice(0, 10)
		)}`
	);
}

const validRoutePairs = [...routePairSet].sort();
if (!validRoutePairs.length) {
	throw new Error('valid_routes returned zero usable Stopover routes after endpoint filtering.');
}

const origins = [...destinationsByOriginSets.keys()].sort();
const destinationSet = new Set();
for (const destinationsForOrigin of destinationsByOriginSets.values()) {
	for (const destination of destinationsForOrigin) destinationSet.add(destination);
}
const routeDestinations = [...destinationSet].sort();
const allRouteAirports = [...new Set([...origins, ...routeDestinations])].sort();

const airports = measureSync('build airport labels', () => {
	const airportRecords = {};
	for (const iata of allRouteAirports) {
		airportRecords[iata] = buildAirportRecord(iata);
	}
	return airportRecords;
});

const destinationsByOrigin = {};
for (const origin of origins) {
	destinationsByOrigin[origin] = [...(destinationsByOriginSets.get(origin) ?? [])].sort();
}

const routeIndex = {
	schemaVersion: 1,
	hubIata,
	excludedEndpointIatas,
	airports,
	origins,
	destinations: routeDestinations,
	destinationsByOrigin,
	validRoutePairs,
	source: {
		collection: 'valid_routes',
		filter: {
			endpointDestinationStatus: 'active',
			excludedEndpointIatas,
			excludeSelfRoutes: true
		},
		readRouteCount: validRoutes.length,
		usableRouteCount: validRoutePairs.length,
		activeDestinationEndpointCount: activeDestinationIatas.size,
		routeEndpointCount: routeEndpointIatas.length,
		excludedEndpointCount: excludedEndpointRoutes.length,
		excludedPtyEndpointCount: excludedEndpointRoutes.filter((route) => route.includes(hubIata))
			.length,
		excludedInactiveEndpointCount: excludedInactiveEndpointRoutes.length,
		selfRouteCount: selfRouteRoutes.length,
		duplicateRouteCount,
		destinationMetadataCount: destinations.length,
		destinationTranslationCount: destinationTranslations.length,
		statusCounts: sortObjectByKey(statusCounts)
	}
};

const rules = {
	schemaVersion: 1,
	hubIata,
	excludedEndpointIatas,
	stopover: {
		required: true,
		minNights: 1,
		maxNights: 15,
		milesSupported: false,
		multicitySegmentStopoverSupported: false
	},
	passengers: {
		maxTotal: 8,
		infantRequiresAdult: true
	},
	dates: {
		bookingWindowDays: 330,
		minDestinationNights: 1
	},
	routes: {
		indexPath: '/data/stopover-route-index.json',
		validRouteCount: routeIndex.source.usableRouteCount,
		originCount: origins.length,
		destinationCount: routeDestinations.length,
		activeDestinationEndpointCount: routeIndex.source.activeDestinationEndpointCount,
		routeEndpointCount: routeIndex.source.routeEndpointCount,
		excludedEndpointCount: routeIndex.source.excludedEndpointCount,
		excludedPtyEndpointCount: routeIndex.source.excludedPtyEndpointCount,
		excludedInactiveEndpointCount: routeIndex.source.excludedInactiveEndpointCount,
		selfRouteCount: routeIndex.source.selfRouteCount
	},
	booking: {
		baseUrl: 'https://shopping.copaair.com',
		stopoverFlow: '/multicity',
		currencyQueryParamSupported: false
	}
};

await measureAsync('write route json', async () => {
	await mkdir(outputDir, { recursive: true });
	await writeJson('stopover-route-index.json', routeIndex);
	await writeJson('stopover-rules.json', rules);
});

totalTimer();

console.log(
	[
		'Generated Stopover route data:',
		`routes=${routeIndex.source.usableRouteCount}`,
		`origins=${origins.length}`,
		`destinations=${routeDestinations.length}`,
		`excludedEndpoints=${routeIndex.source.excludedEndpointCount}`,
		`excludedInactiveEndpoints=${routeIndex.source.excludedInactiveEndpointCount}`,
		`selfRoutes=${routeIndex.source.selfRouteCount}`,
		`destinationMetadata=${destinations.length}`,
		`translations=${destinationTranslations.length}`
	].join(' ')
);

function startPerfTimer(label) {
	const start = performance.now();
	return () => {
		const durationMs = performance.now() - start;
		console.log(`[stopover-routes:perf] ${label}=${durationMs.toFixed(1)}ms`);
		return durationMs;
	};
}

function measureSync(label, task) {
	const stopTimer = startPerfTimer(label);
	try {
		return task();
	} finally {
		stopTimer();
	}
}

async function measureAsync(label, task) {
	const stopTimer = startPerfTimer(label);
	try {
		return await task();
	} finally {
		stopTimer();
	}
}

function readEnvFile(fileName) {
	const filePath = path.join(projectRoot, fileName);
	if (!fs.existsSync(filePath)) return {};
	return dotenv.parse(fs.readFileSync(filePath));
}

function normalizeBaseUrl(value) {
	return cleanString(value)?.replace(/\/$/, '') ?? '';
}

function normalizeIata(value) {
	return String(value ?? '')
		.trim()
		.toUpperCase();
}

function isValidIata(value) {
	return iataPattern.test(normalizeIata(value));
}

function normalizeLanguage(value) {
	const normalized = cleanString(value)?.toLowerCase();
	if (!normalized) return null;
	if (normalized.startsWith('en')) return 'en';
	if (normalized.startsWith('pt')) return 'pt';
	if (normalized.startsWith('es')) return 'es';
	return null;
}

function cleanString(value) {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed || null;
}

async function fetchAllItems(collection, queryEntries) {
	const items = [];
	let offset = 0;

	while (true) {
		const params = new URLSearchParams(queryEntries);
		params.set('limit', String(pageSize));
		params.set('offset', String(offset));

		const response = await fetch(`${directusUrl}/items/${collection}?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${directusToken}`
			}
		});

		if (!response.ok) {
			const body = await response.text();
			throw new Error(`Directus ${collection} request failed with ${response.status}: ${body}`);
		}

		const payload = await response.json();
		if (!Array.isArray(payload.data)) {
			throw new Error(`Directus ${collection} response did not include a data array.`);
		}

		items.push(...payload.data);
		if (payload.data.length < pageSize) break;
		offset += pageSize;
	}

	return items;
}

function buildAirportRecord(iata) {
	const destination = destinationByIata.get(iata);
	const translations = translationsByIata.get(iata) ?? {};
	const cityNames = {};
	const airportNames = {};
	const countryNames = {};
	const labels = {};

	for (const { code, locale } of languages) {
		const cityName =
			translations[code]?.name || translations.es?.name || translations.en?.name || iata;
		const airportName =
			translations[code]?.airportName ||
			translations.es?.airportName ||
			translations.en?.airportName ||
			null;
		const countryName = getCountryName(destination?.country, locale);

		cityNames[code] = cityName;
		if (countryName) countryNames[code] = countryName;
		if (airportName) airportNames[code] = airportName;
		labels[code] = formatAirportLabel(cityName, countryName, iata);
	}

	return {
		iata,
		country: destination?.country ?? null,
		cityNames,
		countryNames,
		airportNames,
		labels
	};
}

function getCountryName(countryCode, locale) {
	if (!countryCode) return null;
	try {
		return new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ?? null;
	} catch {
		return countryCode;
	}
}

function formatAirportLabel(cityName, countryName, iata) {
	if (cityName && countryName) return `${cityName} (${iata}), ${countryName}`;
	if (cityName && cityName !== iata) return `${cityName} (${iata})`;
	return iata;
}

function sortObjectByKey(value) {
	return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
}

async function writeJson(fileName, value) {
	await writeFile(path.join(outputDir, fileName), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
