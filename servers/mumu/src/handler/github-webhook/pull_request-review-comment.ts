import type { PullRequestReviewComment } from "@makers-devops/github";
import { createPullRequestReviewCommentReply } from "../../slack";

export const handlePullRequestReviewComment = async (payload: PullRequestReviewComment) => {
  if (payload.action !== "created") {
    return JSON.stringify({ success: false, message: "Review comment action skipped." });
  }

  const result = await createPullRequestReviewCommentReply(payload);

  if (!result) {
    return JSON.stringify({ success: false, message: "Slack thread reply failed" });
  }

  return JSON.stringify({ success: true, message: "Review comment processed successfully", result });
};
