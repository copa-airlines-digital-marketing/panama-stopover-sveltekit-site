import { SITE_ID } from '$env/static/private';
import { getItems } from '$lib/infrastructure/directus/utils';
import { isPromiseFulfilled } from './utils';

type SourceCollection =
	| 'pages'
	| 'stopover_hotels'
	| 'stopover_restaurants'
	| 'stopover_place_to_visit'
	| 'stopover_tour'
	| 'stopover_package'
	| 'stopover_transportation';

type DirectusTranslation = {
	languages_code?: string | null;
	lang_code?: string | null;
	path?: string | null;
};

type DirectusPageLike = {
	id?: string | number | null;
	status?: string | null;
	parent?: string | number | null;
	parent_page?: string | number | null;
	translations?: DirectusTranslation[] | null;
};

type PagePathEntry = {
	path: string;
	source_collection: SourceCollection;
	source_id: string | number | null;
	source_status: string | null;
	parent_id: string | number | null;
	locale: string;
	raw_path: string;
	parent_segments: string[];
};

const supportedLocales = ['en', 'es', 'pt'];

const pagesQuery = {
	fields: ['id', 'status', 'parent', { translations: ['languages_code', 'path'] }],
	filter: {
		_and: [
			{
				site: {
					_eq: SITE_ID
				}
			},
			{
				parent: {
					_nnull: true
				}
			}
		]
	}
};

const moduleQuery = {
	fields: ['id', 'status', 'parent_page', { translations: ['lang_code', 'path'] }]
};

const moduleQuery2 = {
	fields: ['id', 'status', 'parent_page', { translations: ['languages_code', 'path'] }]
};

const toRoutePath = (segments: unknown[]) =>
	segments
		.flatMap((segment) =>
			String(segment ?? '')
				.split('/')
				.map((pathSegment) => pathSegment.trim())
		)
		.filter(Boolean)
		.join('/');

const routeSources = [
	{ collection: 'pages', query: pagesQuery },
	{ collection: 'stopover_hotels', query: moduleQuery },
	{ collection: 'stopover_restaurants', query: moduleQuery },
	{ collection: 'stopover_place_to_visit', query: moduleQuery },
	{ collection: 'stopover_tour', query: moduleQuery2 },
	{ collection: 'stopover_package', query: moduleQuery2 },
	{ collection: 'stopover_transportation', query: moduleQuery2 }
] satisfies Array<{ collection: SourceCollection; query: any }>;

function getAllPages() {
	return Promise.allSettled(
		routeSources.map(({ collection, query }) => getItems(collection, query, null))
	);
}

const getLocale = (translation: DirectusTranslation) =>
	translation.languages_code || translation.lang_code || null;

const getParentId = (page: DirectusPageLike) => page.parent || page.parent_page || null;

const getTranslationRows = (collection: SourceCollection, page: DirectusPageLike) =>
	(page.translations || []).map((translation) => ({
		source_collection: collection,
		source_id: page.id || null,
		source_status: page.status || null,
		parent_id: getParentId(page),
		locale: getLocale(translation),
		raw_path: translation.path || ''
	}));

const buildMainPageLookup = (pages: DirectusPageLike[]) => {
	const lookup: Record<
		string,
		Record<string, { parent_id: string | number | null; raw_path: string }>
	> = {};

	pages.forEach((page) => {
		getTranslationRows('pages', page).forEach((translation) => {
			if (!translation.locale || !translation.source_id) return;

			lookup[translation.locale] ||= {};
			lookup[translation.locale][String(translation.source_id)] = {
				parent_id: translation.parent_id,
				raw_path: translation.raw_path
			};
		});
	});

	return lookup;
};

