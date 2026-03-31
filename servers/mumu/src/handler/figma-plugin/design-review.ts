import { designReviewRequestBodySchema } from "@makers-devops/figma";
import { slackClient } from "@makers-devops/slack";
import type { Request, Response } from "express";
import { CHANNELS } from "../../constant";
import { 피그마_리뷰_요청 } from "@makers-devops/slack-blocks";

export const handleDesignReview = async (req: Request, res: Response) => {
  const result = designReviewRequestBodySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, message: "Bad Request" });
  }

  try {
    await slackClient.chat.postMessage({
      /** TODO(@wuzoo): 테스트 후 채널 변경 */
      channel: CHANNELS.DESIGN_REVIEW,
      ...피그마_리뷰_요청.slackPayload(result.data),
    });
  } catch {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }

  return res.status(200).json({ success: true, message: "Design review request processed successfully" });
};
