import type { PullRequest } from "@makers-devops/github";
import { assignReviewers, selectReviewers } from "./review";
import { assignAuthorAsAssignee } from "./assignee";
import { config } from "../config";
import { getPullRequestThreadKey } from "../slack/key";
import { setReviewers } from "../global/reviewer";

export const assignReviewersAndAssignee = (pull: PullRequest) => {
  const repoName = pull.repository.full_name.split("/")[1];
  const prNumber = pull.pull_request.number;
  const author = pull.pull_request.user.login;

  const reviewers = selectReviewers(config.admins, author, 3);
  /** 리뷰어를 전역 변수에 저장 */
  setReviewers(reviewers);

  const key = getPullRequestThreadKey(pull);

  Promise.allSettled([
    assignReviewers(
      repoName,
      prNumber,
      reviewers.map((r) => r.github),
    ),
    assignAuthorAsAssignee(repoName, prNumber, author),
  ]).then((results) => {
    for (const result of results) {
      if (result.status === "rejected") {
        console.error(`${key}: 리뷰어/작성자 지정 실패`, result.reason);
      }
    }
  });
};
