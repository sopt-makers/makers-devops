import type { Request, Response } from "express";
import { pullRequestSchema, type PullRequest } from "@makers-devops/github";
import { createPullRequestThread } from "../../slack";
import { getPullRequestThreadKey } from "../../slack/key";
import { deleteSlackThreadData, findSlackThread, slackClient } from "@makers-devops/slack";
import { PR_닫힘 } from "@makers-devops/slack-blocks";
import { assignReviewersAndAssignee } from "../../github";
import { selectReviewers } from "../../github/review";
import { config } from "../../config";

type HandledAction = (typeof HANDLED_ACTIONS)[number];
const HANDLED_ACTIONS = ["opened", "reopened", "closed"] as const;

const handlePullRequestClosed = async (_req: Request, res: Response, pullRequest: PullRequest) => {
  const key = getPullRequestThreadKey(pullRequest);

  const thread = await findSlackThread(key);

  if (!thread) {
    return res.json({ success: false, message: "Slack thread not found" });
  }

  try {
    const response = await slackClient.chat.postMessage({
      channel: thread.channel,
      thread_ts: thread.thread_ts,
      ...PR_닫힘.slackPayload(pullRequest),
    });

    if (!response.ok) {
      return res.json({ success: false, message: "Slack thread reply failed" });
    }
  } catch {
    console.error(`${key}: Pull request closed failed`);
  }

  await deleteSlackThreadData(key);

  return res.json({ success: true, message: "Pull request closed." });
};

export const handlePullRequest = async (req: Request, res: Response) => {
  const pullRequest = pullRequestSchema.parse(req.body);

  if (!HANDLED_ACTIONS.includes(pullRequest.action as HandledAction)) {
    return res.json({ success: false, message: "Pull request action skipped." });
  }

  if (pullRequest.action === "closed") {
    return await handlePullRequestClosed(req, res, pullRequest);
  }

  const authorLogin = pullRequest.pull_request.user.login;
  const author = config.admins.find((admin) => admin.github === authorLogin);

  if (!author) {
    return res.json({ success: false, message: "Author is not admin user" });
  }

  const reviewers = selectReviewers(config.admins, authorLogin, 3);
  const reviewerGithubIds = reviewers.map((r) => r.github);
  const reviewerSlackIds = reviewers.map((r) => r.slack);

  assignReviewersAndAssignee(pullRequest, reviewerGithubIds);

  const result = await createPullRequestThread(pullRequest, {
    authorId: author.slack,
    reviewerIds: reviewerSlackIds,
  });

  if (!result) {
    return res.json({ success: false, message: "Slack thread creation failed" });
  }

  return res.json({ success: true, message: "Pull request processed successfully", result });
};
