import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function assignReviewers(repo: string, prNumber: number, reviewers: string[]) {
  const response = await octokit.pulls.requestReviewers({
    owner: "sopt-makers",
    repo,
    pull_number: prNumber,
    reviewers,
  });

  return response;
}
