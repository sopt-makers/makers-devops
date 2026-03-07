import { Octokit } from "@octokit/rest";
import { MAKERS_OWNER } from "./constant";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function assignReviewers(repo: string, prNumber: number, reviewers: string[]) {
  const response = await octokit.pulls.requestReviewers({
    owner: MAKERS_OWNER,
    repo,
    pull_number: prNumber,
    reviewers,
  });

  return response;
}
