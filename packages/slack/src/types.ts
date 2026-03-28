import type { ChatPostMessageArguments } from "@slack/web-api";
import { z } from "zod";

/** slack 메세지 스키마 */
export const slackThreadMessageSchema = z.object({
  channel: z.string(),
  thread_ts: z.string(),
});

/** storage에 저장되는 스레드 데이터 스키마 */
export const slackThreadDataSchema = z.object({
  id: z.string(),
  version: z.literal(1),
  channel: z.string(),
  ts: z.string(),
});

export type SlackMessage = Partial<ChatPostMessageArguments> & { text: string };
export type SlackThreadMessage = z.infer<typeof slackThreadMessageSchema>;
export type SlackThreadData = z.infer<typeof slackThreadDataSchema>;
