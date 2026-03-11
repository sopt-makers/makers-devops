import { config } from "../config";
import { assignReviewers, selectReviewers } from "./review";
import type { PullRequest } from "./schema";
import type { SlackNotifier } from "../slack";
import { redisStorage } from "../redis";
import type { SlackThread } from "../types";

type HandledAction = (typeof HANDLED_ACTIONS)[number];
const HANDLED_ACTIONS = ["opened", "reopened", "closed"] as const;

const handlePullRequestClosed = async (pullRequest: PullRequest, slackNotifier: SlackNotifier) => {
  const cacheKey = `${pullRequest.repository.full_name}#${pullRequest.pull_request.number}`;
  const thread = await redisStorage.get<SlackThread>(cacheKey);

  const isMerged = pullRequest.pull_request.merged === true;
  const replyText = `> ${isMerged ? "🎉 *PR이 머지되었어요.*" : "🚫 *PR이 닫혔어요.*"}`;

  if (!thread?.threadTs) {
    console.warn(`${cacheKey}/${thread?.channel}: threadTs를 찾을 수 없어요.`);
  } else {
    try {
      await slackNotifier.createThreadReply(thread.threadTs, replyText);
    } catch {
      console.error(`${cacheKey}/${thread.channel}: 슬랙 스레드 답변 전송 실패`);
    }
  }

  await redisStorage.delete(cacheKey).catch((err) => {
    console.log(`${cacheKey}: Redis 캐시 삭제 실패`, err);
  });
  return JSON.stringify({ success: true, message: "Pull request closed." });
};

export const handlePullRequest = async (pullRequest: PullRequest, slackNotifier: SlackNotifier) => {
  if (!HANDLED_ACTIONS.includes(pullRequest.action as HandledAction)) {
    return JSON.stringify({ success: true, message: "Pull request action skipped." });
  }

  const repoFullName = pullRequest.repository.full_name;
  const repoName = repoFullName.split("/")[1];
  const prNumber = pullRequest.pull_request.number;

  const cacheKey = `${repoFullName}#${prNumber}`;

  /** PR이 closed/merged 된 경우 */
  if (pullRequest.action === "closed") {
    return await handlePullRequestClosed(pullRequest, slackNotifier);
  }

  const authorLogin = pullRequest.pull_request.user.login;
  const author = config.admins.find((admin) => admin.github === authorLogin);
  const authorMention = author ? `<@${author.slack}>` : authorLogin;

  const reviewers = selectReviewers(config.admins, authorLogin, 3);
  const mentions = reviewers.map((r) => `<@${r.slack}>`).join(", ");
  const text = [
    `*[${repoFullName}]에서 PR이 올라왔어요!* 👀`,
    `> *PR:* <${pullRequest.pull_request.html_url}|#${prNumber} ${pullRequest.pull_request.title}>`,
    `> *작성자:* ${authorMention}`,
    `> *리뷰어:* ${mentions}`,
  ].join("\n");

  /** 백그라운드에서 리뷰어 지정 (not await) */
  assignReviewers(
    repoName,
    prNumber,
    reviewers.map((r) => r.github),
  ).catch((err) => {
    console.log(`${cacheKey}: 리뷰어 지정 실패`, err);
  });

  try {
    const response = await slackNotifier.createThread(text);

    if (!response.ts) {
      console.error(`${cacheKey}: Slack 스레드 생성 응답에 ts가 없어요 (ok: ${response.ok})`);
      return JSON.stringify({ success: false, message: "Slack thread ts missing" });
    }
    await redisStorage.set<SlackThread>(
      cacheKey,
      {
        ok: response.ok,
        channel: response.channel,
        threadTs: response.ts,
        message: response.message,
      },
      { ex: 60 * 60 * 24 * 21 },
    );
  } catch {
    console.error(`${cacheKey}: 슬랙 스레드 생성 실패`);
  }

  return JSON.stringify({ success: true, message: "Pull request processed successfully" });
};
