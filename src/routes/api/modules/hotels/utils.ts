import { pagePathFields } from "$lib/directus/page";
import type { Schema } from "$lib/directus/schema";
import type { QueryItem } from "@directus/sdk";

function buildQuery(maxItems: number, highlights: boolean, sorts: string[], locale: string): QueryItem<Schema, 'stopover_hotels'> {
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
                { _or: [
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
                ]},
            ].concat( [highlights ? { highlight: {_eq: true } } : {}] )
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