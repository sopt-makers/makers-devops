import { threadStorage } from "../webhook";
import type { SlackNotifier } from "../slack";
import type { PullRequestReviewComment } from "./schema";

const MAX_CHARS = 200;

const truncateBody = (body: string): string => {
  const twoLines = body.split("\n").slice(0, 2).join("\n");
  if (twoLines.length <= MAX_CHARS) return twoLines;
  return `${twoLines.slice(0, MAX_CHARS)}...`;
};

export const handlePullRequestReviewComment = (payload: PullRequestReviewComment, slackNotifier: SlackNotifier) => {
  if (payload.action !== "created") {
    return JSON.stringify({ success: true, message: "Review comment action skipped." });
  }

  const repoFullName = payload.repository.full_name;
  const prNumber = payload.pull_request.number;
  const thread = threadStorage.get(repoFullName, prNumber);

  const preview = truncateBody(payload.comment.body);
  const text = [`> *${payload.comment.user.login}*`, `> <${payload.comment.html_url}|${preview}>`].join("\n");

  if (!thread?.threadTs) {
    return JSON.stringify({
      success: false,
      message: `Review comment thread not found for ${repoFullName}#${prNumber}`,
    });
  }

  slackNotifier.createThreadReply(thread.threadTs, text);

  return JSON.stringify({ success: true, message: "Review comment processed successfully" });
};
