import type { SetCommandOptions } from "@upstash/redis";

export type RedisClient = {
  get: <T = string>(key: string) => Promise<T | null>;
  set: <T = string>(key: string, value: T, options?: SetCommandOptions) => Promise<T | "OK" | null>;
  delete: (key: string) => Promise<number>;
};
