import { getData as getDataFromDirectus, type DirectusDataKeys } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isNotEmpty, isNotNil } from "ramda"

type RequestBody = Record<string, string | number | undefined | null>

const getRedisKey = (key: string, body?: RequestBody) => {
  if (!body)
    return key

  const {locale, category, subCategory, article } = body

  return `${key}${locale ? '-'+ locale : ''}${category ? '-'+subCategory : ''}${article ? '-'+article : ''}`
}

const getDataFromDirectusAndSaveToRedis = async (key: DirectusDataKeys, timeToExpireInSeconds: number, body?: RequestBody) => {
  const data = await getDataFromDirectus( key, body )

  if(isNotNil(data) && isNotEmpty(data))
    saveDataToRedis( getRedisKey(key, body), data, timeToExpireInSeconds ).catch(error => console.log(error))

  return data
} 

const getData = async(key: DirectusDataKeys, timeToExpireInSeconds: number, body?: RequestBody) => {
  const data = await getDataFromRedis(getRedisKey(key, body))

  if ( isNotNil(data) && isNotEmpty(data) )
    return data

  return getDataFromDirectusAndSaveToRedis(key, timeToExpireInSeconds, body)
}

export {
  getData
}