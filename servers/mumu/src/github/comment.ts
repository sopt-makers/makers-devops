import { redisStorage } from "../redis";
import type { SlackNotifier } from "../slack";
import type { SlackThread } from "../types";
import type { Comment } from "./schema";

const MAX_CHARS = 200;

const truncateBody = (body: string): string => {
  const twoLines = body.split("\n").slice(0, 2).join("\n");
  if (twoLines.length <= MAX_CHARS) return twoLines;
  return `${twoLines.slice(0, MAX_CHARS)}...`;
};

const escapeSlackLinkText = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildCommentMessage(payload: Comment): string {
  const preview = truncateBody(payload.comment.body);
  const safePreview = escapeSlackLinkText(preview);

  return [`> *${payload.comment.user.login}*`, `> <${payload.comment.html_url}|${safePreview}>`].join("\n");
}

export const handleComment = async (payload: Comment, slackNotifier: SlackNotifier): Promise<string> => {
  if (payload.action !== "created") {
    return JSON.stringify({ success: false, message: "Comment action skipped." });
  }

  const repoFullName = payload.repository.full_name;
  let prNumber: number;

  if ("issue" in payload) {
    if (!payload.issue.pull_request) {
      return JSON.stringify({ success: false, message: "Issue comment (not PR); skipped." });
    }
    prNumber = payload.issue.number;
  } else {
    prNumber = payload.pull_request.number;
  }

  const cacheKey = `${repoFullName}#${prNumber}`;
  const thread = await redisStorage.get<SlackThread>(cacheKey);

  if (!thread?.threadTs) {
    return JSON.stringify({
      success: false,
      message: `${cacheKey}/${thread?.channel}: threadTs를 찾을 수 없어요.`,
    });
  }

  const text = buildCommentMessage(payload);

  try {
    await slackNotifier.createThreadReply(thread.threadTs, text);
  } catch {
    console.error(`${cacheKey}/${thread.channel}: 슬랙 스레드 답변 전송 실패`);
  }

  return JSON.stringify({ success: true, message: "Comment processed successfully" });
};
