import { ENVIRONMENT, PREVIEW_SECRET, PRODUCTION_ENVIRONMENT } from "$env/static/private"
import { getData as getDataFromDirectus, keyToValidationMap, type DirectusDataKeys, type KeyToTypeMap } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isNotEmpty, isNotNil, join, keysIn } from "ramda"

type RequestBody = Record<string, string | number | boolean | undefined | null>

const getRedisKey = (environment: string,key: string, body: RequestBody) => {
  if (!body)
    return key

  return [environment,key,Object.entries(body).filter(prop => !prop.includes('preview')).map(join(':')).join('|')].join(';')
}

const getDataFromDirectusAndSaveToRedis = async <T extends DirectusDataKeys>(key: T, timeToExpireInSeconds: number, body: RequestBody): Promise<KeyToTypeMap[T] | null> => {
  const data = await getDataFromDirectus( key, body )

  console.log('data', key, JSON.stringify(body))

  console.log('condition to save to redis', isNotNil(data), isNotEmpty(data), ENVIRONMENT === PRODUCTION_ENVIRONMENT, !(body?.preview === PREVIEW_SECRET))

  if(isNotNil(data) && isNotEmpty(data) && ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(body?.preview === PREVIEW_SECRET))
    saveDataToRedis( getRedisKey(ENVIRONMENT,key, body), data, timeToExpireInSeconds )
      .then(() => console.log('saved to redis'))
      .catch(error => console.log(error))
 
  return data
} 

const getData = async<T extends DirectusDataKeys>(key: T, timeToExpireInSeconds: number, body: RequestBody): Promise<KeyToTypeMap[T] | null> => {
  console.log('view first condition', ENVIRONMENT === PRODUCTION_ENVIRONMENT, !(body?.preview === PREVIEW_SECRET))

  if(ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(body?.preview === PREVIEW_SECRET)) {
    const data = await getDataFromRedis(getRedisKey(ENVIRONMENT,key, body))

    console.log('view second condition', keyToValidationMap[key](data), key, isNotNil(data), isNotEmpty(data))

    if (keyToValidationMap[key](data)){
      console.log('using data from Upstash', key, JSON.stringify(body))
      return data
    }
  }

  console.log('getting data from directus', key, JSON.stringify(body))

  return getDataFromDirectusAndSaveToRedis(key, timeToExpireInSeconds, body)
}

export type {
   RequestBody
}

export {
  getRedisKey,
  getData
}