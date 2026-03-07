import { WebClient } from "@slack/web-api";
import { assertNonNullish } from "./util";

type SlackInitializeOptions = {
  channel: string;
};

export class SlackNotifier {
  private client: WebClient;
  private channel = "#프론트엔드-bot";

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  init({ channel }: SlackInitializeOptions): void {
    this.channel = channel;
  }

  async notify(text: string): Promise<void> {
    assertNonNullish(this.channel, "채널이 설정되지 않았어요");

    await this.client.chat.postMessage({
      channel: this.channel,
      text,
    });
  }
}

export function createSlackNotifier(token: string): SlackNotifier {
  return new SlackNotifier(token);
}
