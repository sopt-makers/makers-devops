import type { KnownBlock } from "@slack/types";
import { z } from "zod";

/** Storage에 저장되는 스레드 데이터 스키마 */
export const slackThreadDataSchema = z.object({
  id: z.string(),
  version: z.literal(1),
  channel: z.string(),
  thread_ts: z.string(),
});

export type SlackMessage = {
  text: string;
  blocks?: KnownBlock[];
};

export type SlackThreadMessage = {
  channel: string;
  message: SlackMessage;
  /** expiresIn: storage 저장 기간(초) */
  ex?: number;
};

export type SlackThreadData = z.infer<typeof slackThreadDataSchema>;
