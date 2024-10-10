import { isNil } from "ramda"
import { pagePathFields } from "./page"
import { getItems, type DirectusRequestBody } from "./utils"
import { say } from "$lib/utils"
import { isRestaurantSchema, restaurantSchema } from "./restaurants"

const getRestaurantQuery = ({locale, category, subCategory, article}: DirectusRequestBody): QueryItem<Schema, 'stopover_restaurants'> => ({
  fields: [
    'main_image',
    'promo_code',
    'promo_discount_amount',
    'promo_discount_percent',
    'whatsapp',
    'supported_languages',
    'type',
    'meals',
    'cuisines',
    'location',
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
    { 'parent_page': pagePathFields }
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

const getRestaurant = async (filters: DirectusRequestBody) => {
  const { article, locale } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the hotel', filters)
    return null
  }

  if (!locale){
    say('Locale is required', filters)
    return null
  }

  const directusRestaurantRequest = await getItems('stopover_restaurants', getRestaurantQuery(filters), filters.preview)

  if(isNil(directusRestaurantRequest))
    return null

  if(directusRestaurantRequest.length > 1) {
    say('Query returned more than one result, review is required', directusRestaurantRequest.map(value => value.translations?.[0]?.name))
    return null
  }

  const [restaurant] = directusRestaurantRequest

  if(!isRestaurantSchema(restaurant)) {
    say('Restaurant does not match the schema', {result: restaurant, errors: restaurantSchema.safeParse(restaurant).error})
    return null
  }

  return restaurant
}

export {
  getRestaurant
}