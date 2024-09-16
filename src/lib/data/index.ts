import { ENVIRONMENT, PREVIEW_SECRET, PRODUCTION_ENVIRONMENT } from "$env/static/private"
import { getData as getDataFromDirectus, type DirectusDataKeys } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isNotEmpty, isNotNil } from "ramda"

type RequestBody = Record<string, string | number | undefined | null>

const getRedisKey = (key: string, body: RequestBody) => {
  if (!body)
    return key

  const {locale, home, category, subCategory, article } = body

  return `${key}${locale ? '-'+ locale : ''}${home ? '-home' : ''}${category ? '-'+category : ''}${subCategory ? '-'+subCategory : ''}${article ? '-'+article : ''}`
}

const getDataFromDirectusAndSaveToRedis = async (key: DirectusDataKeys, timeToExpireInSeconds: number, body: RequestBody) => {
  const data = await getDataFromDirectus( key, body )

  if(isNotNil(data) && isNotEmpty(data) && ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(body?.preview === PREVIEW_SECRET))
    saveDataToRedis( getRedisKey(key, body), data, timeToExpireInSeconds ).catch(error => console.log(error))

  return data
} 

const getData = async(key: DirectusDataKeys, timeToExpireInSeconds: number, body: RequestBody) => {
  if(ENVIRONMENT === PRODUCTION_ENVIRONMENT && !(body?.preview === PREVIEW_SECRET)) {
    const data = await getDataFromRedis(getRedisKey(key, body))

    if ( isNotNil(data) && isNotEmpty(data) )
      return data
  }

  return getDataFromDirectusAndSaveToRedis(key, timeToExpireInSeconds, body)
}

export {
  getData
}