import { getPageData } from '$lib/data/page.js';
import type { HotelSchema } from '$lib/directus/hotels.js';
import { isNotFoundSchema } from '$lib/directus/not-found.js';
import type { PageSchema } from '$lib/directus/page.js';
import type { PlaceSchema } from '$lib/directus/place-to-visit.js';
import type { RestaurantSchema } from '$lib/directus/restaurants.js';
import type { SectionSchema } from '$lib/directus/section.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

type DataTypeMap = {
  page: PageSchema | undefined,
  pageSections: SectionSchema[] | undefined,
  stopover_hotels: HotelSchema | undefined,
  stopover_restaurants: RestaurantSchema | undefined,
  stopover_place_to_visit: PlaceSchema | undefined
}

export async function load(event) {
  const { locals: { locale }, parent, params: { path } , route, url: { searchParams } }  = event

  if(!path) {
    say('Path param is required', event)
    return error(404)
  }

  if(!locale) {
    say('No locale in locals', event)
    return error(500)
  }

  const preview = searchParams.get('preview')

  const [category, subCategory, article] = path.split('/')

  const [pageData, parentData] = await Promise.all([getPageData({locale, preview, category, subCategory, article}), parent()])

  const { sections: pageSections } = pageData

  const finalData: DataTypeMap = {
    page: undefined,
    stopover_hotels: undefined,
    stopover_restaurants: undefined,
    stopover_place_to_visit: undefined,
    ...pageData,
    pageSections
  }

  if(isNotFoundSchema(pageData)) {
    say('Page requested not found', route)
    return error(404)
  }

  return {
    ...parentData,
    ...finalData
  }
}