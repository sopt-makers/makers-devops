import type { PullRequest } from "@makers-devops/github";
import { assignReviewers } from "./review";
import { assignAuthorAsAssignee } from "./assignee";
import { getPullRequestThreadKey } from "../slack/key";

export const assignReviewersAndAssignee = (pull: PullRequest, reviewerGithubLogins: string[]) => {
  const repoName = pull.repository.full_name.split("/")[1];
  const prNumber = pull.pull_request.number;
  const author = pull.pull_request.user.login;

  const key = getPullRequestThreadKey(pull);

  Promise.allSettled([
    assignReviewers(repoName, prNumber, reviewerGithubLogins),
    assignAuthorAsAssignee(repoName, prNumber, author),
  ]).then((results) => {
    for (const result of results) {
      if (result.status === "rejected") {
        console.error(`${key}: 리뷰어/작성자 지정 실패`, result.reason);
      }
    }
  });
};
