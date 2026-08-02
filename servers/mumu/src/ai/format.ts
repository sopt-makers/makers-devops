import type { UxReviewResult } from "./ux-review";

const VERDICT_LABEL: Record<UxReviewResult["verdict"], string> = {
  pass: "✅ 통과",
  warn: "⚠️ 수정 권장",
  fail: "🚫 수정 필요",
  needs_context: "❓ 맥락 확인이 필요해요",
};

const RISK_LABEL: Record<UxReviewResult["conditional"][number]["risk"], string> = {
  low: "낮은 위험",
  medium: "중간 위험",
  high: "높은 위험",
};

/** UX 리뷰 결과를 Slack mrkdwn 문자열로 변환한다. */
export const formatUxReviewForSlack = (result: UxReviewResult): string => {
  const lines: string[] = [VERDICT_LABEL[result.verdict]];
  const sentenceCount = result.input
    .split(/(?:[.!?]+\s*|\n+)/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;

  if (result.verdict !== "needs_context" && result.revised.trim() !== "") {
    lines.push("", "*수정안*", result.revised);
  }

  if (result.findings.length > 0) {
    lines.push("", "*지적 사항*");

    for (const finding of result.findings) {
      const sentencePrefix = sentenceCount > 1 ? `${finding.sentence_index}번째 문장 ` : "";
      const suggestion = finding.suggestion.trim() === "" ? "" : ` → \`${finding.suggestion}\``;

      lines.push(
        `• ${sentencePrefix}\`${finding.span}\`${suggestion}  [${finding.rule_id} · ${finding.severity}]`,
        `  ${finding.message}`,
      );
    }
  }

  if (result.conditional.length > 0) {
    lines.push("", "*맥락 확인*");

    for (const item of result.conditional) {
      lines.push(`• ${item.condition}`, `  → ${item.suggestion}  (${RISK_LABEL[item.risk]} · ${item.expected_tone})`);
    }
  }

  if (result.out_of_scope_notes.length > 0) {
    lines.push("", "―――――――――", "*규칙 외 참고* (가이드에 규칙이 없는 항목이에요)");

    for (const item of result.out_of_scope_notes) {
      lines.push(`• \`${item.span}\``, `  ${item.note}`, `  ${item.opinion}`);
    }
  }

  return lines.join("\n");
};
