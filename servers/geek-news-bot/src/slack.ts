import { slackClient } from "@makers-devops/slack/client";
import type { KnownBlock } from "@slack/types";
import type { FilteredNewsItem } from "./filter";
import { ENV } from "./env";

const MAX_SLACK_ITEMS = 15;

const buildNewsBlocks = (items: FilteredNewsItem[]): KnownBlock[] => {
  const capped = items.slice(0, MAX_SLACK_ITEMS);
  const blocks: KnownBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "GeekNews - Frontend 관련 뉴스",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `AI가 선별한 Frontend 관련 뉴스 *${capped.length}건*이 있습니다.`,
        },
      ],
    },
    { type: "divider" },
  ];

  for (const item of capped) {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${item.link}|${item.title}>*\n${item.reason}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${item.pubDate}`,
          },
        ],
      },
      { type: "divider" },
    );
  }

  return blocks;
};

export const sendSlackNotification = async (items: FilteredNewsItem[]) => {
  if (items.length === 0) {
    return;
  }

  const blocks = buildNewsBlocks(items);

  await slackClient.chat.postMessage({
    channel: ENV.slackChannelId,
    text: `GeekNews Frontend 관련 뉴스 ${items.length}건`,
    blocks,
  });
};
