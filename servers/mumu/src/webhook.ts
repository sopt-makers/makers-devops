import { Router } from "express";
import { handleGithubWebhook } from "./handler/github-webhook";

export function createWebhookRouter(): Router {
  const router = Router();

  router.post("/webhook", handleGithubWebhook);

  return router;
}
