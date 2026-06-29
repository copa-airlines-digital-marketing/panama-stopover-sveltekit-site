import { type HotelSchema } from './hotels';
import { type PageSchema } from './page';
import { type PlaceSchema } from './place-to-visit';
import { type RestaurantSchema } from './restaurants';
import { getSiteSettings, type SiteSettingsSchema } from './site-settings';
import type { DirectusRequestBody } from '../infrastructure/directus/utils';
import { filter, head, includes, isNil, keys, pipe } from 'ramda';
import { CATEGORIES_MAP } from '$env/static/private';
import { say } from '$lib/core/utils';
import { getSections, type SectionSchema } from '../domain/sections';
import { getPage } from './pageRequest';
import { getHotel } from './hotelRequests';
import { getRestaurant } from './restaurantRequest';
import { getPlace } from './placeRequest';
import { getPublishedTours } from './tours';
import { getPublishedPackages } from './package';
import { getPublishedTransportation } from './transportation';

type KeyToTypeMap = {
	'site-settings': SiteSettingsSchema;
	page: PageSchema;
	sections: SectionSchema[];
	stopover_hotels: NonNullable<Awaited<ReturnType<typeof getHotel>>>;
	stopover_restaurants: RestaurantSchema;
	stopover_place_to_visit: PlaceSchema;
	stopover_tour: NonNullable<Awaited<ReturnType<typeof getPublishedTours>>>;
	stopover_package: NonNullable<Awaited<ReturnType<typeof getPublishedPackages>>>;
	stopover_transportation: NonNullable<Awaited<ReturnType<typeof getPublishedTransportation>>>;
};

type DirectusDataKeys = keyof KeyToTypeMap;

const keyToDataMap: { [Key in DirectusDataKeys]: (body: DirectusRequestBody) => Promise<KeyToTypeMap[Key] | null> } = {
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

const getData = async <Key extends DirectusDataKeys>(key: Key, body: DirectusRequestBody) => {
	const data = await keyToDataMap[key](body);
	return data;
};

export { articleToKeyMap, getData };

export type { KeyToTypeMap, DirectusDataKeys };
