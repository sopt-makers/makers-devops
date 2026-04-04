import cron from "node-cron";
import { runNewsJob } from "./fetch";
import { ENV } from "./env";

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

/** 최초 fetch */
runNewsJob().catch((err) => {
  console.error("Initial run failed:", err);
});

/** 정기 fetch */
cron.schedule(ENV.cronSchedule, () => {
  runNewsJob().catch((err) => {
    console.error("Cron Schedule failed:", err);
  });
});
