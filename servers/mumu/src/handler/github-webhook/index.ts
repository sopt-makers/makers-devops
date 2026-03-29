import type { Request, Response } from "express";
import { isValidRepository } from "../../config";
import { handlePullRequestReviewComment } from "./pull_request-review-comment";
import { handlePullRequest } from "./pull_request";
import { pullRequestReviewCommentSchema, pullRequestSchema } from "@makers-devops/github";

export const handleGithubWebhook = async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];

  const fullName: string | undefined = req.body?.repository?.full_name;
  const repoName = fullName?.split("/")[1];

  if (!isValidRepository(repoName)) {
    return res.status(400).json({ error: `Invalid repository: ${fullName}` });
  }

  /**
   * Webhook API는 10초 동안 응답하지 않으면 delivery하지 않음
   * 각 핸들러들을 백그라운드에서 실행하고 바로 응답
   */
  res.status(200).send("Webhook received");

  try {
    switch (event) {
      case "pull_request": {
        handlePullRequest(pullRequestSchema.parse(req.body)).then((res) => console.log(res));
        break;
      }
      case "pull_request_review_comment": {
        handlePullRequestReviewComment(pullRequestReviewCommentSchema.parse(req.body)).then((res) => console.log(res));
        break;
      }
    }
  } catch (err) {
    console.error(`[${event}] webhook 처리 실패:`, err);
  }
};
