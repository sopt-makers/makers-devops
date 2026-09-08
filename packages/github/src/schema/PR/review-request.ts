import { z } from "zod";

export const pullRequestReviewRequestedSchema = z.object({
  action: z.enum(["review_requested"]),
  sender: z.object({ login: z.string() }),
  requested_reviewer: z.object({ login: z.string() }),
  pull_request: z.object({
    number: z.number(),
    title: z.string(),
    html_url: z.string(),
  }),
  repository: z.object({ full_name: z.string() }),
});

export type PullRequestReviewRequested = z.infer<typeof pullRequestReviewRequestedSchema>;
