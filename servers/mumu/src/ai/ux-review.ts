import { Type } from "@google/genai";
import { z } from "zod";
import { GEMINI_MODEL, geminiClient } from "./client";
import { buildUxWritingInstruction } from "./instructions/ux-writing";

const severitySchema = z.enum(["policy", "high", "medium", "low"]);
const verdictSchema = z.enum(["pass", "warn", "fail"]);
const riskLevelSchema = z.enum(["low", "medium", "high", "unknown"]);

const uxReviewFindingSchema = z.object({
  rule_id: z.string(),
  severity: severitySchema,
  span: z.string(),
  message: z.string(),
  suggestion: z.string(),
});

export const uxReviewResultSchema = z.object({
  input: z.string(),
  applies_to: z.string(),
  inferred: z.boolean(),
  risk_level: riskLevelSchema,
  risk_reason: z.string(),
  verdict: verdictSchema,
  findings: z.array(uxReviewFindingSchema),
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
    verdict: { type: Type.STRING, enum: ["pass", "warn", "fail"], description: "최종 검수 결과" },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rule_id: { type: Type.STRING, description: "INDEX.md에 정의된 추적 가능한 규칙 ID" },
          severity: { type: Type.STRING, enum: ["policy", "high", "medium", "low"] },
          span: { type: Type.STRING, description: "문제가 되는 원문 일부" },
          message: { type: Type.STRING, description: "가이드라인 기준 위반 이유" },
          suggestion: { type: Type.STRING, description: "개선 문안" },
        },
        required: ["rule_id", "severity", "span", "message", "suggestion"],
      },
    },
    revised: { type: Type.STRING, description: "가이드라인을 충족하는 최종 개선안" },
  },
  required: ["input", "applies_to", "inferred", "risk_level", "risk_reason", "verdict", "findings", "revised"],
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
