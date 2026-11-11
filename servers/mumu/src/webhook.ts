import { Router, json } from "express";
import { githubWebhookHandlers } from "./handler/github-webhook";
import { handleDesignReview } from "./handler/figma-plugin/design-review";
import { handleUpdateDesignTokens } from "./handler/figma-plugin/update-design-tokens";

export function createWebhookRouter(): Router {
  const router = Router();

  router.post("/webhook", githubWebhookHandlers);

  router.use(json());
  router.post("/design-review", handleDesignReview);
  router.post("/update-design-tokens", handleUpdateDesignTokens);

  return router;
}
