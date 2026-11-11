import { 배포_완료 } from "@makers-devops/slack-blocks";
import { config, SERVICES } from "../../../config";
import { deploymentChanges } from "../../../github/deployment/index";
import type { DeploymentPR } from "../../../github/deployment/service-prs";
import type { DeploymentEvent } from "../types";
import { eventKey } from "./persist";

const userMention = (login: string) => {
  const admin = config.frontend.admins.find((a) => a.github.toLowerCase() === login.toLowerCase());

  return admin ? `<@${admin.slack}>` : 배포_완료.escapeSlack(login);
};

export async function prepareDeploymentMessage(
  event: DeploymentEvent,
): Promise<NonNullable<DeploymentEvent["prepared"]>> {
  const settings = SERVICES[event.service];
  const previous = event.previous_sha;
  let prs: DeploymentPR[] = [];
  let changeNotices: string[] = [];
  let prLookupError: string | undefined;

  if (previous) {
    try {
      const changes = await deploymentChanges(event.service, previous, event.release_sha);

      prs = changes.prs;
      changeNotices = changes.notices;
    } catch {
      prLookupError = "Deployment PR lookup failed (GitHub API, incomplete data or file limit)";
      console.error(`[deployment ${eventKey(event.payload)}] ${prLookupError}`);
    }
  }

  const run = event.payload.workflow_run;
  return {
    channel: settings.channel,
    message: 배포_완료.slackPayload({
      service: settings.name,
      prs: prs.map((p) => ({ ...p, author: userMention(p.login) })),
      actor: userMention(run.triggering_actor?.login ?? run.actor.login),
      serviceUrl: settings.url,
      runUrl: run.html_url,
    }),
    pr_lookup_error: prLookupError,
    change_notices: changeNotices.length ? changeNotices : undefined,
  };
}
