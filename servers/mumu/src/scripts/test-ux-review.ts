import "dotenv/config";
import { assertNonNullish } from "@makers-devops/shared";
import { formatUxReviewForSlack, reviewUxWriting } from "../ai";

/**
 * UX Writing 리뷰 로직을 Slack 없이 단독으로 실행해보는 테스트 스크립트.
 *
 * 사용법:
 *   pnpm -F=@makers-devops/mumu test:ux
 *   pnpm -F=@makers-devops/mumu test:ux "결제 실패 화면에 '오류가 발생했습니다' 라고 띄우려는데 괜찮을까?"
 */

const DEFAULT_QUERY =
  "결제 실패 화면에 '오류가 발생했습니다. 다시 시도하세요.' 라고 띄우려는데 UX writing 관점에서 괜찮을까?";

const main = async () => {
  assertNonNullish(process.env.GEMINI_API_KEY, "GEMINI_API_KEY is not set");

  const query = process.argv.slice(2).join(" ").trim() || DEFAULT_QUERY;

  console.log("🟦 입력 질의\n", query, "\n");

  const result = await reviewUxWriting(query);

  console.log("🟩 구조화 결과 (raw)\n", JSON.stringify(result, null, 2), "\n");
  console.log("🟨 Slack 렌더링 미리보기\n");
  console.log(formatUxReviewForSlack(result));
};

main().catch((error) => {
  console.error("❌ 테스트 실행 실패:", error);
  process.exit(1);
});
