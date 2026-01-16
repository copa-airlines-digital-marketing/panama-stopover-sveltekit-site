import { getItems, type DirectusRequestBody } from '../../infrastructure/directus/utils';
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

	const query = getTransportationQuery(locale, category, subCategory, article);
	const transportation = await getItems('stopover_transportation', query, filters.preview);

	if (!transportation) return null;

	const [res] = transportation;

	return res;
};

export { getPublishedTransportation };
