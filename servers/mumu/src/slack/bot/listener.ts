import type { App } from "@slack/bolt";
import { formatUxReviewForSlack, reviewUxWriting } from "../../ai";

/** 멘션 텍스트에서 봇 멘션(<@U123>)을 제거한다. */
const stripMention = (text: string): string => text.replace(/<@[A-Z0-9]+>/g, "").trim();

const HELP_MESSAGE = [
  "*mumu UX Writing 리뷰 봇*",
  "",
  "검토하고 싶은 문구나 맥락을 멘션과 함께 보내주세요.",
  '예) `@mumu 결제 실패 화면에 "오류가 발생했습니다" 라고 띄우려는데 괜찮을까?`',
].join("\n");

export const registerSlackBotListeners = (app: App): void => {
  app.event("app_mention", async ({ event, client, logger }) => {
    if ("bot_id" in event && event.bot_id) {
      return;
    }

    const channel = event.channel;
    const threadTs = event.thread_ts ?? event.ts;
    const query = stripMention(event.text);

    if (query === "") {
      await client.chat.postMessage({ channel, thread_ts: threadTs, text: HELP_MESSAGE });
      return;
    }

    /** 처리 시간이 길 수 있어 우선 접수 메시지를 전송 */
    await client.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text: "요청을 확인하고 UX Writing 기준으로 검토 중이에요. 잠시만 기다려주세요. ✍️",
    });

    try {
      const result = await reviewUxWriting(query);

      await client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: formatUxReviewForSlack(result),
      });
    } catch (error) {
      logger.error(error);

      await client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: "검토 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.",
      });
    }
  });
};
