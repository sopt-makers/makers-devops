import "dotenv/config";
import express from "express";
import cors from "cors";
import { createWebhookRouter } from "./webhook";
import { assertNonNullish } from "@makers-devops/shared";
import { startSlackBot } from "./slack/bot";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const app = express();

const necessaryEnvVars = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "SLACK_BOT_TOKEN",
  "SLACK_APP_TOKEN",
  "GITHUB_TOKEN",
  "GITHUB_WEBHOOK_SECRET",
  "GEMINI_API_KEY",
] as const;

for (const envVar of necessaryEnvVars) {
  assertNonNullish(process.env[envVar], `${envVar} is not set`);
}

/** Figma 플러그인 요청 허용 */
app.use(
  cors({
    origin: "null",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

// 원본 요청 본문으로 GitHub 서명을 검증한 뒤 JSON을 파싱합니다.
app.use("/api", createWebhookRouter());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`mumu server running on port:${port}`);
});

startSlackBot().catch((error) => {
  console.error("Slack bot start failed:", error);
});
