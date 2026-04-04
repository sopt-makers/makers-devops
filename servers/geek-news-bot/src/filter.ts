import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import dedent from "dedent";
import type { GeekNewsItem } from "./rss";

const FilterResultSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      isRelevant: z.boolean(),
      reason: z.string(),
    }),
  ),
});

export interface FilteredNewsItem extends GeekNewsItem {
  reason: string;
}

export const filterFrontendNews = async (items: GeekNewsItem[]): Promise<FilteredNewsItem[]> => {
  if (items.length === 0) return [];

  const newsList = items.map((item) => `- [${item.id}] ${item.title}: ${item.content.slice(0, 200)}`).join("\n");

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: FilterResultSchema,
    prompt: dedent`
      당신은 프론트엔드 개발자 Slack 채널의 뉴스 큐레이터입니다.

      아래 GeekNews 기사들을 분석하여 프론트엔드 개발자에게 관련 있는 기사를 판별해주세요.

      관련 있는 주제 (우선순위 높음 → 낮음):
      - [최우선] AI/LLM 관련: AI 코딩 어시스턴트, LLM 기반 개발 도구, AI SDK, 프론트엔드에서의 AI 활용 (on-device AI, WebGPU, AI UX 패턴 등), MCP, AI 에이전트, 주요 AI 모델 출시/업데이트
      - [최우선] AI와 개발 생산성: Copilot, Cursor, v0, Vercel AI SDK 등 AI 기반 DX 도구, 프롬프트 엔지니어링, AI 코드 리뷰
      - JavaScript, TypeScript 및 관련 생태계
      - React, Vue, Svelte, Angular, Next.js, Nuxt, Astro 등 프론트엔드 프레임워크
      - CSS, HTML, Web API, 브라우저 기술
      - 프론트엔드 도구 (번들러, 린터, 테스트 도구: Vite, Webpack, ESLint, Biome, Playwright 등)
      - UI/UX 디자인 시스템, 웹 접근성(a11y)
      - 웹 성능 최적화
      - 프론트엔드 아키텍처 패턴
      - Node.js / Deno / Bun 런타임 업데이트 (프론트엔드와 관련된 경우)
      - 개발자 경험(DX) 도구 및 워크플로우
      - 주요 테크 기업의 프론트엔드 관련 엔지니어링 블로그 포스트

      관련 없는 주제:
      - 순수 백엔드/인프라 주제 (데이터베이스, Kubernetes, 클라우드 운영)
      - 크로스 플랫폼(React Native, Flutter)이 아닌 모바일 네이티브 개발 (Swift, Kotlin)
      - 하드웨어, 보안 취약점, 순수 데이터 과학/ML 연구
      - 기술적 내용이 없는 비즈니스/스타트업 뉴스

      뉴스 기사 목록:
      ${newsList}

      각 기사에 대해 isRelevant를 true/false로 설정하고, 간결한 한국어 사유를 작성해주세요.
    `,
  });

  const relevantIds = new Set(object.results.filter((r) => r.isRelevant).map((r) => r.id));
  const reasonMap = new Map(object.results.map((r) => [r.id, r.reason]));

  return items
    .filter((item) => relevantIds.has(item.id))
    .map((item) => ({
      ...item,
      reason: reasonMap.get(item.id) ?? "",
    }));
};
