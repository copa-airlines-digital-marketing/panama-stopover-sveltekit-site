import { ENVIRONMENT, PREVIEW_SECRET, PRODUCTION_ENVIRONMENT } from "$env/static/private"
import { getData as getDataFromDirectus, keyToValidationMap, type DirectusDataKeys, type KeyToTypeMap } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isNotEmpty, isNotNil, join } from "ramda"

type RequestBody = Record<string, string | number | undefined | null>

const getRedisKey = (environment: string,key: string, body: RequestBody) => {
  if (!body)
    return key

  return [environment,key,Object.entries(body).filter(prop => !prop.includes('preview')).map(join(':')).join('|')].join(';')
}

const getDataFromDirectusAndSaveToRedis = async <T extends DirectusDataKeys>(key: T, timeToExpireInSeconds: number, body: RequestBody): Promise<KeyToTypeMap[T] | null> => {
  const data = await getDataFromDirectus( key, body )

  if(isNotNil(data) && isNotEmpty(data) && ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(body?.preview === PREVIEW_SECRET))
    saveDataToRedis( getRedisKey(ENVIRONMENT,key, body), data, timeToExpireInSeconds ).catch(error => console.log(error))

  return data
} 

const getData = async<T extends DirectusDataKeys>(key: T, timeToExpireInSeconds: number, body: RequestBody): Promise<KeyToTypeMap[T] | null> => {
  if(ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(body?.preview === PREVIEW_SECRET)) {
    const data = await getDataFromRedis(getRedisKey(ENVIRONMENT,key, body))

    if (keyToValidationMap[key](data))
      return data
  }

  return getDataFromDirectusAndSaveToRedis(key, timeToExpireInSeconds, body)
}

export {
  getData
}