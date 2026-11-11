import { z } from "zod";

export const workflowRunSchema = z.object({
  action: z.string(),
  repository: z.object({ full_name: z.string() }),
  workflow_run: z.object({
    id: z.number().int().positive(),
    run_attempt: z.number().int().positive(),
    path: z.string(),
    display_title: z.string(),
    conclusion: z.string().nullable(),
    updated_at: z.iso.datetime(),
    html_url: z.url(),
    actor: z.object({ login: z.string() }),
    triggering_actor: z.object({ login: z.string() }).nullish(),
  }),
});

export type WorkflowRun = z.infer<typeof workflowRunSchema>;
