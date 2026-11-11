import { githubClient } from "@makers-devops/github";
import type { Service } from "../../config";
import { REPOSITORY } from "../../constant";
import { classifyFiles, type ChangedFile } from "./classify-files";

const GITHUB_PAGE_SIZE = 100;
const MAX_FILES_PER_CHANGE = 3000;
const [owner, repoName] = REPOSITORY.split("/");
const repo = { owner, repo: repoName };

export type DeploymentPR = {
  number: number;
  title: string;
  url: string;
  login: string;
};

export async function servicePullRequests(
  service: Service,
  shas: string[],
): Promise<{ prs: DeploymentPR[]; notices: string[] }> {
  const commitShas = new Set(shas);
  const prs: DeploymentPR[] = [];
  const seen = new Set<number>();
  let directCommitCount = 0;
  let unclassifiedChangeCount = 0;

  for (const sha of shas) {
    const associated = await githubClient.paginate(githubClient.repos.listPullRequestsAssociatedWithCommit, {
      ...repo,
      commit_sha: sha,
      per_page: GITHUB_PAGE_SIZE,
    });

    const merged = associated.filter((p) => p.merged_at && p.merge_commit_sha && commitShas.has(p.merge_commit_sha));

    if (!merged.length) {
      const files: ChangedFile[] = [];

      for (let page = 1; ; page++) {
        const { data } = await githubClient.repos.getCommit({
          ...repo,
          ref: sha,
          per_page: GITHUB_PAGE_SIZE,
          page,
        });

        if (!data.files) throw new Error("Commit files unavailable");

        files.push(...data.files);

        if (files.length >= MAX_FILES_PER_CHANGE) throw new Error("Commit files API limit");
        if (data.files.length < GITHUB_PAGE_SIZE) break;
      }

      const classification = classifyFiles(files);
      if (classification.services.includes(service)) directCommitCount++;
      if (classification.unclassified) unclassifiedChangeCount++;
    }

    for (const pr of merged) {
      if (seen.has(pr.number)) continue;

      seen.add(pr.number);

      const files = await githubClient.paginate(githubClient.pulls.listFiles, {
        ...repo,
        pull_number: pr.number,
        per_page: GITHUB_PAGE_SIZE,
      });

      if (files.length >= MAX_FILES_PER_CHANGE) throw new Error("PR files API limit");

      const classification = classifyFiles(files);
      if (classification.unclassified) unclassifiedChangeCount++;

      if (classification.services.includes(service))
        prs.push({
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          login: pr.user?.login ?? "unknown",
        });
    }
  }

  const notices: string[] = [];

  if (directCommitCount)
    notices.push(`관련 직접 커밋 ${directCommitCount}개가 있어요. PR 제목 목록에는 포함하지 않았어요.`);

  if (unclassifiedChangeCount) notices.push("미분류 파일 변경이 있습니다.");

  return { prs, notices };
}
