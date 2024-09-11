import { getData as getDataFromDirectus, type DirectusDataKeys } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isNotEmpty, isNotNil } from "ramda"

type RequestBody = Record<string, string | number>

const getDataFromDirectusAndSaveToRedis = async (key: DirectusDataKeys, timeToExpireInSeconds: number, body: RequestBody, id?: string) => {
  const data = await getDataFromDirectus( key, body, id )

  if(isNotNil(data) && isNotEmpty(data))
    saveDataToRedis( key, data, timeToExpireInSeconds ).catch(error => console.log(error))

  return data
} 

const getData = async(key: DirectusDataKeys, body: RequestBody, timeToExpireInSeconds: number, id?: string) => {
  const data = await getDataFromRedis(key)

  if ( isNotNil(data) && isNotEmpty(data) )
    return data

  return getDataFromDirectusAndSaveToRedis(key, timeToExpireInSeconds, body, id)
}

export {
  getData
}