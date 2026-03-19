import { WebClient, type ChatPostMessageArguments, type ChatPostMessageResponse } from "@slack/web-api";
import { assertNonNullish } from "./utils/assert";

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

  async createThread(text: string): Promise<ChatPostMessageResponse> {
    return await this.notify({
      channel: this.channel,
      text,
    });
  }

  async createThreadReply(threadTs: string, text: string): Promise<ChatPostMessageResponse> {
    return await this.notify({
      channel: this.channel,
      thread_ts: threadTs,
      text,
    });
  }

  private async notify(option: ChatPostMessageArguments): Promise<ChatPostMessageResponse> {
    assertNonNullish(this.channel, "채널이 설정되지 않았어요");

    return await this.client.chat.postMessage(option);
  }
}

export function createSlackNotifier(token: string): SlackNotifier {
  return new SlackNotifier(token);
}
