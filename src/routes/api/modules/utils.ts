import { pagePathFields } from "$lib/directus/page";
import type { Schema } from "$lib/directus/schema";
import type { QueryItem } from "@directus/sdk";
import type { ModuleQueryParams } from ".";
import { isNotNil } from "ramda";

const promoOnlyFilter = { _or: [
    {
        promo_discount_amount: {
            _nnull: true
        }
    },
    {
        promo_discount_percent: {
            _nnull: true
        }
    }
]}


function buildQuery({maxItems, highlights, sorts, locale, promoOnly, pilar}: ModuleQueryParams): QueryItem<Schema, 'stopover_hotels'> {
    return {
        fields: [
            'main_image',
            'promo_discount_percent',
            'promo_discount_amount',
            { 'translations': ['name', 'path'] },
            { 'parent_page': pagePathFields},
        ],
        filter: {
            _and: [
              promoOnly ? promoOnlyFilter : undefined,
              highlights ? { highlight: {_eq: true } } : undefined,
              pilar ? { pilar: { _in: pilar } } : undefined,
            ].filter(v => isNotNil(v))
        },
        deep: {
            translations: {
                _filter: {
                    lang_code: {
                        _eq: locale
                    }
                }
            },
            parent_page: { 
                translations: { _filter: { languages_code:  { _eq: locale } } },
                parent: {
                    translations: { _filter: { languages_code:  { _eq: locale } } },
                    parent: {
                        translations: { _filter: { languages_code:  { _eq: locale } } },
                        parent: {
                            translations: { _filter: { languages_code:  { _eq: locale } } },                        
                        }                
                    }
                }
            },
        },
        sort: sorts,
        limit: maxItems
    }
}

export {
    buildQuery
}