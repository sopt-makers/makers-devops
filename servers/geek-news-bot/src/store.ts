import { redisClient } from "@makers-devops/redis";

const REDIS_KEY = "geek-news-state";
const MAX_RECENT_IDS = 100;

interface NewsState {
  lastPublishedAt: number;
  recentIds: string[];
}

const DEFAULT_STATE: NewsState = {
  lastPublishedAt: 0,
  recentIds: [],
};

export const loadStates = async (): Promise<NewsState> => {
  try {
    const raw = await redisClient.get<Record<string, unknown>>(REDIS_KEY);
    if (!raw) return DEFAULT_STATE;

    const lastPublishedAt =
      typeof raw.lastPublishedAt === "string"
        ? new Date(raw.lastPublishedAt).getTime() || 0
        : ((raw.lastPublishedAt as number) ?? 0);

    return {
      lastPublishedAt,
      recentIds: Array.isArray(raw.recentIds) ? raw.recentIds : [],
    };
  } catch (error) {
    console.error("[store] Redis 조회 실패:", error);
    return DEFAULT_STATE;
  }
};

export const saveStates = async (lastPublishedAt: number, ids: string[]) => {
  /** MAX_RECENT_IDS 개수만 유지 */
  const state: NewsState = {
    lastPublishedAt,
    recentIds: ids.slice(-MAX_RECENT_IDS),
  };

  try {
    await redisClient.set(REDIS_KEY, state);
  } catch (error) {
    console.error("[store] Redis 저장 실패 — 다음 실행 시 중복 알림이 발생할 수 있습니다:", error);
    throw error;
  }
};
