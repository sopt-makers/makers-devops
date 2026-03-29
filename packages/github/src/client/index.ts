import { Octokit } from "@octokit/rest";

export const githubClient = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
