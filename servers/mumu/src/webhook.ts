import { createHmac, timingSafeEqual } from "node:crypto";
import { Router, raw, json, type RequestHandler } from "express";
import { handleGithubWebhook } from "./handler/github-webhook";
import { handleDesignReview } from "./handler/figma-plugin/design-review";
import { handleUpdateDesignTokens } from "./handler/figma-plugin/update-design-tokens";

export function createWebhookRouter(): Router {
  const router = Router();

  router.post(
    "/webhook",
    raw({ type: "*/*", limit: "2mb", inflate: false }),
    verifyGithubSignature,
    handleGithubWebhook,
  );

  router.use(json());
  router.post("/design-review", handleDesignReview);
  router.post("/update-design-tokens", handleUpdateDesignTokens);

  return router;
}

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
