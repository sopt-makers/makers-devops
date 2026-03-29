import type { ChatPostMessageArguments } from "@slack/web-api";
import type { SlackThreadData, SlackThreadMessage } from "./types";
import { slackClient } from "./client";
import { getSlackThreadData, setSlackThreadData } from "./redis";

export * from "./client";
export * from "./types";
export * from "./redis";

function toChatPostMessageArgs({ channel, message }: SlackThreadMessage): ChatPostMessageArguments {
  if (message.blocks !== undefined) {
    return {
      channel,
      text: message.text,
      blocks: message.blocks,
    };
  }

  return {
    channel,
    text: message.text,
  };
}

export const createSlackThread = async (id: string, _message: SlackThreadMessage) => {
  try {
    const response = await slackClient.chat.postMessage(toChatPostMessageArgs(_message));

    if (response.ok) {
      const data: SlackThreadData = {
        id,
        version: 1,
        channel: response.channel ?? _message.channel,
        thread_ts: response.ts ?? "",
      };
      setSlackThreadData(id, data);

      return data;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const findSlackThread = async (id: string) => {
  try {
    const data = await getSlackThreadData(id);

    if (data) {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};
