import { config, validateRepository } from "../config";
import { assignReviewers, selectReviewers } from "./review";
import type { PullRequest } from "./schema";
import { threadStorage } from "../webhook";
import type { SlackNotifier } from "../slack";

export const handlePullRequest = async (pullRequest: PullRequest, slackNotifier: SlackNotifier) => {
  const repoName = pullRequest.repository.full_name.split("/")[1];
  const validRepo = validateRepository(repoName);

  const reviewers = selectReviewers(config.admins, pullRequest.pull_request.user.login, 2);
  const mentions = reviewers.map((r) => `<@${r.slack}>`).join(", ");
  const text = [
    `*[${pullRequest.repository.full_name}]에서 PR이 올라왔어요!* 👀`,
    `> *PR:* <${pullRequest.pull_request.html_url}|#${pullRequest.pull_request.number} ${pullRequest.pull_request.title}>`,
    `> *작성자:* ${pullRequest.pull_request.user.login}`,
    `> *리뷰어:* ${mentions}`,
  ].join("\n");

  /** 백그라운드에서 알림 전송/리뷰어 지정 (not await) */
  const [threadResponse] = await Promise.all([
    slackNotifier.createThread(text),
    assignReviewers(
      validRepo,
      pullRequest.pull_request.number,
      reviewers.map((r) => r.github),
    ),
  ]);

  /** 스레드 정보 저장 */
  threadStorage.set(pullRequest, {
    ok: threadResponse.ok,
    channel: threadResponse.channel,
    threadTs: threadResponse.ts,
    message: threadResponse.message,
  });

  return JSON.stringify({ success: true, message: "Pull request processed successfully" });
};
