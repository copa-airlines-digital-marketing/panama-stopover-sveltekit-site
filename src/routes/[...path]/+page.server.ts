import { getPageData } from '$lib/data/page.js';
import type { HotelSchema } from '$lib/directus/hotels.js';
import { isNotFoundSchema } from '$lib/directus/not-found.js';
import { isPageSettings, type PageSchema } from '$lib/directus/page.js';
import type { PlaceSchema } from '$lib/directus/place-to-visit.js';
import type { RestaurantSchema } from '$lib/directus/restaurants.js';
import type { SectionSchema } from '$lib/directus/section.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';
import { getAllSectionModules, getModuleRequest, setToValue } from '../utils';
import { isEmpty, isNil } from 'ramda';
import type { EntryGenerator } from '../$types';
import { getAllPagesParams } from '$lib/data/pages';

type DataTypeMap = {
	page: PageSchema | undefined;
	pageSections: SectionSchema[] | undefined;
	stopover_hotels: HotelSchema | undefined;
	stopover_restaurants: RestaurantSchema | undefined;
	stopover_place_to_visit: PlaceSchema | undefined;
};

export const entries: EntryGenerator = async () => {
	const allPagesParams = await getAllPagesParams();
	console.log(
		`Sveltekit will render ${allPagesParams.length} pages`,
		JSON.stringify(
			allPagesParams.map((v) => v.path),
			null,
			2
		)
	);
	return allPagesParams;
};

export async function load(event) {
	const {
		parent,
		params: { path },
		route
	} = event;

	console.log(`requesting data for page: ${path}`);

	if (!path) {
		say('Path param is required', event);
		return error(404);
	}

	const preview = null;

	const [locale, category, subCategory, article] = path.split('/');

	const [pageData, parentData] = await Promise.all([
		getPageData({ locale, preview, category, subCategory, article, home: category || 'true' }),
		parent()
	]);

	//console.log('pageData', pageData);

	const { page, sections: pageSections } = pageData;

	if (!article && !isPageSettings(page)) {
		say('error ocurred while getting homepage info');
		return error(500);
	}

	if (pageSections) {
		const modulesPaths = getAllSectionModules(pageSections);

		const modulesData = await Promise.allSettled(
			modulesPaths.map(getModuleRequest(pageSections, locale))
		);

		modulesPaths.forEach((path, key) => {
			const items = modulesData[key].value || null;

			if (isNil(items) || isEmpty(items)) return;

			setToValue(pageSections, items, [...path, 'items']);
		});
	}

	if (isNotFoundSchema(pageData)) {
		say('Page requested not found', route);
		return error(404);
	}

	const finalData: DataTypeMap = {
		page,
		stopover_hotels: undefined,
		stopover_restaurants: undefined,
		stopover_place_to_visit: undefined,
		...pageData,
		pageSections
	};

	console.log(`Processed data for: ${path}, sending it to render`);

	return {
		...parentData,
		...finalData
	};
}

export const prerender = true;