const getParentSegments = (
	lookup: ReturnType<typeof buildMainPageLookup>,
	locale: string,
	parentId: string | number | null,
	visited: string[] = []
): string[] => {
	if (!parentId) return [];

	const parentKey = String(parentId);
	const parent = lookup[locale]?.[parentKey];

	if (!parent || visited.includes(parentKey)) return [];

	return [
		...getParentSegments(lookup, locale, parent.parent_id, [...visited, parentKey]),
		parent.raw_path
	];
};

const formatRouteDiagnostic = (entry: PagePathEntry) => ({
	source_collection: entry.source_collection,
	source_id: entry.source_id,
	source_status: entry.source_status,
	locale: entry.locale,
	parent_id: entry.parent_id,
	parent_segments: entry.parent_segments,
	raw_path: entry.raw_path,
	resolved_path: entry.path,
	suggested_normalized_path: toRoutePath([entry.path])
});

const getInvalidRouteReason = (path: string) => {
	if (!path) return 'resolved path is empty';
	if (path.startsWith('/')) return 'resolved path starts with a slash';
	if (path.endsWith('/')) return 'resolved path ends with a slash';
	if (path.split('/').some((segment) => !segment)) return 'resolved path contains an empty segment';
	return null;
};

const assertValidRouteEntries = (entries: PagePathEntry[]) => {
	const invalidEntries = entries
		.map((entry) => ({ entry, reason: getInvalidRouteReason(entry.path) }))
		.filter((result): result is { entry: PagePathEntry; reason: string } => Boolean(result.reason));

	if (invalidEntries.length === 0) return;

	console.error(
		'[prerender:routes] Invalid CMS route paths detected before SvelteKit prerender',
		JSON.stringify(
			invalidEntries.map(({ entry, reason }) => ({
				reason,
				...formatRouteDiagnostic(entry)
			})),
			null,
			2
		)
	);

	throw new Error(
		`Invalid CMS route paths detected: ${invalidEntries.length}. See [prerender:routes] log above for collection, id, locale, raw_path and resolved_path.`
	);
};

const countBy = <T>(items: T[], getKey: (item: T) => string) =>
	items.reduce<Record<string, number>>((result, item) => {
		const key = getKey(item);
		result[key] = (result[key] || 0) + 1;
		return result;
	}, {});

async function getAllPagesParams(): Promise<PagePathEntry[]> {
	const pagesRequests = await getAllPages();

	pagesRequests.forEach((request, index) => {
		if (request.status === 'rejected') {
			console.error(
				`[prerender:routes] Directus request rejected for ${routeSources[index].collection}`,
				request.reason
			);
		}
	});

	if (!pagesRequests.every(isPromiseFulfilled)) return [];

	const pageRequestValues = pagesRequests.map((request, index) => {
		const value = request.value;

		if (!Array.isArray(value)) {
			console.error(
				`[prerender:routes] Directus returned no array for ${routeSources[index].collection}`,
				JSON.stringify({ value_type: typeof value, value }, null, 2)
			);
			return [];
		}

		return value as DirectusPageLike[];
	});

	const pagesPathFinder = buildMainPageLookup(pageRequestValues[0]);

	const pages = pageRequestValues
		.flatMap((items, index) =>
			items.flatMap((page) => getTranslationRows(routeSources[index].collection, page))
		)
		.filter((page) => page.locale && supportedLocales.includes(page.locale))
		.map((page) => {
			const locale = page.locale || '';
			const parentSegments = getParentSegments(pagesPathFinder, locale, page.parent_id);

			return {
				...page,
				locale,
				parent_segments: parentSegments,
				path: toRoutePath([...parentSegments, page.raw_path])
			};
		});

	assertValidRouteEntries(pages);

	console.log(
		'[prerender:routes] CMS route paths resolved successfully',
		JSON.stringify(
			{
				total: pages.length,
				by_collection: countBy(pages, (page) => page.source_collection),
				by_locale: countBy(pages, (page) => page.locale),
				sample: pages.slice(0, 10).map(formatRouteDiagnostic)
			},
			null,
			2
		)
	);

	return pages;
}

export { getAllPagesParams };
