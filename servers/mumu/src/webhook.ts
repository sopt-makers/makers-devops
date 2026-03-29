import { Router } from "express";
import { handleGithubWebhook } from "./handler/github-webhook";
import { handleDesignReview } from "./handler/figma-plugin/design-review";

export function createWebhookRouter(): Router {
  const router = Router();

  router.post("/design-review", handleDesignReview);
  router.post("/webhook", handleGithubWebhook);

  return router;
}
