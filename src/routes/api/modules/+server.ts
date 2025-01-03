import { getItems } from '$lib/directus/utils.js'
import { error, json } from '@sveltejs/kit'
import { buildQuery } from './utils.js'
import type { Schema } from '$lib/directus/schema.js'
import type { ModuleQueryParams } from './index.js'
import { isEmpty, isNotNil } from 'ramda'
import { ENVIRONMENT } from '$env/static/private'
import { PRODUCTION_ENVIRONMENT } from '$env/static/private'
import { PREVIEW_SECRET } from '$env/static/private'
import { getRedisKey } from '$lib/data/index.js'
import { getData as getDataFromRedis, setData as saveDataToRedis } from '$lib/redis'

export async function GET({ url : { searchParams } }) {
    const locale = searchParams.get('locale')
    const collection = searchParams.get('collection')

    if (!locale || !collection)
        return error(400, { message: 'bad request' })

    const collectionMap: Record<string, keyof Schema> = {
      hotels: 'stopover_hotels',
      restaurants: 'stopover_restaurants',
      activities: 'stopover_place_to_visit',
      tours: 'stopover_tours',
      packages: 'stopover_package',
      transportation: 'stopover_transportation'
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
    
    const redisKey = getRedisKey(ENVIRONMENT,'module', {collection: collection, maxItems, promoOnly, highlights, locale, pilar: pilar?.join('')})

    if(ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(preview === PREVIEW_SECRET)) {
      const data = await getDataFromRedis(redisKey)
  
      if (isNotNil(data) && !isEmpty(data)){
        console.warn('using data from Upstash', 'module', collection)
        return json(data)
      }
    }

    console.log('getting data from directus', 'module', collection)
    
    const items = await getItems( collectionMap[collection], buildQuery(params),  preview )

    if(isNotNil(items) && !isEmpty(items) && ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(preview === PREVIEW_SECRET))
      saveDataToRedis(redisKey, items, 60*60*2 ).catch(error => console.log(error))
    console.log('getting data from directus', 'module', collection) */
    
    const items = await getItems( collectionMap[collection], buildQuery(params),  preview )

    if(isNotNil(items) && !isEmpty(items) && ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(preview === PREVIEW_SECRET))
      saveDataToRedis(redisKey, items, 60*60*2 ).catch(error => console.log(error))
    
    if (!items)
        return error(404, { message: 'not found'})
    
    return json(items)
}