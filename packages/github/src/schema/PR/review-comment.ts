import { z } from "zod";

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

export type PullRequestReviewComment = z.infer<typeof pullRequestReviewCommentSchema>;
