import { MAKERS_OWNER } from "../constant";
import { octokit } from "./review";

/** PR 작성자를 자동으로 할당 (자동 할당은 1명으로 제한) */
export async function assignAuthorAsAssignee(repo: string, issueNumber: number, authorLogin: string) {
  const response = await octokit.issues.addAssignees({
    owner: MAKERS_OWNER,
    repo,
    issue_number: issueNumber,
    assignees: [authorLogin],
  });

  return response;
}
