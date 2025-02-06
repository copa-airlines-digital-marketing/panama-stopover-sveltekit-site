import type { QueryItem } from "@directus/sdk"
import { pagePathFields } from "./page"
import { getItems, type DirectusRequestBody } from "./utils"
import type { Schema } from "zod"
import { say } from "$lib/utils"
import { getHotelAmenities } from "./hotel-amenities"
import { isNil } from "ramda"
import { hotelSchema, isHotelSchema } from "./hotels"

const getHotelQuery = ({locale, category, subCategory, article}: DirectusRequestBody): QueryItem<Schema, 'stopover_hotels'> => ({
  fields: [
    'main_image',
    'promo_code',
    'promo_discount_amount',
    'promo_discount_percent',
    'phone_number',
    'booking_email',
    'supported_languages',
    'includes',
    'stars',
    'location',
    'use_name',
    { 'gallery': ['directus_files_id', 'sort'] },
    { 'translations': [
      'lang_code',
      'name',
      'description',
      'url',
      'promo_name',
      'promo_description',
      'path'
    ]},
    { 'parent_page': pagePathFields}
  ],
  filter: {
    _and: [
      { translations: { lang_code: { _eq: locale } } },
      { translations: { path: { _eq: article} } },
      { parent_page: { translations: { languages_code: { _eq: locale } } } },
      { parent_page: { translations: { path: { _eq: subCategory } } } },
      { parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } },
      { parent_page: { parent: { translations: { path: { _eq: category } } } } },
      { parent_page: { parent: { parent: {translations: { languages_code: { _eq: locale } } } } } },
      { parent_page: { parent: { parent: {translations: { path: { _eq: locale } } } } } },
    ]
  },
})

const getHotel = async (filters: DirectusRequestBody) => {
  const { article, locale } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the hotel', filters)
    return null
  }

  if (!locale){
    say('Locale is required', filters)
    return null
  }

  const requests = await Promise.all([
    getItems('stopover_hotels', getHotelQuery(filters), filters.preview),
    getHotelAmenities(filters)
  ])
  
  const [directusHotelRequest, amenities ] = requests

  if(isNil(directusHotelRequest))
    return null
  
  if(directusHotelRequest.length > 1) {
    say('Query returned more than one result, review is required', directusHotelRequest.map(value => value.translations[0].name))
    return null
  }

  const [hotel] = directusHotelRequest

  if(!isHotelSchema(hotel)) {
    say('Hotel does not match the schema', hotelSchema.safeParse(hotel).error)
    return null
  }

  return {hotel, amenities}
}

export { 
  getHotel
}