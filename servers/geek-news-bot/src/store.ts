import { redisClient } from "@makers-devops/redis";

const REDIS_KEY = "geek-news-state";

interface NewsState {
  lastPublishedAt: string;
  recentIds: string[];
}

const DEFAULT_STATE: NewsState = {
  lastPublishedAt: "",
  recentIds: [],
};

export const loadStates = async (): Promise<NewsState> => {
  try {
    const state = await redisClient.get<NewsState>(REDIS_KEY);
    return state ?? DEFAULT_STATE;
  } catch (error) {
    console.error("[store] Redis 조회 실패:", error);
    return DEFAULT_STATE;
  }
};

export const saveStates = async (lastPublishedAt: string, ids: string[]) => {
  const state: NewsState = {
    lastPublishedAt,
    recentIds: ids,
  };

  await redisClient.set(REDIS_KEY, state);
};
