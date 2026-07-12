import type { App } from "@slack/bolt";
import { formatUxReviewForSlack, reviewUxWriting } from "../../ai";

/** 멘션 텍스트에서 봇 멘션(<@U123>)을 제거한다. */
const stripMention = (text: string): string => text.replace(/<@[A-Z0-9]+>/g, "").trim();

const LOADING_REACTION = "loading";
const DONE_REACTION = "white_check_mark";

type SlackReactionClient = {
  reactions: {
    add: (args: { channel: string; timestamp: string; name: string }) => Promise<unknown>;
    remove: (args: { channel: string; timestamp: string; name: string }) => Promise<unknown>;
  };
};

const HELP_MESSAGE = [
  "*mumu UX Writing 리뷰 봇*",
  "",
  "검토하고 싶은 문구나 맥락을 멘션과 함께 보내주세요.",
  '예) `@mumu 결제 실패 화면에 "오류가 발생했습니다" 라고 띄우려는데 괜찮을까?`',
].join("\n");

const addReaction = async (client: SlackReactionClient, channel: string, timestamp: string, name: string) => {
  try {
    await client.reactions.add({ channel, timestamp, name });
  } catch (error) {
    console.error(`reaction add failed (${name}):`, error);
  }
};

const removeReaction = async (client: SlackReactionClient, channel: string, timestamp: string, name: string) => {
  try {
    await client.reactions.remove({ channel, timestamp, name });
  } catch (error) {
    console.error(`reaction remove failed (${name}):`, error);
  }
};

export const registerSlackBotListeners = (app: App): void => {
  app.event("app_mention", async ({ event, client, logger }) => {
    if ("bot_id" in event && event.bot_id) {
      return;
    }

    const channel = event.channel;
    const messageTs = event.ts;
    const threadTs = event.thread_ts ?? event.ts;
    const query = stripMention(event.text);

    if (query === "") {
      await client.chat.postMessage({ channel, thread_ts: threadTs, text: HELP_MESSAGE });
      return;
    }

    await addReaction(client, channel, messageTs, LOADING_REACTION);

    try {
      const result = await reviewUxWriting(query);

      await client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: formatUxReviewForSlack(result),
      });

      await removeReaction(client, channel, messageTs, LOADING_REACTION);
      await addReaction(client, channel, messageTs, DONE_REACTION);
    } catch (error) {
      logger.error(error);

      await removeReaction(client, channel, messageTs, LOADING_REACTION);

      await client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: "검토 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      });
    }
  });
};
