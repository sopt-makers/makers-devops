import type { SlackThread } from "./types";

/** pull_request - thread map store */
export const createThreadStorage = () => {
  const map = new Map<string, SlackThread>();

  const key = (repoFullName: string, prNumber: number) => `${repoFullName}#${prNumber}`;

  return {
    set: (repoFullName: string, prNumber: number, value: SlackThread) => {
      map.set(key(repoFullName, prNumber), value);
    },
    get: (repoFullName: string, prNumber: number) => {
      return map.get(key(repoFullName, prNumber));
    },
    delete: (repoFullName: string, prNumber: number) => {
      map.delete(key(repoFullName, prNumber));
    },
  };
};
