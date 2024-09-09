import { createRedisClient } from "./client"
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private'


const setData = ( key: string, data: unknown, timeToExpireInSeconds: number ) => {

  const client = createRedisClient( UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN )

  return client.set( key, data, { ex: timeToExpireInSeconds } )
}

const getData = ( key: string ) => {
  const client = createRedisClient( UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN )

  return client.get<string>( key )
}

export {
  getData,
  setData
}