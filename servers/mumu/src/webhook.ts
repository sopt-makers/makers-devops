import { Router, type Request, type Response } from "express";
import { createSlackNotifier } from "./slack";
import { assertNonNullish } from "./util";
import { pullRequestSchema, pullRequestReviewCommentSchema } from "./github/schema";
import { FRONTEND_BOT_CHANNEL } from "./constant";
import { createThreadStorage } from "./storage";
import { handlePullRequest } from "./github/pull_request";
import { handlePullRequestReviewComment } from "./github/comment";

export const threadStorage = createThreadStorage();

export function createWebhookRouter(): Router {
  assertNonNullish(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN 환경변수가 누락되었어요.");
  const slackNotifier = createSlackNotifier(process.env.SLACK_BOT_TOKEN);

  const router = Router();

  slackNotifier.init({ channel: FRONTEND_BOT_CHANNEL });

  router.post("/webhook", async (req: Request, res: Response) => {
    const event = req.headers["x-github-event"];

    /**
     * Webhook API는 10초 동안 응답하지 않으면 delivery하지 않음
     * 각 핸들러들을 백그라운드에서 실행하고 바로 응답
     */
    res.status(200).send("Webhook received");
    try {
      switch (event) {
        case "pull_request": {
          const result = handlePullRequest(pullRequestSchema.parse(req.body), slackNotifier);
          console.log(`Pull Request: ${JSON.parse(result)}`);
          break;
        }
        case "pull_request_review_comment": {
          const result = handlePullRequestReviewComment(pullRequestReviewCommentSchema.parse(req.body), slackNotifier);
          console.log(`Pull Request Review Comment: ${JSON.parse(result)}`);
          break;
        }
      }
    } catch (err) {
      console.error(`${event} Error:`, err);
    }
  });

  return router;
}
