import type { HotelSchema } from '$lib/directus/hotels.js';
import { isNotFoundSchema } from '$lib/directus/not-found.js';
import type { PageSchema } from '$lib/directus/page.js';
import type { PlaceSchema } from '$lib/directus/place-to-visit.js';
import type { RestaurantSchema } from '$lib/directus/restaurants.js';
import type { SectionSchema } from '$lib/directus/section.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';
import { filter, isNotNil } from 'ramda';

const valueToSeachParams = (locale: string, path: string, preview: string | null) => {
  const [category, subcategory, article] = path.split('/')
  const preliminarObject = {
    locale,
    category,
    subcategory,
    article,
    preview
  }
  return filter(isNotNil, preliminarObject)
}

type DataTypeMap = {
  page: PageSchema | undefined,
  pageSections: SectionSchema[] | undefined,
  stopover_hotels: HotelSchema | undefined,
  stopover_restaurants: RestaurantSchema | undefined,
  stopover_place_to_visit: PlaceSchema | undefined
}

export async function load(event) {
  const { fetch, locals: { locale }, parent, params: { path } , route, url: { searchParams } }  = event

  if(!path) {
    say('Path param is required', event)
    return error(404)
  }

  if(!locale) {
    say('No locale in locals', event)
    return error(500)
  }

  const preview = searchParams.get('preview')

  const queryParams = new URLSearchParams(valueToSeachParams(locale, path, preview)) 

  const pageRequest = await fetch(`/api/page${ queryParams.size > 1 ? '?' + queryParams.toString() : '' }`)
  const parentData = await parent()
  const pageData = await pageRequest.json()

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