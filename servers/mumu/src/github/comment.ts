import { threadStorage } from "../webhook";
import type { SlackNotifier } from "../slack";
import type { PullRequestReviewComment } from "./schema";

export const handlePullRequestReviewComment = async (
  payload: PullRequestReviewComment,
  slackNotifier: SlackNotifier,
) => {
  if (payload.action !== "created") {
    return JSON.stringify({ success: true, message: "Review comment action skipped." });
  }

  const repoFullName = payload.repository.full_name;
  const prNumber = payload.pull_request.number;
  const thread = threadStorage.get(repoFullName, prNumber);

  const text = [`> *${payload.comment.user.login}*`, `> ${payload.comment.body}`].join("\n");

  if (thread?.threadTs) {
    await slackNotifier.createThreadReply(thread.threadTs, text);
  }

  return JSON.stringify({ success: true, message: "Review comment notification sent." });
};
