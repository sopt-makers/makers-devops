import { SERVICES, type Service } from "../config";
import { REPOSITORY } from "../constant";

export function deploymentService(
  payload?: {
    action?: string;
    repository?: { full_name?: string } | null;
    workflow_run?: { conclusion?: string | null; path?: string } | null;
  } | null,
): Service | undefined {
  const path = payload?.workflow_run?.path;

  if (
    payload?.action !== "completed" ||
    payload?.repository?.full_name !== REPOSITORY ||
    payload?.workflow_run?.conclusion !== "success" ||
    typeof path !== "string"
  )
    return undefined;

  const workflowPath = path.split("@")[0];

  switch (workflowPath) {
    case SERVICES.crew.path:
      return "crew";
    case SERVICES.playground.path:
      return "playground";
    default:
      return undefined;
  }
}
