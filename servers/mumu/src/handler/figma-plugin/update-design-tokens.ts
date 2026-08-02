import { githubClient } from "@makers-devops/github";
import type { Request, Response } from "express";

const DESIGN_SYSTEM_REPOSITORY = {
  owner: "sopt-makers",
  repo: "makers-design-system-2.0",
} as const;

const UPDATE_DESIGN_TOKENS_EVENT = "update-design-tokens";

/** body 스키마 검증은 워크플로우에서 진행 */
const isTokenPayload = (body: unknown): body is Record<string, unknown> => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const payload = body as Record<string, unknown>;
  return Boolean(payload.base || payload.semantic);
};

export const handleUpdateDesignTokens = async (req: Request, res: Response) => {
  if (!isTokenPayload(req.body)) {
    return res.status(400).json({
      success: false,
      message: "base 또는 semantic 토큰셋이 필요합니다.",
    });
  }

  try {
    await githubClient.repos.createDispatchEvent({
      ...DESIGN_SYSTEM_REPOSITORY,
      event_type: UPDATE_DESIGN_TOKENS_EVENT,
      client_payload: req.body,
    });
  } catch (error) {
    console.error("디자인 토큰 업데이트 workflow 트리거 실패:", error);
    return res.status(502).json({
      success: false,
      message: "디자인 토큰 업데이트 workflow를 트리거하지 못했습니다.",
    });
  }

  return res.status(202).json({
    success: true,
    message: "디자인 토큰 업데이트 workflow를 트리거했습니다.",
  });
};
