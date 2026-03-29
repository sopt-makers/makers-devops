type HasPullRequestInfo = {
  repository: { full_name: string };
  pull_request: { number: number };
};

export const getPullRequestThreadKey = (pull: HasPullRequestInfo) => {
  return `mumu:${pull.repository.full_name}#${pull.pull_request.number}`;
};
