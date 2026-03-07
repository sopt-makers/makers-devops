import type { PullRequest } from "./github/schema";
import type { SlackThread } from "./types";

/** pull_request - thread map store */
export const createThreadStorage = () => {
  const map = new WeakMap<PullRequest, SlackThread>();

  return {
    set: (key: PullRequest, value: SlackThread) => {
      if (map.has(key)) {
        return;
      }
      map.set(key, value);
    },
    get: (key: PullRequest) => {
      return map.get(key);
    },
    delete: (key: PullRequest) => {
      if (!map.has(key)) {
        return;
      }
      map.delete(key);
    },
  };
};
