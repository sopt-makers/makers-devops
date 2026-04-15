import "dotenv/config";
import { assert } from "@makers-devops/shared";

const assertEnv = (env: string) => {
  assert(process.env[env] != null, `${env} is not set`);

  return process.env[env] as string;
};

const optionalEnv = (env: string) => {
  return process.env[env] ?? undefined;
};

export const ENV = {
  slackBotToken: assertEnv("SLACK_BOT_TOKEN"),
  slackChannelId: assertEnv("SLACK_CHANNEL_ID"),
  googleApiKey: assertEnv("GOOGLE_GENERATIVE_AI_API_KEY"),
  cronSchedule: assertEnv("CRON_SCHEDULE"),
  maxNewsPerFetch: Number(optionalEnv("MAX_NEWS_PER_FETCH") ?? 50),
};
