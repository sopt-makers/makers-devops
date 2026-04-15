import type { SlackThreadMessage } from "./types";
import { slackClient } from "./client";
import { setSlackThreadData, getSlackThreadData } from "./redis";
import type { SlackThreadData } from "./types";

function toChatPostMessageArgs({ channel, message }: SlackThreadMessage) {
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
      await setSlackThreadData(id, data, _message.ex ? { ex: _message.ex } : undefined);

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
