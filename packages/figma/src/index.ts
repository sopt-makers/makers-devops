import { z } from "zod";

/** UX writing 피그마 플러그인 용 요청 바디 스키마 */
export const designReviewRequestBodySchema = z.object({
  task: z.string(),
  schedule: z.string(),
  reviewPoints: z.string(),
  userName: z.string(),
  fileUrl: z.httpUrl(),
});

export type DesignReviewRequestBody = z.infer<typeof designReviewRequestBodySchema>;
