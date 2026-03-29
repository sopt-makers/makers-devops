import type { KnownBlock } from "@slack/types";
import type { DesignReviewRequestBody } from "@makers-devops/figma";
import type { SlackBlockPayload } from "../types";

export const blocks = (payload: DesignReviewRequestBody): KnownBlock[] => {
  const { userName, task, schedule, reviewPoints, fileUrl } = payload;
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${userName}*님의 [디자인 리뷰 요청]`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*작업:* ${task}`,
        },
        {
          type: "mrkdwn",
          text: `*리뷰 요청 일정:* ~${schedule}`,
        },
        {
          type: "mrkdwn",
          text: `*Figma:* <${fileUrl}|${fileUrl}>`,
        },
        {
          type: "mrkdwn",
          text: `*리뷰 요청 포인트:* ${reviewPoints}`,
        },
      ],
    },
  ];
};

export const fallbackText = (payload: DesignReviewRequestBody): string => {
  const { userName } = payload;
  return `${userName}님의 [디자인 리뷰 요청]`;
};

export const slackPayload = (payload: DesignReviewRequestBody): SlackBlockPayload => ({
  text: fallbackText(payload),
  blocks: blocks(payload),
});
