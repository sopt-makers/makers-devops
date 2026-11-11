import type { Service } from "../../config";
import { deploymentCommitShas } from "./commit-shas";
import { servicePullRequests, type DeploymentPR } from "./service-prs";

export async function deploymentChanges(
  service: Service,
  base: string,
  head: string,
): Promise<{ prs: DeploymentPR[]; notices: string[] }> {
  const { shas, notices } = await deploymentCommitShas(base, head);

  if (!shas.length) {
    return { prs: [], notices };
  }

  const changes = await servicePullRequests(service, shas);

  return { prs: changes.prs.sort((a, b) => a.number - b.number), notices: changes.notices };
}
