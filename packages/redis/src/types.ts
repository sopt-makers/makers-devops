import type { SetCommandOptions } from "@upstash/redis";

export type RedisStorage = {
  register: (config: RedisConfig) => void;
  get: <T = string>(key: string) => Promise<T | null>;
  set: <T = string>(key: string, value: T, options?: SetCommandOptions) => Promise<T | "OK" | null>;
  delete: (key: string) => Promise<number>;
};

export type RedisConfig = {
  url: string;
  token: string;
  retry?: number;
};
