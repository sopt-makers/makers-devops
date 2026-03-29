import type { PullRequestReviewComment } from "@makers-devops/github";
import type { KnownBlock } from "@slack/types";
import type { SlackBlockPayload } from "../types";

const escapeSlackLinkText = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const blocks = (payload: PullRequestReviewComment): KnownBlock[] => {
  const safePreview = escapeSlackLinkText(payload.comment.body);

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${payload.comment.user.login}*\n<${payload.comment.html_url}|${safePreview}>`,
      },
    },
  ];
};

export const fallbackText = (payload: PullRequestReviewComment): string => {
  const safePreview = escapeSlackLinkText(payload.comment.body);
  return `${payload.comment.user.login}: ${safePreview}`;
};

export const slackPayload = (payload: PullRequestReviewComment): SlackBlockPayload => ({
  text: fallbackText(payload),
  blocks: blocks(payload),
});
