import { redisStorage } from "../redis";
import type { SlackNotifier } from "../slack";
import type { SlackThread } from "../types";
import type { PullRequestReviewComment } from "./schema";

const MAX_CHARS = 200;

const truncateBody = (body: string): string => {
  const twoLines = body.split("\n").slice(0, 2).join("\n");
  if (twoLines.length <= MAX_CHARS) return twoLines;
  return `${twoLines.slice(0, MAX_CHARS)}...`;
};

export const handlePullRequestReviewComment = async (
  payload: PullRequestReviewComment,
  slackNotifier: SlackNotifier,
) => {
  if (payload.action !== "created") {
    return JSON.stringify({ success: false, message: "Review comment action skipped." });
  }

  const repoFullName = payload.repository.full_name;
  const prNumber = payload.pull_request.number;
  const cacheKey = `${repoFullName}#${prNumber}`;

  const thread = await redisStorage.get<SlackThread>(cacheKey);

  if (!thread?.threadTs) {
    return JSON.stringify({
      success: false,
      message: `${cacheKey}/${thread?.channel}: threadTs를 찾을 수 없어요.`,
    });
  }

  const preview = truncateBody(payload.comment.body);
  const text = [`> *${payload.comment.user.login}*`, `> <${payload.comment.html_url}|${preview}>`].join("\n");

  try {
    await slackNotifier.createThreadReply(thread.threadTs, text);
  } catch {
    console.error(`${cacheKey}/${thread.channel}: review comment 슬랙 스레드 답변 전송 실패`);
  }

  return JSON.stringify({ success: true, message: "Review comment processed successfully" });
};
