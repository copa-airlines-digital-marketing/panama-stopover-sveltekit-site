import { getItems, type DirectusRequestBody } from '../../infrastructure/directus/utils';
import { getPackageQuery } from './types';

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
	const params = { locale, category, subCategory, article };

	console.log('getting package', article);

	if (!validateAllParameters(params)) return null;

	const queryParams = params as Record<'locale' | 'category' | 'subCategory' | 'article', string | number>;
	const query = getPackageQuery(
		queryParams.locale,
		queryParams.category,
		queryParams.subCategory,
		queryParams.article
	);
	const packages = await getItems('stopover_package', query, filters.preview);

	if (!packages) return null;

	const [pkg] = packages;

	return pkg;
};

export { getPublishedPackages };
