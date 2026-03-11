import { Redis } from "@upstash/redis";
import type { RedisStorage } from "./types";

export const createRedisStorage = (): RedisStorage => {
  let redisInstance: Redis | null = null;

  return {
    register: (config) => {
      if (redisInstance) {
        console.warn("Redis instance already registered");
        return;
      }

      redisInstance = new Redis({
        url: config.url,
        token: config.token,
        retry: {
          retries: config.retry ?? 5,
        },
      });
    },
    get: (key) => {
      if (!redisInstance) {
        throw new Error("Redis instance is not set");
      }

      return redisInstance.get(key);
    },
    set: (key, value, options) => {
      if (!redisInstance) {
        throw new Error("Redis instance is not set");
      }

      return redisInstance.set(key, value, options);
    },
    delete: (key) => {
      if (!redisInstance) {
        throw new Error("Redis instance is not set");
      }

      return redisInstance.del(key);
    },
  };
};
