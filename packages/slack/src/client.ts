import { WebClient } from "@slack/web-api";

export const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
