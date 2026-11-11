import { createHmac, timingSafeEqual } from "node:crypto";
import { raw, type Request, type Response, type RequestHandler } from "express";
import { workflowRunSchema } from "@makers-devops/github";
import { isValidRepository } from "../../config";
import { deploymentService } from "../../github/deployment-service";
import { releaseSha } from "../../github/release-sha";
import { persistDeployment } from "./deployment/persist";
import { processCrewPlaygroundProductionDeployment } from "./deployment/process";
import { handlePullRequestReviewComment } from "./pull_request-review-comment";
import { handlePullRequest } from "./pull_request";

export const handleGithubWebhook = async (req: Request, res: Response) => {
  const event = req.headers["x-github-event"];

  if (event === "workflow_run") {
    // 알림 대상이 아닌 이벤트는 배포 정보 검증 전에 무시합니다.
    const service = deploymentService(req.body);

    if (!service) {
      res.status(200).send("Webhook ignored");
      return;
    }

    const parsed = workflowRunSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid workflow_run payload" });
      return;
    }

    if (!releaseSha(service, parsed.data.workflow_run.display_title)) {
      res.status(400).json({ error: "Invalid production run title or release SHA" });
      return;
    }

    let key: string;
    try {
      key = await persistDeployment(service, parsed.data);
    } catch {
      res.status(503).json({ error: "Deployment event could not be stored" });
      return;
    }

    res.status(200).send("Webhook stored");
    void processCrewPlaygroundProductionDeployment(key).catch(() =>
      console.error(`[workflow_run ${key}] background processing failed`),
    );
    return;
  }

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
        await handlePullRequest(req, res);
        break;
      }
      case "pull_request_review_comment": {
        await handlePullRequestReviewComment(req, res);
        break;
      }
    }
  } catch (err) {
    console.error(`[${event}] webhook 처리 실패:`, err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyGithubSignature: RequestHandler = (req, res, next) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    res.status(503).json({ error: "Webhook secret is not configured" });
    return;
  }

  if (!Buffer.isBuffer(req.body) || !isValidSignature(req.body, req.get("x-hub-signature-256"), secret)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  try {
    req.body = JSON.parse(req.body.toString("utf8"));
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  next();
};

export function isValidSignature(body: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;

  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = Buffer.from(signature.slice(7), "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const githubWebhookHandlers: RequestHandler[] = [
  raw({ type: "*/*", limit: "2mb", inflate: false }),
  verifyGithubSignature,
  handleGithubWebhook,
];
