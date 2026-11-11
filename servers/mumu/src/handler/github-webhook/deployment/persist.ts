import type { WorkflowRun } from "@makers-devops/github";
import { redisClient } from "@makers-devops/redis";
import type { Service } from "../../../config";
import { REPOSITORY } from "../../../constant";
import { releaseSha } from "../../../github/release-sha";
import type { DeploymentEvent } from "../types";

export const EVENT_RETENTION_SECONDS = 30 * 24 * 60 * 60;

export const eventKey = (payload: WorkflowRun) =>
  `mumu:production-deployment:${REPOSITORY}:event:${payload.workflow_run.id}:${payload.workflow_run.run_attempt}`;

export const stateKey = (service: Service) => `mumu:production-deployment:${REPOSITORY}:${service}`;

export async function persistDeployment(service: Service, payload: WorkflowRun): Promise<string> {
  const key = eventKey(payload);
  const sha = releaseSha(service, payload.workflow_run.display_title);

  if (!sha) throw new Error();

  const serviceKey = stateKey(service);
  const previous = await redisClient.get<{ release_sha: string; completed_at: string }>(serviceKey);

  const event: DeploymentEvent = {
    service,
    payload,
    release_sha: sha,
    run_id: payload.workflow_run.id,
    run_attempt: payload.workflow_run.run_attempt,
    previous_sha: previous?.release_sha,
    status: "pending",
  };

  const saved = await getOrCreateDeploymentEvent(key, event);

  await updateDeploymentStateIfNewer(serviceKey, previous, saved);

  return key;
}

/** 중복 이벤트는 최초 저장된 비교 기준과 처리 상태를 재사용합니다. */
async function getOrCreateDeploymentEvent(key: string, event: DeploymentEvent): Promise<DeploymentEvent> {
  const stored = await redisClient.set(key, event, { nx: true, ex: EVENT_RETENTION_SECONDS });

  if (stored) return event;

  const saved = await redisClient.get<DeploymentEvent>(key);

  if (!saved) throw new Error();

  return saved;
}

/** 이벤트의 완료 시각이 기존 상태보다 최신인 경우에만 갱신합니다. */
async function updateDeploymentStateIfNewer(
  serviceKey: string,
  previous: { completed_at: string } | null,
  event: DeploymentEvent,
): Promise<void> {
  const run = event.payload.workflow_run;

  const isNewerDeployment = !previous || Date.parse(previous.completed_at) < Date.parse(run.updated_at);

  if (isNewerDeployment) {
    const state = {
      release_sha: event.release_sha,
      run_id: run.id,
      run_attempt: run.run_attempt,
      completed_at: run.updated_at,
    };

    const stored = await redisClient.set(serviceKey, state);

    if (!stored) {
      throw new Error();
    }
  }
}
