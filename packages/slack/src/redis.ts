import { redisClient } from "@makers-devops/redis";
import type { SlackThreadData } from "./types";

export const setSlackThreadData = async (
  id: string,
  data: SlackThreadData,
  options?: Parameters<typeof redisClient.set>[2],
) => {
  try {
    await redisClient.set(id, data, options);
  } catch (error) {
    console.error(error);
  }
};

export const getSlackThreadData = async (id: string) => {
  try {
    return await redisClient.get<SlackThreadData>(id);
  } catch (error) {
    console.error(error);
  }
};

export const deleteSlackThreadData = async (id: string) => {
  try {
    await redisClient.delete(id);
  } catch (error) {
    console.error(error);
  }
};
