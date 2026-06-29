import { SITE_ID } from '$env/static/private';
import { getItems } from '$lib/infrastructure/directus/utils';
import { groupBy, map, path, reduce } from 'ramda';
import {
	getValueOfFulfilledPromise,
	isPromiseFulfilled,
	toIdObject,
	unifyPages,
	toFlattedTranslation,
	searchParent
} from './utils';
import type { PageLike, PagesByLocale } from './utils';

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

function getAllPages() {
	return Promise.allSettled([
		getItems('pages', pagesQuery, null),
		getItems('stopover_hotels', moduleQuery, null),
		getItems('stopover_restaurants', moduleQuery, null),
		getItems('stopover_place_to_visit', moduleQuery, null),
		getItems('stopover_tour', moduleQuery2, null),
		getItems('stopover_package', moduleQuery2, null),
		getItems('stopover_transportation', moduleQuery2, null)
	]);
}

async function getAllPagesParams() {
	const pagesRequests = await getAllPages();

	if (!pagesRequests.every((promise) => promise.status === 'fulfilled')) return [];

	const pageRequestValues = (pagesRequests as PromiseFulfilledResult<unknown>[]).map((promise) => promise.value) as Array<PageLike[] | null>;
	const pageGroups = pageRequestValues.map((value) => value || []);
	const mainPageTranslations = (pageGroups[0] || []).flatMap((page) =>
		(page.translations || []).map((translation) => ({ ...page, translations: translation }))
	);

	const mainPages = (map as any)(
		map(unifyPages),
		(map as any)(
			reduce(toIdObject, {}),
			(groupBy as any)(
				path(['translations', 'languages_code']),
				mainPageTranslations as PageLike[]
			)
		)
	) as PagesByLocale;

	const pagesPathFinder = (map as any)((map as any)(searchParent(mainPages)), mainPages) as unknown as Record<string, Record<string, string[]>>;

	const pages = toFlattedTranslation(pageGroups.flat()) as Array<PageLike & { locale?: string }>;

	return pages
		.filter((page) => ['en', 'es', 'pt'].includes(page.locale || ''))
		.map((page) => ({
			path: [...(pagesPathFinder[page.locale || '']?.[String(page.parent || '')] || []), page.path].join('/')
		}));
}

export { getAllPagesParams };
