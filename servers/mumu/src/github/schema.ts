import { z } from "zod";

export type PullRequest = z.infer<typeof pullRequestSchema>;
export type PullRequestReviewComment = z.infer<typeof pullRequestReviewCommentSchema>;
export type IssueComment = z.infer<typeof issueCommentSchema>;

export type Comment = z.infer<typeof commentSchema>;

export const pullRequestSchema = z.object({
  action: z.string(),
  pull_request: z.object({
    number: z.number(),
    title: z.string(),
    body: z.string().nullable(),
    draft: z.boolean().optional(),
    html_url: z.string(),
    diff_url: z.string(),
    head: z.object({
      ref: z.string(), // branch name
      sha: z.string(),
    }),
    base: z.object({
      ref: z.string(),
      sha: z.string(),
    }),
    user: z.object({
      login: z.string(),
    }),
    merged: z.boolean().optional(),
  }),
  repository: z.object({
    full_name: z.string(),
    html_url: z.string(),
  }),
});

export const pullRequestReviewCommentSchema = z.object({
  action: z.enum(["created", "edited", "deleted"]),
  comment: z.object({
    body: z.string(),
    html_url: z.string(),
    user: z.object({ login: z.string() }),
  }),
  pull_request: z.object({
    number: z.number(),
    title: z.string(),
  }),
  repository: z.object({ full_name: z.string() }),
});

export const issueCommentSchema = z.object({
  action: z.enum(["created", "edited", "deleted"]),
  issue: z.object({
    number: z.number(),
    pull_request: z.looseObject({}).optional(),
  }),
  comment: z.object({
    body: z.string(),
    html_url: z.string(),
    user: z.object({ login: z.string() }),
  }),
  repository: z.object({ full_name: z.string() }),
});

export const commentSchema = z.union([pullRequestReviewCommentSchema, issueCommentSchema]);
