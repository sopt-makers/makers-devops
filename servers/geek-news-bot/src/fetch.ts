import { fetchGeekNews } from "./rss";
import { filterFrontendNews } from "./filter";
import { sendSlackNotification } from "./slack";
import { loadStates, saveStates } from "./store";
import { ENV } from "./env";

const toTimestamp = (dateStr: string): number => {
  const ms = new Date(dateStr).getTime();
  return Number.isNaN(ms) ? 0 : ms;
};

export const runNewsJob = async () => {
  console.log(`[${new Date().toISOString()}] 긱뉴스 패치 시작`);

  const allNews = await fetchGeekNews();
  console.log(`긱뉴스 RSS에서 ${allNews.length}건의 뉴스를 패치했습니다`);

  const state = await loadStates();
  const recentIdSet = new Set(state.recentIds);

  const newItems = allNews
    .filter((item) => {
      const itemTs = toTimestamp(item.pubDate);

      /**
       * 타임스탬프 기반 중복 필터링
       * - lastPublishedAt보다 오래된 뉴스는 이미 처리된 것으로 간주
       * - lastPublishedAt와 동일한 타임스탬프에 발행된 뉴스는 recentIds로 중복 체크
       */
      if (state.lastPublishedAt && itemTs <= state.lastPublishedAt) {
        if (itemTs === state.lastPublishedAt) {
          return !recentIdSet.has(item.id);
        }
        return false;
      }
      return true;
    })
    .slice(0, ENV.maxNewsPerFetch);

  if (newItems.length === 0) {
    console.log("새로운 뉴스가 없습니다.");
    return;
  }

  const frontendNews = await filterFrontendNews(newItems);

  /** 다음 실행의 중복 방지를 위해 처리된 뉴스 ID를 누적 */
  const allProcessedIds = [...state.recentIds, ...newItems.map((item) => item.id)];
  /** 최신 발생 시간 타임스탬프 기준 최신화 */
  const latestTimestamp = newItems.reduce(
    (latest, item) => Math.max(latest, toTimestamp(item.pubDate)),
    state.lastPublishedAt,
  );

  await saveStates(latestTimestamp, allProcessedIds);

  await sendSlackNotification(frontendNews);
  console.log(`[${new Date().toISOString()}] 작업 완료`);
};
