import "dotenv/config";
import express from "express";
import { createWebhookRouter } from "./webhook";

async function main() {
  const app = express();

  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString("utf-8");
      },
    }),
  );

  const webhookRouter = createWebhookRouter();
  app.use("/api", webhookRouter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`mumu server running on port:${port}`);
  });
}

main();
