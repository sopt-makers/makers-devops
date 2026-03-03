import { Router, type Request, type Response } from "express";
import { loadConfig } from "./config";
import { selectReviewers } from "./reviewer";
import { createSlackNotifier } from "./slack";
import { assertNonNullish } from "./util";
import { pullRequestSchema } from "./schema";
import { assignReviewers } from "./github";

const slackNotifier = createSlackNotifier(process.env.SLACK_BOT_TOKEN ?? "");
const config = loadConfig();

const handlePullRequest = async (req: Request, res: Response) => {
  const result = pullRequestSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error.message });
  }

  const repoName = result.data.repository.full_name.split("/")[1];

  /** 등록된 repo인지에 대한 검증 */
  if (!config.repos.includes(repoName)) {
    return res.status(200).json({ success: false, error: "Repository not registered, skipping." });
  }

  const reviewers = selectReviewers(config.admins, result.data.pull_request.user.login, 2);

  /** 백그라운드에서 알림 전송/리뷰어 지정 (not await) */
  Promise.all([
    slackNotifier.notifyReviewerAssigned({
      repo: result.data.repository.full_name,
      prNumber: result.data.pull_request.number,
      prTitle: result.data.pull_request.title,
      prUrl: result.data.pull_request.html_url,
      reviewers,
      author: result.data.pull_request.user.login,
    }),
    assignReviewers(
      repoName,
      result.data.pull_request.number,
      reviewers.map((r) => r.github),
    ),
  ]);

  return res.status(200).json({ success: true, message: "Pull request processed successfully" });
};

export function createWebhookRouter(): Router {
  assertNonNullish(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN 환경변수가 누락되었어요.");

  const router = Router();

  router.post("/webhook", async (req: Request, res: Response) => {
    const event = req.headers["x-github-event"];

    switch (event) {
      case "pull_request":
        return handlePullRequest(req, res);
      default:
        return res.status(200).send("OK");
    }
  });

  return router;
}
