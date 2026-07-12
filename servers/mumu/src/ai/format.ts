import type { UxReviewResult } from "./ux-review";

const SEVERITY_EMOJI: Record<UxReviewResult["findings"][number]["severity"], string> = {
  policy: "🚨",
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

const VERDICT_LABEL: Record<UxReviewResult["verdict"], string> = {
  pass: "통과",
  warn: "주의",
  fail: "수정 필요",
};

/** UX 리뷰 결과를 Slack mrkdwn 문자열로 변환한다. */
export const formatUxReviewForSlack = (result: UxReviewResult): string => {
  const lines: string[] = [
    `*UX Writing 리뷰 결과: ${VERDICT_LABEL[result.verdict]}*`,
    "",
    `*대상:* \`${result.applies_to}\`${result.inferred ? " (추론)" : ""}`,
    `*위험도:* \`${result.risk_level}\` — ${result.risk_reason}`,
  ];

  if (result.findings.length > 0) {
    lines.push("", "*개선 포인트*");
    for (const finding of result.findings) {
      lines.push(
        `${SEVERITY_EMOJI[finding.severity]} *${finding.rule_id}* · \`${finding.span}\``,
        `> ${finding.message}`,
        finding.suggestion.trim() === "" ? "> ↳ 제안 없음" : `> ↳ ${finding.suggestion}`,
      );
    }
  } else {
    lines.push("", "가이드 기준으로 명확한 위반을 찾지 못했어요.");
  }

  if (result.revised.trim() !== "") {
    lines.push("", "*개선안*", `> ${result.revised.replace(/\n/g, "\n> ")}`);
  }

  return lines.join("\n");
};
