import type { PullRequestReviewRequested } from "@makers-devops/github";
import type { KnownBlock } from "@slack/types";
import type { SlackBlockPayload } from "../types";

export type PR리뷰재요청Options = {
  senderId: string;
  reviewerId: string;
};

export const blocks = (payload: PullRequestReviewRequested, options: PR리뷰재요청Options): KnownBlock[] => {
  const { pull_request } = payload;
  const { html_url: prUrl, number: prNumber, title } = pull_request;

  const senderMention = `<@${options.senderId}>`;
  const reviewerMention = `<@${options.reviewerId}>`;

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*[${senderMention}]이 [${reviewerMention}]님에게 리뷰를 다시 요청했어요!* 🙏🏻`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `> *PR:* <${prUrl}|#${prNumber} ${title}>`,
      },
    },
  ];
};

export const fallbackText = (payload: PullRequestReviewRequested): string => {
  const { number, title } = payload.pull_request;
  return `PR #${number}: ${title} - 리뷰 재요청`;
};

export const slackPayload = (payload: PullRequestReviewRequested, options: PR리뷰재요청Options): SlackBlockPayload => ({
  text: fallbackText(payload),
  blocks: blocks(payload, options),
});
