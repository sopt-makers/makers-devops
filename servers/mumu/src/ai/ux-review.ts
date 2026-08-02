import { Type } from "@google/genai";
import { z } from "zod";
import { GEMINI_MODEL, geminiClient } from "./client";
import { buildUxWritingInstruction } from "./instructions/ux-writing";

const severitySchema = z.enum(["policy", "high", "medium", "low"]);
const verdictSchema = z.enum(["pass", "warn", "fail", "needs_context"]);
const riskLevelSchema = z.enum(["low", "medium", "high", "unknown"]);

const uxReviewFindingSchema = z.object({
  rule_id: z.string(),
  severity: severitySchema,
  sentence_index: z.number().int().positive(),
  span: z.string(),
  message: z.string(),
  suggestion: z.string(),
});

const uxReviewConditionalSchema = z.object({
  condition: z.string(),
  risk: riskLevelSchema.exclude(["unknown"]),
  expected_tone: z.string(),
  suggestion: z.string(),
});

const uxReviewOutOfScopeNoteSchema = z.object({
  span: z.string(),
  note: z.string(),
  opinion: z.string(),
});

export const uxReviewResultSchema = z.object({
  input: z.string(),
  applies_to: z.string(),
  inferred: z.boolean(),
  risk_level: riskLevelSchema,
  risk_reason: z.string(),
  verdict: verdictSchema,
  findings: z.array(uxReviewFindingSchema),
  conditional: z.array(uxReviewConditionalSchema),
  out_of_scope_notes: z.array(uxReviewOutOfScopeNoteSchema),
  revised: z.string(),
});

export type UxReviewResult = z.infer<typeof uxReviewResultSchema>;

/**
 * Gemini structured output 강제용 JSON schema.
 * zod 스키마와 형태를 일치시켜, 모델이 항상 동일한 구조로 응답하도록 한다.
 */
const responseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    input: { type: Type.STRING, description: "검수 대상 원문" },
    applies_to: { type: Type.STRING, description: "적용 컴포넌트 또는 콘텐츠 범위" },
    inferred: { type: Type.BOOLEAN, description: "applies_to를 봇이 추론했는지 여부" },
    risk_level: { type: Type.STRING, enum: ["low", "medium", "high", "unknown"], description: "추론한 위험도" },
    risk_reason: { type: Type.STRING, description: "위험도 추론 근거" },
    verdict: {
      type: Type.STRING,
      enum: ["pass", "warn", "fail", "needs_context"],
      description: "최종 검수 결과",
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rule_id: { type: Type.STRING, description: "INDEX.md에 정의된 추적 가능한 규칙 ID" },
          severity: { type: Type.STRING, enum: ["policy", "high", "medium", "low"] },
          sentence_index: { type: Type.NUMBER, description: "위반이 검출된 문장의 1부터 시작하는 번호" },
          span: { type: Type.STRING, description: "문제가 되는 원문 일부" },
          message: { type: Type.STRING, description: "가이드라인 기준 위반 이유" },
          suggestion: { type: Type.STRING, description: "개선 문안" },
        },
        required: ["rule_id", "severity", "sentence_index", "span", "message", "suggestion"],
      },
    },
    conditional: {
      type: Type.ARRAY,
      description: "맥락에 따라 위험도와 제안이 달라져 하나로 확정할 수 없는 경우의 조건별 결과",
      items: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING, description: "해당 판정이 적용되는 조건" },
          risk: { type: Type.STRING, enum: ["low", "medium", "high"], description: "조건에 따른 위험도" },
          expected_tone: { type: Type.STRING, description: "조건에 따른 종결어미 톤" },
          suggestion: { type: Type.STRING, description: "조건에 따른 개선 문안" },
        },
        required: ["condition", "risk", "expected_tone", "suggestion"],
      },
    },
    out_of_scope_notes: {
      type: Type.ARRAY,
      description: "가이드라인에 대응 규칙이 없는 참고 의견",
      items: {
        type: Type.OBJECT,
        properties: {
          span: { type: Type.STRING, description: "참고 의견의 대상이 되는 원문 일부" },
          note: { type: Type.STRING, description: "현재 가이드라인에 규칙이 없다는 설명" },
          opinion: { type: Type.STRING, description: "규칙 판정과 분리된 참고 의견" },
        },
        required: ["span", "note", "opinion"],
      },
    },
    revised: { type: Type.STRING, description: "가이드라인을 충족하는 최종 개선안" },
  },
  required: [
    "input",
    "applies_to",
    "inferred",
    "risk_level",
    "risk_reason",
    "verdict",
    "findings",
    "conditional",
    "out_of_scope_notes",
    "revised",
  ],
} as const;

/**
 * 사용자의 자연어 질의(검토 대상 문구/맥락)를 UX Writing 가이드라인 기준으로 판단한다.
 */
export const reviewUxWriting = async (query: string): Promise<UxReviewResult> => {
  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: query,
    config: {
      systemInstruction: buildUxWritingInstruction(),
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: responseJsonSchema,
    },
  });

  const content = response.text;

  if (!content) {
    throw new Error("Gemini 응답이 비어있습니다.");
  }

  return uxReviewResultSchema.parse(JSON.parse(content));
};
