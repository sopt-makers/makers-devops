import type { Request, Response } from "express";
import { pullRequestReviewCommentSchema } from "@makers-devops/github";
import { createPullRequestReviewCommentReply } from "../../slack";

export const handlePullRequestReviewComment = async (req: Request, res: Response) => {
  const payload = pullRequestReviewCommentSchema.parse(req.body);

  if (payload.action !== "created") {
    return res.json({ success: false, message: "Review comment action skipped." });
  }

  const result = await createPullRequestReviewCommentReply(payload);

  if (!result) {
    return res.json({ success: false, message: "Slack thread reply failed" });
  }

  return res.json({ success: true, message: "Review comment processed successfully", result });
};
