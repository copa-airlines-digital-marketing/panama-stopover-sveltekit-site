import { getPackages } from '$cms/collections/stopover_package';
import { DIRECTUS_REST_URL, DIRECTUS_TOKEN } from '$env/static/private';
import { type DirectusRequestBody } from '../utils';
import { getPackageQuery, type StopoverPackageQuery } from './types';

const paramExistAndIsString = ([key, value]: [string, string | number | null | undefined]) => {
	if ((typeof value === 'string' || typeof value === 'number') && !!value) return true;

	console.error(`${key} is required to retrieve the package, but recieved: ${value}`);

	return false;
};

const validateAllParameters = (
	params: Record<string, string | number | null | undefined>
): params is Record<string, string> => Object.entries(params).every(paramExistAndIsString);

const getPublishedPackages = async (filters: DirectusRequestBody) => {
	const { locale, category, subCategory, article } = filters;

	console.log('getting package', article);

	if (!validateAllParameters({ locale, category, subCategory, article })) return null;

	const packages = await getPackages<StopoverPackageQuery>(
		DIRECTUS_REST_URL,
		DIRECTUS_TOKEN,
		getPackageQuery(locale, category, subCategory, article)
	);

	const [pkg] = packages;

	return pkg;
};

export { getPublishedPackages };
