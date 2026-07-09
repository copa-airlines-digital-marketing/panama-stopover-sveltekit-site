function normalizeIata(value) {
	return String(value ?? '')
		.trim()
		.toUpperCase();
}

function buildRouteEndpointIatas(activeDestinationIatas, excludedEndpointIatas) {
	const excluded = new Set(excludedEndpointIatas.map(normalizeIata));
	return [...new Set(activeDestinationIatas.map(normalizeIata))]
		.filter((iata) => /^[A-Z]{3}$/.test(iata) && !excluded.has(iata))
		.sort();
}

function buildSelfRoutePairCsv(routeEndpointIatas) {
	return routeEndpointIatas.map((iata) => `${iata}${iata}`).join(',');
}

function buildValidRoutesQueryEntries(routeEndpointIatas) {
	const routeEndpointCsv = routeEndpointIatas.join(',');
	const selfRoutePairCsv = buildSelfRoutePairCsv(routeEndpointIatas);

	if (!routeEndpointCsv) {
		throw new Error(
			'destinations returned zero usable route endpoint IATA values after exclusions.'
		);
	}

	return [
		['fields', 'origin,destination,status,originDestinationPair,error'],
		['filter[origin][_in]', routeEndpointCsv],
		['filter[destination][_in]', routeEndpointCsv],
		['filter[originDestinationPair][_nin]', selfRoutePairCsv],
		['sort', 'origin,destination']
	];
}

export { buildRouteEndpointIatas, buildSelfRoutePairCsv, buildValidRoutesQueryEntries };
