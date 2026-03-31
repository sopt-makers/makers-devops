import { designReviewRequestBodySchema } from "@makers-devops/figma";
import { slackClient } from "@makers-devops/slack";
import type { Request, Response } from "express";
import { CHANNELS } from "../../constant";
import { 피그마_리뷰_요청 } from "@makers-devops/slack-blocks";
import { config } from "../../config";

const findDesignAdminByName = (name: string) => {
  return config.design.admins.find((admin) => admin.name === name) ?? null;
};

export const handleDesignReview = async (req: Request, res: Response) => {
  const result = designReviewRequestBodySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, message: "Bad Request" });
  }

  const admin = findDesignAdminByName(result.data.userName);

  if (!admin) {
    return res.status(403).json({ success: false, message: "등록되지 않은 사용자입니다." });
  }

  try {
    await slackClient.chat.postMessage({
      channel: CHANNELS.DESIGN_REVIEW,
      ...피그마_리뷰_요청.slackPayload(result.data, { slackId: admin.slack }),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }

  return res.status(200).json({ success: true, message: "Design review request processed successfully" });
};
