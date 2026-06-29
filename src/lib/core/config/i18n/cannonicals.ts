import { curry, isNotNil, map, mergeWith, replace } from 'ramda';

type PathLike = {
	parent?: PathLike | null;
	translations?: Array<{
		languages_code: string;
		path: string;
		title_tag?: string;
	}> | null;
};

type TranslationLike = {
	lang_code?: string;
	languages_code?: string;
	name?: string;
	path?: string;
	title_tag?: string;
};

type DirectusItem = {
	parent?: PathLike | null;
	parent_page?: PathLike | null;
	translations: TranslationLike[];
};

const concatWithSlash = curry((a: string, b: string) => `${a}/${b}`);

const isValidTranslation = (value: string) =>
	value.includes('/') && !value.includes('null') && !value.includes('undefined');

const filterValidTranslations = (values: Record<string, string>) =>
	Object.fromEntries(Object.entries(values).filter(([, value]) => isValidTranslation(value)));

const getPageNameRecursive = (item: PathLike) => {
	let parentPath: Record<string, string> = {};
	if (isNotNil(item.parent)) parentPath = getPageNameRecursive(item.parent);

	const translatedPath = (item.translations || []).reduce(
		(a, c) => ({ ...a, [c.languages_code]: c.title_tag || c.path }),
		<Record<string, string>>{}
	);

	return mergeWith(concatWithSlash, parentPath, translatedPath);
};

const getBreadcrumNames = (item: DirectusItem) => {
	const currentName = item.translations?.reduce(
		(a, c) => ({ ...a, [c.languages_code || c.lang_code || '']: c.name || c.title_tag || '' }),
		<Record<string, string>>{}
	);

	const parent = item.parent_page || item.parent;
	const parentNames = parent ? getPageNameRecursive(parent) : {};

	return filterValidTranslations(mergeWith(concatWithSlash, parentNames, currentName));
};

const getPathRecursive = (item: PathLike) => {
	let parentPath: Record<string, string> = {};
	if (isNotNil(item.parent)) parentPath = getPathRecursive(item.parent);

	const translatedPath = (item.translations || []).reduce(
		(a, c) => ({ ...a, [c.languages_code]: c.path }),
		<Record<string, string>>{}
	);

	return mergeWith(concatWithSlash, parentPath, translatedPath);
};

const getCannonicals = (item: DirectusItem) => {
	const currentPaths = item.translations.reduce(
		(a, c) => ({ ...a, [c.languages_code || c.lang_code || '']: c.path || '' }),
		<Record<string, string>>{}
	);

	const parent = item.parent_page || item.parent;
	const parentPath = parent ? map(replace(/\/\//g, '/'), getPathRecursive(parent)) : {};

	const cannonicals = map(
		replace(/\/\//g, '/'),
		mergeWith(concatWithSlash, parentPath, currentPaths)
	) as unknown as Record<string, string>;

	return filterValidTranslations(cannonicals);
};

export { getPathRecursive, getCannonicals, getBreadcrumNames };
