import type { GeekNewsItem } from "../rss";

export const mockNewsItems: GeekNewsItem[] = [
  {
    id: "mock-1",
    title: "React 25 릴리즈 - React Compiler 정식 포함",
    link: "https://example.com/react-25",
    pubDate: "2026-04-01",
    content:
      "React 25가 정식 릴리즈되었습니다. React Compiler가 안정화되어 기본 포함되며, 자동 메모이제이션으로 성능이 크게 향상됩니다.",
  },
  {
    id: "mock-2",
    title: "PostgreSQL 18 출시 - 새로운 파티셔닝 전략",
    link: "https://example.com/postgresql-18",
    pubDate: "2026-04-01",
    content:
      "PostgreSQL 18이 출시되었습니다. 새로운 자동 파티셔닝 전략과 향상된 쿼리 플래너가 포함되어 대규모 데이터 처리 성능이 개선됩니다.",
  },
  {
    id: "mock-3",
    title: "Vite 7.0 발표 - Rolldown 기반 번들링 엔진",
    link: "https://example.com/vite-7",
    pubDate: "2026-04-02",
    content:
      "Vite 7.0이 발표되었습니다. Rolldown 기반의 새로운 번들링 엔진으로 빌드 속도가 10배 빨라졌으며, HMR 성능도 대폭 개선되었습니다.",
  },
  {
    id: "mock-4",
    title: "쿠버네티스 1.34 릴리즈 - Sidecar 컨테이너 GA",
    link: "https://example.com/k8s-134",
    pubDate: "2026-04-02",
    content: "Kubernetes 1.34가 릴리즈되었습니다. Sidecar 컨테이너가 GA되었고, 새로운 스케줄링 기능이 추가되었습니다.",
  },
  {
    id: "mock-5",
    title: "Cursor AI 에이전트 모드 업데이트 - 멀티파일 편집 강화",
    link: "https://example.com/cursor-agent",
    pubDate: "2026-04-03",
    content:
      "Cursor의 AI 에이전트 모드가 대폭 업데이트되었습니다. 멀티파일 동시 편집, 자동 테스트 생성 등 개발 생산성을 높이는 기능이 추가되었습니다.",
  },
];
