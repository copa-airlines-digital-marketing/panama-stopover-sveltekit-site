import { type HotelSchema } from '../domain/hotels';
import { type PageSchema } from '../domain/pages';
import { type PlaceSchema } from '../domain/places';
import { type RestaurantSchema } from '../domain/restaurants';
import { getSiteSettings, type SiteSettingsSchema } from './site-settings';
import type { DirectusRequestBody } from '../infrastructure/directus/utils';
import { filter, head, includes, isNil, keys, pipe } from 'ramda';
import { CATEGORIES_MAP } from '$env/static/private';
import { say } from '$lib/core/utils';
import { getSections, type SectionSchema } from '../domain/sections';
import { getPage } from '../domain/pages';
import { getHotel } from '../domain/hotels';
import { getRestaurant } from '../domain/restaurants';
import { getPlace } from '../domain/places';
import { getPublishedTours } from '../domain/tours';
import { getPublishedPackages } from '../domain/packages';
import { getPublishedTransportation } from '../domain/transportation';

type KeyToTypeMap = {
	'site-settings': SiteSettingsSchema;
	page: PageSchema;
	sections: SectionSchema[];
	stopover_hotels: HotelSchema;
	stopover_restaurants: RestaurantSchema;
	stopover_place_to_visit: PlaceSchema;
};

type DirectusDataKeys = keyof KeyToTypeMap;

const keyToDataMap: Record<
	DirectusDataKeys,
	(body: DirectusRequestBody) => Promise<KeyToTypeMap[DirectusDataKeys] | null>
> = {
	'site-settings': getSiteSettings,
	page: getPage,
	sections: getSections,
	stopover_hotels: getHotel,
	stopover_restaurants: getRestaurant,
	stopover_place_to_visit: getPlace,
	stopover_tour: getPublishedTours,
	stopover_package: getPublishedPackages,
	stopover_transportation: getPublishedTransportation
} as const;

const isDirectusDataKey = (value: unknown): value is DirectusDataKeys =>
	includes(value, keys(keyToDataMap));

const keymapFilter = (subCategory: string) => (value: string) => {
	return includes(subCategory, value);
};

const getKeyOfArticle = (
	subCategory: string,
	map: Record<DirectusDataKeys, string>
): DirectusDataKeys | unknown => pipe(filter(keymapFilter(subCategory)), keys, head)(map);

const articleToKeyMap = (
	subCategory: string | null,
	article: string | null
): DirectusDataKeys | null => {
	if (isNil(article) || isNil(subCategory)) return 'page';

	try {
		const keyMap = JSON.parse(CATEGORIES_MAP);

		const key = getKeyOfArticle(subCategory, keyMap);

		if (!key || typeof key !== 'string' || !isDirectusDataKey(key)) return 'page';

		return key;
	} catch (err) {
		say('An error ocurred while identifying the table to query', err);
		return null;
	}
};

const getData = async (key: DirectusDataKeys, body: DirectusRequestBody) => {
	const data = await keyToDataMap[key](body);
	return data;
};

export { articleToKeyMap, getData };

export type { KeyToTypeMap, DirectusDataKeys };
