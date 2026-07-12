import { App } from "@slack/bolt";
import { assertNonNullish } from "@makers-devops/shared";
import { registerSlackBotListeners } from "./listener";

/** Bolt Socket Mode 기반 Slack 봇을 생성하고 기동한다. */
export const startSlackBot = async (): Promise<void> => {
  assertNonNullish(process.env.SLACK_BOT_TOKEN, "SLACK_BOT_TOKEN is not set");
  assertNonNullish(process.env.SLACK_APP_TOKEN, "SLACK_APP_TOKEN is not set");

  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
  });

  registerSlackBotListeners(app);

  await app.start();

  console.log("mumu slack bot is running with socket mode");
};
