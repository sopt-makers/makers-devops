import "dotenv/config";
import express from "express";
import { createWebhookRouter } from "./webhook";

async function main() {
  const app = express();

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
}

main();
