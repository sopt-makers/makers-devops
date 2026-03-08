import { config, validateRepository } from "../config";
import { assignReviewers, selectReviewers } from "./review";
import type { PullRequest } from "./schema";
import { threadStorage } from "../webhook";
import type { SlackNotifier } from "../slack";

type HandledAction = (typeof HANDLED_ACTIONS)[number];
const HANDLED_ACTIONS = ["opened", "reopened", "closed"] as const;

export const handlePullRequest = (pullRequest: PullRequest, slackNotifier: SlackNotifier) => {
  if (!HANDLED_ACTIONS.includes(pullRequest.action as HandledAction)) {
    return JSON.stringify({ success: true, message: "Pull request action skipped." });
  }

  const repoFullName = pullRequest.repository.full_name;
  const repoName = repoFullName.split("/")[1];
  const prNumber = pullRequest.pull_request.number;

  const validRepo = validateRepository(repoName);

  /** PR이 closed/merged 된 경우 */
  if (pullRequest.action === "closed") {
    const thread = threadStorage.get(repoFullName, prNumber);
    const isMerged = pullRequest.pull_request.merged === true;
    const replyText = `> ${isMerged ? "🎉 *PR이 머지되었어요.*" : "🚫 *PR이 닫혔어요.*"}`;

    if (!thread?.threadTs) {
      console.warn(`[pull_request] threadTs not found for ${repoFullName}#${prNumber} — server may have restarted`);
    } else {
      slackNotifier.createThreadReply(thread.threadTs, replyText);
    }

    threadStorage.delete(repoFullName, prNumber);
    return JSON.stringify({ success: true, message: "Pull request closed." });
  }

  const reviewers = selectReviewers(config.admins, pullRequest.pull_request.user.login, 3);
  const mentions = reviewers.map((r) => `<@${r.slack}>`).join(", ");
  const text = [
    `*[${repoFullName}]에서 PR이 올라왔어요!* 👀`,
    `> *PR:* <${pullRequest.pull_request.html_url}|#${prNumber} ${pullRequest.pull_request.title}>`,
    `> *작성자:* ${pullRequest.pull_request.user.login}`,
    `> *리뷰어:* ${mentions}`,
  ].join("\n");

  /** 백그라운드에서 리뷰어 지정 (not await) */
  assignReviewers(
    validRepo,
    prNumber,
    reviewers.map((r) => r.github),
  );

  /** 스레드 생성 */
  slackNotifier.createThread(text).then((response) => {
    /** 스레드 정보 저장 */
    threadStorage.set(repoFullName, prNumber, {
      ok: response.ok,
      channel: response.channel,
      threadTs: response.ts,
      message: response.message,
    });
  });

  return JSON.stringify({ success: true, message: "Pull request processed successfully" });
};
