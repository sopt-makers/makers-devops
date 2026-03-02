import { Router, type Request, type Response } from "express";
import { Webhooks } from "@octokit/webhooks";
import { loadConfig } from "./config";
import { selectReviewers } from "./reviewer";
import { assignReviewers } from "./github";
import { createSlackNotifier } from "./slack";
import { assertNonNullish } from "./util";
import type { WebhookEventName } from "@octokit/webhooks/types";

export function createWebhookRouter(): Router {
  assertNonNullish(process.env.GITHUB_WEBHOOK_SECRET, "GITHUB_WEBHOOK_SECRET 환경변수가 누락되었어요.");
  assertNonNullish(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN 환경변수가 누락되었어요.");

  const webhooks = new Webhooks({
    secret: process.env.GITHUB_WEBHOOK_SECRET,
  });
  const slackNotifier = createSlackNotifier(process.env.SLACK_BOT_TOKEN);

  webhooks.on(["pull_request.opened", "pull_request.reopened"], async ({ payload }) => {
    try {
      const repo = payload.repository.name;
      const prNumber = payload.pull_request.number;
      const prTitle = payload.pull_request.title;
      const prUrl = payload.pull_request.html_url;
      const author = payload.pull_request.user.login;

      const config = loadConfig();
      const reviewers = selectReviewers(config.admins, author, 2);

      if (reviewers.length === 0) {
        console.warn(`No eligible reviewers for PR #${prNumber} in ${repo}`);
        return;
      }

      await assignReviewers(
        repo,
        prNumber,
        reviewers.map((r) => r.github),
      );
      await slackNotifier.notifyReviewerAssigned({
        repo,
        prNumber,
        prTitle,
        prUrl,
        reviewers,
        author,
      });
    } catch (err) {
      console.error("Failed to process PR event:", err);
    }
  });

  const router = Router();

  router.post("/webhook", async (req: Request, res: Response) => {
    const id = req.headers["x-github-delivery"] as string;
    const name = req.headers["x-github-event"] as WebhookEventName;
    const signature = req.headers["x-hub-signature-256"] as string;
    const payload = (req as unknown as { rawBody: string }).rawBody;

    try {
      await webhooks.verifyAndReceive({
        id,
        name,
        payload,
        signature,
      });
      res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook verification failed:", err);
      res.status(400).send("Bad Request");
    }
  });

  return router;
}
