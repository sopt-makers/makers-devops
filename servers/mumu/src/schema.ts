import { z } from "zod";

export type PullRequest = z.infer<typeof pullRequestSchema>;

export const pullRequestSchema = z.object({
  action: z.enum(["opened", "reopened", "closed"]),
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
