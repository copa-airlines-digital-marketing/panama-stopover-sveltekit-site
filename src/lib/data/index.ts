import { getData as getDataFromDirectus, type DirectusDataKeys } from "$lib/directus"
import { getData as getDataFromRedis, setData as saveDataToRedis } from "$lib/redis"
import { isEmpty, isNotEmpty, isNotNil } from "ramda"

const getDataFromDirectusAndSaveToRedis = (key: DirectusDataKeys, id?: string) => {
  const data = getDataFromDirectus( key, id )

  saveDataToRedis( key, data, 60*60*2 )

  return data
} 

const getData = async(key: DirectusDataKeys, id?: string) => {
  const data = await getDataFromRedis(key)

  if ( isNotNil(data) && isNotEmpty(data) )
    return JSON.parse(data)

  if ( !data || isEmpty(data) ) 
   return getDataFromDirectusAndSaveToRedis(key, id)

}

exprot 