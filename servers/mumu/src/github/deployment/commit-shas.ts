import { githubClient } from "@makers-devops/github";
import { REPOSITORY } from "../../constant";

const GITHUB_PAGE_SIZE = 100;
const [owner, repoName] = REPOSITORY.split("/");
const repo = { owner, repo: repoName };

export async function deploymentCommitShas(base: string, head: string): Promise<{ shas: string[]; notices: string[] }> {
  if (base === head) return { shas: [], notices: ["같은 커밋으로 다시 배포했어요."] };

  const first = await githubClient.repos.compareCommitsWithBasehead({
    ...repo,
    basehead: `${base}...${head}`,
    per_page: GITHUB_PAGE_SIZE,
    page: 1,
  });

  if (first.data.status !== "ahead")
    return {
      shas: [],
      notices: ["이전 버전 또는 다른 분기의 커밋으로 배포됐어요. 일반적인 신규 PR 목록으로 비교할 수 없어요."],
    };

  const shas: string[] = [];

  for (let page = 1; shas.length < first.data.total_commits; page++) {
    let data = first.data;

    if (page > 1) {
      const response = await githubClient.repos.compareCommitsWithBasehead({
        ...repo,
        basehead: `${base}...${head}`,
        per_page: GITHUB_PAGE_SIZE,
        page,
      });

      data = response.data;
    }

    if (!data.commits.length) throw new Error("Incomplete compare commits");

    shas.push(...data.commits.map((commit) => commit.sha));
  }

  if (shas.length !== first.data.total_commits) throw new Error("Incomplete compare commits");

  const commitShas = new Set(shas);

  if (commitShas.size !== first.data.total_commits) throw new Error("Incomplete compare commits");

  return { shas, notices: [] };
}
