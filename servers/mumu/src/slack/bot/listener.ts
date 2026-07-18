import type { App, Logger } from "@slack/bolt";
import { formatUxReviewForSlack, reviewUxWriting } from "../../ai";

/** 멘션 텍스트에서 봇 멘션(<@U123>)을 제거한다. */
const stripMention = (text: string): string => text.replace(/<@[A-Z0-9]+>/g, "").trim();

const LOADING_REACTION = "loading";
const DONE_REACTION = "white_check_mark";

type SlackChatClient = {
  chat: {
    postMessage: (args: { channel: string; thread_ts?: string; text: string }) => Promise<unknown>;
  };
  reactions: {
    add: (args: { channel: string; timestamp: string; name: string }) => Promise<unknown>;
    remove: (args: { channel: string; timestamp: string; name: string }) => Promise<unknown>;
  };
};

const HELP_MESSAGE = [
  "*mumu UX Writing 리뷰 봇*",
  "",
  "검토하고 싶은 문구나 맥락을 보내주세요.",
  "",
  "• 채널: `@무무봇` 멘션과 함께 전송",
  '  예) `@무무봇 결제 실패 화면에 "오류가 발생했습니다" 라고 띄우려는데 괜찮을까?`',
  "• DM: 무무봇과의 대화에서 바로 전송",
  '  예) `결제 실패 화면에 "오류가 발생했습니다" 라고 띄우려는데 괜찮을까?`',
].join("\n");

const addReaction = async (client: SlackChatClient, channel: string, timestamp: string, name: string) => {
  try {
    await client.reactions.add({ channel, timestamp, name });
  } catch (error) {
    console.error(`reaction add failed (${name}):`, error);
  }
};

const removeReaction = async (client: SlackChatClient, channel: string, timestamp: string, name: string) => {
  try {
    await client.reactions.remove({ channel, timestamp, name });
  } catch (error) {
    console.error(`reaction remove failed (${name}):`, error);
  }
};

type ReviewRequest = {
  channel: string;
  messageTs: string;
  threadTs: string;
  text: string;
};

const handleUxWritingReview = async (client: SlackChatClient, logger: Logger, request: ReviewRequest) => {
  const { channel, messageTs, threadTs, text } = request;
  const query = stripMention(text);

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
};

export const registerSlackBotListeners = (app: App): void => {
  app.event("app_mention", async ({ event, client, logger }) => {
    if ("bot_id" in event && event.bot_id) {
      return;
    }

    await handleUxWritingReview(client, logger, {
      channel: event.channel,
      messageTs: event.ts,
      threadTs: event.thread_ts ?? event.ts,
      text: event.text,
    });
  });

  app.message(async ({ message, client, logger }) => {
    if (message.channel_type !== "im") {
      return;
    }

    if (message.subtype || ("bot_id" in message && message.bot_id)) {
      return;
    }

    if (!("text" in message) || !message.text || !message.ts) {
      return;
    }

    await handleUxWritingReview(client, logger, {
      channel: message.channel,
      messageTs: message.ts,
      threadTs: message.thread_ts ?? message.ts,
      text: message.text,
    });
  });
};
