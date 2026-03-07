import { Octokit } from "@octokit/rest";
import { MAKERS_OWNER } from "../constant";
import type { AdminUser } from "../types";

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

export function selectReviewers(admins: AdminUser[], excludeUser: string, count = 2): AdminUser[] {
  const candidates = admins.filter((admin) => admin.github !== excludeUser);

  // Fisher-Yates shuffle
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
