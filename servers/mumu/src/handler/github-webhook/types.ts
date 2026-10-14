import type { WorkflowRun } from "@makers-devops/github";
import type { Service } from "../../config";
import type { SlackBlockPayload } from "@makers-devops/slack-blocks";

export type DeploymentEvent = {
  service: Service;
  payload: WorkflowRun;
  release_sha: string;
  run_id: number;
  run_attempt: number;
  previous_sha?: string;
  prepared?: {
    channel: string;
    message: SlackBlockPayload;
    pr_lookup_error?: string;
    change_notices?: string[];
  };
  status: "pending" | "processing" | "failed" | "sent";
  message_ts?: string;
  error?: string;
};
