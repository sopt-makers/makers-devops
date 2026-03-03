import { WebClient } from "@slack/web-api";
import type { ReviewerAssignedParams } from "./types";

export class SlackNotifier {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async notifyReviewerAssigned(params: ReviewerAssignedParams): Promise<void> {
    const mentions = params.reviewers.map((r) => `@${r.slack}`).join(", ");
    const text = [
      `*[${params.repo}] PR 리뷰어가 지정되었어요* 👀`,
      `> *PR:* <${params.prUrl}|#${params.prNumber} ${params.prTitle}>`,
      `> *작성자:* ${params.author}`,
      `> *리뷰어:* ${mentions}`,
    ].join("\n");

    await this.client.chat.postMessage({
      channel: "#프론트엔드-bot",
      text,
    });
  }
}

export function createSlackNotifier(token: string): SlackNotifier {
  return new SlackNotifier(token);
}
