import type { PullRequest } from "@makers-devops/github";
import type { KnownBlock } from "@slack/types";
import type { SlackBlockPayload } from "../types";

export const blocks = (pull: PullRequest): KnownBlock[] => {
  const isMerged = pull.pull_request.merged === true;
  const emoji = isMerged ? "🎉" : "🚫";
  const headline = isMerged ? "PR이 머지되었어요." : "PR이 닫혔어요.";

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${emoji} *${headline}*`,
      },
    },
  ];
};

export const fallbackText = (pull: PullRequest): string => {
  const isMerged = pull.pull_request.merged === true;
  const emoji = isMerged ? "🎉" : "🚫";
  const headline = isMerged ? "PR이 머지되었어요." : "PR이 닫혔어요.";
  return `${emoji} ${headline}`;
};

export const slackPayload = (pull: PullRequest): SlackBlockPayload => ({
  text: fallbackText(pull),
  blocks: blocks(pull),
});
