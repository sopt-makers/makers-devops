import { fetchGeekNews } from "./rss";
import { filterFrontendNews } from "./filter";
import { sendSlackNotification } from "./slack";
import { loadStates, saveStates } from "./store";
import { ENV } from "./env";

export const runNewsJob = async () => {
  console.log(`[${new Date().toISOString()}] 긱뉴스 패치 시작`);

  const allNews = await fetchGeekNews();
  console.log(`긱뉴스 RSS에서 ${allNews.length}건의 뉴스를 패치했습니다`);

  const state = await loadStates();
  const recentIdSet = new Set(state.recentIds);

  const newItems = allNews
    .filter((item) => {
      /** 타임스탬프 기반 필터링 */
      if (state.lastPublishedAt && item.pubDate <= state.lastPublishedAt) {
        /** 동일 시각 발행 뉴스는 ID로 중복 체크 */
        if (item.pubDate === state.lastPublishedAt) {
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

  /** AI 필터링 */
  const frontendNews = await filterFrontendNews(newItems);

  await sendSlackNotification(frontendNews);

  const allProcessedIds = [...state.recentIds, ...newItems.map((item) => item.id)];
  const latestPubDate = newItems.reduce(
    (latest, item) => (item.pubDate > latest ? item.pubDate : latest),
    state.lastPublishedAt,
  );
  await saveStates(latestPubDate, allProcessedIds);

  console.log(`[${new Date().toISOString()}] 작업 완료`);
};
