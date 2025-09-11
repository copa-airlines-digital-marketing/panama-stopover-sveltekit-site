import { getTransportations } from '$cms/collections/stopover_transportation';
import { DIRECTUS_REST_URL, DIRECTUS_TOKEN } from '$env/static/private';
import { type DirectusRequestBody } from '../utils';
import { getTransportationQuery } from './types';

function assertAllStrings<T extends Record<string, unknown>>(
	obj: T,
	opt?: { allowEmpty?: boolean }
): asserts obj is { [K in keyof T]: T[K] & string } {
	for (const [k, v] of Object.entries(obj)) {
		if (typeof v !== 'string') {
			throw new TypeError(`${k} must be a string`);
		}
		if (opt?.allowEmpty === false && v.trim().length === 0) {
			throw new TypeError(`${k} cannot be empty`);
		}
	}
}

const getParams = (filters: DirectusRequestBody) => {
	const { locale, category, subCategory, article } = filters;
	const queryParams = { locale, category, subCategory, article };
	assertAllStrings(queryParams, { allowEmpty: false });
	return queryParams;
};

const getPublishedTransportation = async (filters: DirectusRequestBody) => {
	const { locale, category, subCategory, article } = getParams(filters);

	const transportation = await getTransportations(
		DIRECTUS_REST_URL,
		DIRECTUS_TOKEN,
		getTransportationQuery(locale, category, subCategory, article)
	);

	const [res] = transportation;

	return res;
};

export { getPublishedTransportation };
