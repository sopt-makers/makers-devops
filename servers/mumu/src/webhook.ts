import { Router, type Request, type Response } from "express";
import { createSlackNotifier } from "./slack";
import { assertNonNullish } from "./util";
import { pullRequestSchema, pullRequestReviewCommentSchema } from "./github/schema";
import { FRONTEND_BOT_CHANNEL } from "./constant";
import { handlePullRequest } from "./github/pull_request";
import { handlePullRequestReviewComment } from "./github/comment";
import { isValidRepository } from "./config";

export function createWebhookRouter(): Router {
  assertNonNullish(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN 환경변수가 누락되었어요.");
  const slackNotifier = createSlackNotifier(process.env.SLACK_BOT_TOKEN);

  const router = Router();

  slackNotifier.init({ channel: FRONTEND_BOT_CHANNEL });

  router.post("/webhook", async (req: Request, res: Response) => {
    const event = req.headers["x-github-event"];

    const repository = req.body.repository.full_name;
    if (!isValidRepository(repository)) {
      return res.status(400).json({ error: `Invalid repository: ${repository}` });
    }

    /**
     * Webhook API는 10초 동안 응답하지 않으면 delivery하지 않음
     * 각 핸들러들을 백그라운드에서 실행하고 바로 응답
     */
    res.status(200).send("Webhook received");

    switch (event) {
      case "pull_request": {
        handlePullRequest(pullRequestSchema.parse(req.body), slackNotifier).then((res) => console.log(res));
        break;
      }
      case "pull_request_review_comment": {
        handlePullRequestReviewComment(pullRequestReviewCommentSchema.parse(req.body), slackNotifier).then((res) =>
          console.log(res),
        );
        break;
      }
    }
  });

  return router;
}
