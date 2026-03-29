import type { PullRequest } from "@makers-devops/github";
import { createPullRequestThread } from "../slack";
import { getPullRequestThreadKey } from "../slack/key";
import { deleteSlackThreadData, findSlackThread, slackClient } from "@makers-devops/slack";
import { PR_닫힘 } from "@makers-devops/slack-blocks";
import { assignReviewersAndAssignee } from "../github";

type HandledAction = (typeof HANDLED_ACTIONS)[number];
const HANDLED_ACTIONS = ["opened", "reopened", "closed"] as const;

const handlePullRequestClosed = async (pullRequest: PullRequest) => {
  const key = getPullRequestThreadKey(pullRequest);

  const thread = await findSlackThread(key);

  if (!thread) {
    return JSON.stringify({ success: false, message: "Slack thread not found" });
  }

  try {
    const response = await slackClient.chat.postMessage({
      channel: thread.channel,
      thread_ts: thread.thread_ts,
      ...PR_닫힘.slackPayload(pullRequest),
    });

    if (!response.ok) {
      return JSON.stringify({ success: false, message: "Slack thread reply failed" });
    }
  } catch {
    console.error(`${key}: Pull request closed failed`);
  }

  await deleteSlackThreadData(key);

  return JSON.stringify({ success: true, message: "Pull request closed." });
};

export const handlePullRequest = async (pullRequest: PullRequest) => {
  if (!HANDLED_ACTIONS.includes(pullRequest.action as HandledAction)) {
    return JSON.stringify({ success: false, message: "Pull request action skipped." });
  }

  /** PR이 closed/merged 된 경우 */
  if (pullRequest.action === "closed") {
    return await handlePullRequestClosed(pullRequest);
  }

  /** 백그라운드에서 리뷰어/작성자 지정 (not await) */
  assignReviewersAndAssignee(pullRequest);

  const result = await createPullRequestThread(pullRequest);

  if (!result) {
    return JSON.stringify({ success: false, message: "Slack thread creation failed" });
  }

  return JSON.stringify({ success: true, message: "Pull request processed successfully", result });
};
