import "dotenv/config";
import express from "express";
import { createWebhookRouter } from "./webhook";
import { redisStorage } from "./redis";
import { assertNonNullish } from "./util";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const app = express();

assertNonNullish(process.env.UPSTASH_REDIS_REST_URL, "UPSTASH_REDIS_REST_URL is not set");
assertNonNullish(process.env.UPSTASH_REDIS_REST_TOKEN, "UPSTASH_REDIS_REST_TOKEN is not set");

redisStorage.register({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  retry: 3,
});

/** 요청 JSON 바디 파싱 */
app.use(express.json());

app.use("/api", createWebhookRouter());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`mumu server running on port:${port}`);
});
