import type { KnownBlock } from "@slack/types";
import type { DesignReviewRequestBody } from "@makers-devops/figma";
import type { SlackBlockPayload } from "../types";

export type 리뷰요청Options = {
  slackId: string;
};

export const blocks = (payload: DesignReviewRequestBody, options: 리뷰요청Options): KnownBlock[] => {
  const { task, schedule, reviewPoints, fileUrl } = payload;
  const authorDisplay = `<@${options.slackId}>`;

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${authorDisplay} 님의 [디자인 리뷰 요청]`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: [
          `> *작업:* ${task}`,
          `> *리뷰 요청 일정:* ~${schedule}`,
          `> *Figma:* <${fileUrl}|${fileUrl}>`,
          `> *리뷰 요청 포인트:* ${reviewPoints}`,
        ].join("\n"),
      },
    },
  ];
};

export const fallbackText = (payload: DesignReviewRequestBody): string => {
  const { userName } = payload;
  return `${userName}님의 [디자인 리뷰 요청]`;
};

export const slackPayload = (payload: DesignReviewRequestBody, options: 리뷰요청Options): SlackBlockPayload => ({
  text: fallbackText(payload),
  blocks: blocks(payload, options),
});
