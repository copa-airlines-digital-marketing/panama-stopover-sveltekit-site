import { getItems } from '$lib/directus/utils.js'
import { error, json } from '@sveltejs/kit'
import { buildQuery } from './utils.js'
import type { Schema } from '$lib/directus/schema.js'
import type { ModuleQueryParams } from './index.js'
import { isEmpty } from 'ramda'

export async function GET({ url : { searchParams } }) {
    const locale = searchParams.get('locale')
    const collection = searchParams.get('collection')

    if (!locale || !collection)
        return error(400, { message: 'bad request' })

    const collectionMap: Record<string, keyof Schema> = {
      hotels: 'stopover_hotels',
      restaurants: 'stopover_restaurants',
      activities: 'stopover_place_to_visit'
    }

    const preview = searchParams.get('preview')
    const maxItems = parseInt(searchParams.get('max-items') || '-1')
    const promoOnly = JSON.parse(searchParams.get('promo-only')?.toLocaleLowerCase() || 'false' )
    const highlights = JSON.parse(searchParams.get('highlights')?.toLocaleLowerCase() || 'false' )
    const sorts = searchParams.getAll('sort')
    const pilar = isEmpty(searchParams.getAll('pilar')) ? null : searchParams.getAll('pilar')

    const params: ModuleQueryParams = {
      maxItems,
      promoOnly,
      highlights,
      sorts,
      locale,
      pilar
    }
    
    const items = await getItems( collectionMap[collection], buildQuery(params),  preview )
    
    if (!items)
        return error(404, { message: 'not found'})
    
    return json(items)
}