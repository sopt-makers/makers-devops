import { z } from "zod";

/** Storage에 저장되는 스레드 데이터 스키마 */
export const slackThreadDataSchema = z.object({
  id: z.string(),
  version: z.literal(1),
  channel: z.string(),
  thread_ts: z.string(),
});

/** 슬랙 메시지 스키마 */
export const slackThreadMessageSchema = z.object({
  channel: z.string(),
  thread_ts: z.string().optional(),
});

export type SlackThreadMessage = z.infer<typeof slackThreadMessageSchema> & { text: string };
export type SlackThreadData = z.infer<typeof slackThreadDataSchema>;
