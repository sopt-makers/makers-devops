import type { KnownBlock } from "@slack/types";
import type { SlackBlockPayload } from "../types";

// Slack section 블록의 text는 최대 3,000자까지 허용됩니다.
const MAX_BLOCK_LENGTH = 3000;

export type DeploymentMessage = {
  service: string;
  prs: { number: number; title: string; url: string; author: string }[];
  actor: string;
  serviceUrl: string;
  runUrl: string;
};

export const escapeSlack = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function lines(data: DeploymentMessage): string[] {
  const result = [`🚀 ${data.service} Prod 배포가 완료됐어요`];

  if (data.prs.length) result.push("", "변경 내용");

  for (const pr of data.prs) {
    result.push(`- <${pr.url}|${escapeSlack(pr.title)}> ${pr.author}`);
  }

  result.push("", `서비스 바로가기: <${data.serviceUrl}>`, `배포자: ${data.actor}`, `배포 기록: <${data.runUrl}>`);

  return result;
}

export const blocks = (data: DeploymentMessage): KnownBlock[] => {
  const chunks: string[] = [];

  for (let line of lines(data)) {
    while (line.length > MAX_BLOCK_LENGTH) {
      chunks.push(line.slice(0, MAX_BLOCK_LENGTH));
      line = line.slice(MAX_BLOCK_LENGTH);
    }

    const last = chunks.length - 1;

    if (last < 0 || chunks[last].length + line.length + 1 > MAX_BLOCK_LENGTH) chunks.push(line);
    else chunks[last] += `\n${line}`;
  }

  return chunks.map((text) => ({ type: "section", text: { type: "mrkdwn", text, verbatim: true } }));
};

export const fallbackText = (data: DeploymentMessage) => lines(data).join("\n");

export const slackPayload = (data: DeploymentMessage): SlackBlockPayload => ({
  text: fallbackText(data),
  blocks: blocks(data),
});
