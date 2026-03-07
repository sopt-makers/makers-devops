import { Router, type Request, type Response } from "express";
import { createSlackNotifier } from "./slack";
import { assertNonNullish } from "./util";
import { pullRequestSchema } from "./github/schema";
import { FRONTEND_BOT_CHANNEL } from "./constant";
import { createThreadStorage } from "./storage";
import { handlePullRequest } from "./github/pull_request";

export const threadStorage = createThreadStorage();

export function createWebhookRouter(): Router {
  assertNonNullish(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN 환경변수가 누락되었어요.");
  const slackNotifier = createSlackNotifier(process.env.SLACK_BOT_TOKEN);

  const router = Router();

  /** 채널 연결 */
  slackNotifier.init({ channel: FRONTEND_BOT_CHANNEL });

  router.post("/webhook", async (req: Request, res: Response) => {
    const event = req.headers["x-github-event"];

    const pullRequestResult = await handlePullRequest(pullRequestSchema.parse(req.body), slackNotifier);

    switch (event) {
      case "pull_request":
        res.status(200).send(pullRequestResult);
        break;
      default:
        res.status(200).send("OK");
        break;
    }
  });

  return router;
}
