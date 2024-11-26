import type { QueryItem } from "@directus/sdk"
import { getItems, type DirectusRequestBody } from "../utils"
import type { Schema } from "../schema"
import { pagePathFields } from "../page"
import { isValidArticlePath, isValidateDirectusResponse } from "./utils"
import { tourSchema } from "../schemas/tours"

// TODO complete query
const getTourQuery = ({ locale, category, subCategory, article }: DirectusRequestBody): QueryItem<Schema, 'stopover_tours'> => ({
    fields: [
        'main_image',
        'promo_code',
        'promo_discount_amount',
        'promo_discount_percent',
        { 'gallery': ['directus_files_id', 'sort'] },
        { 'parent_page': pagePathFields },
        {
            'translations': [

            ]
        }
    ],
    filter: {
        _and: [
            { translations: { lang_code: { _eq: locale } } },
            { translations: { path: { _eq: article } } },
            { parent_page: { translations: { languages_code: { _eq: locale } } } },
            { parent_page: { translations: { path: { _eq: subCategory } } } },
            { parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } },
            { parent_page: { parent: { translations: { path: { _eq: category } } } } },
            { parent_page: { parent: { parent: { translations: { languages_code: { _eq: locale } } } } } },
            { parent_page: { parent: { parent: { translations: { path: { _eq: locale } } } } } },
        ]
    }
})

const getTours = async (filters: DirectusRequestBody) =>  {

    const { preview } = filters

    if(!isValidArticlePath(filters))
        return null

    const request = await Promise.all([
        getItems('stopover_tours', getTourQuery(filters), preview)
    ])

    const [tour] = request 

    if (isValidateDirectusResponse(tour, tourSchema))
        return {tour}

    return null
}

export {
    getTours
}