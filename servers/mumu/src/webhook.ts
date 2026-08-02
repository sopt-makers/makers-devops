import { Router } from "express";
import { handleGithubWebhook } from "./handler/github-webhook";
import { handleDesignReview } from "./handler/figma-plugin/design-review";
import { handleUpdateDesignTokens } from "./handler/figma-plugin/update-design-tokens";

export function createWebhookRouter(): Router {
  const router = Router();

  router.post("/design-review", handleDesignReview);
  router.post("/update-design-tokens", handleUpdateDesignTokens);
  router.post("/webhook", handleGithubWebhook);

  return router;
}
