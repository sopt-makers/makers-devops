import type { ChatPostMessageResponse } from "@slack/web-api";

export type AdminUser = {
  github: string;
  slack: string;
};

export type RepositoryConfig = {
  repo: string;
  admins: AdminUser[];
};

export type Config = {
  admins: AdminUser[];
  repos: string[];
};

export interface ReviewerAssignedParams {
  repo: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  reviewers: AdminUser[];
  author: string;
}

export interface SlackThread {
  ok: boolean;
  channel?: string;
  threadTs?: string;
  message?: ChatPostMessageResponse["message"];
}
