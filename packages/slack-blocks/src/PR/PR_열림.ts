import type { PullRequest } from "@makers-devops/github";
import type { KnownBlock } from "@slack/types";
import type { SlackBlockPayload } from "../types";

export type PR열림Options = {
  authorId: string;
  reviewerIds: string[];
};

export const blocks = (pull: PullRequest, options: PR열림Options): KnownBlock[] => {
  const { repository, pull_request } = pull;
  const repoFullName = repository.full_name;
  const { html_url: prUrl, number: prNumber, title } = pull_request;

  const authorMention = `<@${options.authorId}>`;
  const reviewerMentions = options.reviewerIds.map((id) => `<@${id}>`).join(", ");

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*[${repoFullName}]에서 PR이 올라왔어요!* 👀`,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*PR:* <${prUrl}|#${prNumber} ${title}>`,
        },
        {
          type: "mrkdwn",
          text: `*작성자:* ${authorMention}`,
        },
        {
          type: "mrkdwn",
          text: `*리뷰어:* ${reviewerMentions}`,
        },
      ],
    },
  ];
};

export const fallbackText = (pull: PullRequest): string => {
  const repoFullName = pull.repository.full_name;
  const { number, title } = pull.pull_request;
  return `[${repoFullName}] PR #${number}: ${title}`;
};

export const slackPayload = (pull: PullRequest, options: PR열림Options): SlackBlockPayload => ({
  text: fallbackText(pull),
  blocks: blocks(pull, options),
});
