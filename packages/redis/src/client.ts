import { Redis } from "@upstash/redis";
import type { RedisClient } from "./types";

export const createRedisClient = (): RedisClient => {
  const redisInstance = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return {
    get: (key) => redisInstance.get(key),
    set: (key, value, options) => redisInstance.set(key, value, options),
    delete: (key) => redisInstance.del(key),
  };
};

export const redisClient = createRedisClient();
