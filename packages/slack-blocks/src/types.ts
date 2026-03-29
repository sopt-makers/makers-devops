import type { KnownBlock } from "@slack/types";

export type SlackBlockPayload = {
  text: string;
  blocks: KnownBlock[];
};
