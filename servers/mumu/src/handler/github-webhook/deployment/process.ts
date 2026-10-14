import { randomUUID } from "node:crypto";
import { redisClient } from "@makers-devops/redis";
import { slackClient } from "@makers-devops/slack";
import type { DeploymentEvent } from "../types";
import { prepareDeploymentMessage } from "./prepare-message";
import { EVENT_RETENTION_SECONDS } from "./persist";

const PROCESSING_LEASE_SECONDS = 120;

export async function processCrewPlaygroundProductionDeployment(key: string): Promise<void> {
  const lock = `${key}:lock`;
  const owner = randomUUID();

  const acquired = await redisClient.set(lock, owner, { nx: true, ex: PROCESSING_LEASE_SECONDS });

  if (!acquired) {
    return;
  }

  let event: DeploymentEvent | null = null;

  // 다른 처리자의 권한을 삭제하지 않도록 처리 권한은 직접 해제하지 않고 만료시킵니다.
  const saveEvent = async (deploymentEvent: DeploymentEvent) => {
    const lockOwner = await redisClient.get(lock);

    if (lockOwner !== owner) {
      throw new Error("Deployment processing expired");
    }

    const stored = await redisClient.set(key, deploymentEvent, { ex: EVENT_RETENTION_SECONDS });

    if (!stored) {
      throw new Error("Deployment event could not be stored");
    }
  };

  try {
    event = await redisClient.get<DeploymentEvent>(key);

    if (!event || event.status === "sent") return;

    event.status = "processing";
    await saveEvent(event);

    if (!event.prepared) {
      event.prepared = await prepareDeploymentMessage(event);

      await saveEvent(event);
    }

    const lockOwner = await redisClient.get(lock);

    if (lockOwner !== owner) {
      throw new Error("Deployment processing expired");
    }

    const response = await slackClient.chat.postMessage({
      channel: event.prepared.channel,
      ...event.prepared.message,
      link_names: false,
      parse: "none",
      unfurl_links: false,
      unfurl_media: false,
    });

    if (!response.ok || !response.ts) throw new Error("Slack did not confirm delivery");

    event.status = "sent";
    event.message_ts = response.ts;
    delete event.error;

    await saveEvent(event);
  } catch (error) {
    let message = "Deployment processing failed (external API or storage error)";

    if (error instanceof Error) {
      const isSafeError = ["Deployment processing expired", "Slack did not confirm delivery"].includes(error.message);

      if (isSafeError) message = error.message;
    }

    console.error(`[deployment ${key}] processing failed: ${message}`);

    if (event) {
      event.status = "failed";
      event.error = message;

      try {
        await saveEvent(event);
      } catch {
        console.error(`[deployment ${key}] failure state could not be saved`);
      }
    }
  }
}
