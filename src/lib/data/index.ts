import { getData as getDataFromDirectus, type DirectusDataKeys } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isNotEmpty, isNotNil } from "ramda"

const getDataFromDirectusAndSaveToRedis = (key: DirectusDataKeys, timeToExpireInSeconds: number, id?: string) => {
  const data = getDataFromDirectus( key, id )

  saveDataToRedis( key, data, timeToExpireInSeconds ).catch(error => console.log(error))

  return data
} 

const getData = async(key: DirectusDataKeys, timeToExpireInSeconds: number, id?: string) => {
  const data = await getDataFromRedis(key)

  if ( isNotNil(data) && isNotEmpty(data) )
    return JSON.parse(data)

return getDataFromDirectusAndSaveToRedis(key, timeToExpireInSeconds, id)
}

export {
  getData
}