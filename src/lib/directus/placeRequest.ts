import { say } from "$lib/utils"
import { isNil } from "ramda"
import { textContentQuery } from "./text-content"
import { getItems, type DirectusRequestBody } from "./utils"
import { isPlaceSchema, placeSchema } from "./place-to-visit"
import { pagePathFields } from "./page"

const getPlace = async ({locale, category, subCategory, article, preview }: DirectusRequestBody) => {

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the place to visit', article)
    return null
  }

  const directusPlaceRequest = await getItems('stopover_place_to_visit', {
    fields: [
      'main_image',
      'promo_code',
      'promo_discount_amount',
      'promo_discount_percent',
      'supported_languages',
      'duration',
      'pilar',
      'category',
      'location',
      'use_name',
      { 'experiences': [{ 'Text_Content_id': textContentQuery}] },
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
  }, preview)

  if(isNil(directusPlaceRequest))
    return null

  if(directusPlaceRequest.length > 1) {
    say('Query returned more than one result, review is required', directusPlaceRequest.map(value => value.translations?.[0].name))
    return null
  }

  const [place] = directusPlaceRequest

  if(!isPlaceSchema(place)) {
    say('Place to visit does not match the schema', placeSchema.safeParse(place).error)
    return null
  }

  return place
}

export {
  getPlace
}