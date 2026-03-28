import type { SlackThreadData, SlackThreadMessage } from "./types";
import { slackClient } from "./client";
import { getSlackThreadData, setSlackThreadData } from "./redis";

export * from "./client";
export * from "./types";
export * from "./redis";

export const createSlackThread = async (id: string, message: SlackThreadMessage) => {
  const { channel, text } = message;

  try {
    const response = await slackClient.chat.postMessage({
      channel,
      text,
    });

    if (response.ts) {
      const data: SlackThreadData = {
        id,
        version: 1,
        channel,
        thread_ts: response.ts,
      };
      setSlackThreadData(id, data);
    }
  } catch (error) {
    console.error(error);
    throw error;
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
