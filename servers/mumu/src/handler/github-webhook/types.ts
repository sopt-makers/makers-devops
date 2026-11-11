import type { WorkflowRun } from "@makers-devops/github";
import type { Service } from "../../config";
import type { SlackBlockPayload } from "@makers-devops/slack-blocks";

type PreparedMessage = {
  channel: string;
  message: SlackBlockPayload;
  pr_lookup_error?: string;
  change_notices?: string[];
};

type DeploymentEventBase = {
  service: Service;
  payload: WorkflowRun;
  release_sha: string;
  run_id: number;
  run_attempt: number;
  previous_sha?: string;
  prepared?: PreparedMessage;
  message_ts?: string;
  error?: string;
};

export type DeploymentEvent = DeploymentEventBase &
  (
    | { status: "pending" | "processing" }
    | { status: "failed"; error: string }
    | { status: "sent"; prepared: PreparedMessage; message_ts: string; error?: never }
  );
