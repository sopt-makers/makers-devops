import "dotenv/config";
import { describe, it, expect } from "vitest";
import { fetchGeekNews } from "../rss";
import { mockNewsItems } from "./data";
import { filterFrontendNews } from "../filter";
import { sendSlackNotification } from "../slack";

const hasValidGoogleKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const FRONTEND_MOCK_IDS = new Set(["mock-1", "mock-3", "mock-5"]);

describe("geek-news-bot 파이프라인 통합 테스트", () => {
  it("GeekNews RSS에서 뉴스를 정상적으로 패치한다", async () => {
    const items = await fetchGeekNews();

    expect(items.length).toBeGreaterThan(0);

    for (const item of items) {
      expect(item.title).toBeTruthy();
      expect(item.link).toBeTruthy();
    }

    console.log(`[RSS] ${items.length}건 패치 완료`);
    console.log(`[RSS] 첫 번째 항목: ${items[0].title}`);
  }, 10_000);

  it.skipIf(!hasValidGoogleKey)(
    "AI 필터링이 관련 뉴스를 올바르게 분류한다",
    async () => {
      const filtered = await filterFrontendNews(mockNewsItems);

      expect(filtered).toBeDefined();
      expect(Array.isArray(filtered)).toBe(true);
      expect(filtered.length).toBeGreaterThan(0);

      for (const item of filtered) {
        expect(item.reason).toBeTruthy();
        expect(item.title).toBeTruthy();
        expect(FRONTEND_MOCK_IDS.has(item.id)).toBe(true);
      }

      const filteredIds = new Set(filtered.map((item) => item.id));
      expect(filteredIds.has("mock-2")).toBe(false);
      expect(filteredIds.has("mock-4")).toBe(false);

      console.log(`[AI 필터] ${mockNewsItems.length}건 중 ${filtered.length}건 선별`);
      for (const item of filtered) {
        console.log(`  - [선별] ${item.title}: ${item.reason}`);
      }
    },
    30_000,
  );

  it.skipIf(!hasValidGoogleKey)(
    "전체 파이프라인: mock 뉴스 → AI 필터링 → 슬랙 전송",
    async () => {
      const filtered = await filterFrontendNews(mockNewsItems);

      console.log(`[파이프라인] ${mockNewsItems.length}건 중 ${filtered.length}건 프론트엔드 관련 뉴스 선별`);

      expect(filtered.length).toBeGreaterThan(0);

      await sendSlackNotification(filtered);
      console.log("[파이프라인] 슬랙 전송 완료");
    },
    60_000,
  );
});
