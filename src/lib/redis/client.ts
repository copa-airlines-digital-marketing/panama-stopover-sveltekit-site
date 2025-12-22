import { Redis } from "@upstash/redis"

const createRedisClient = (url: string, token: string) => new Redis({url, token})

export {
  createRedisClient
}