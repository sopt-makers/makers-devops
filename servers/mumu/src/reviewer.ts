import type { AdminUser } from "./types";

/**
 * 리뷰어 선택
 * @param admins 관리자 목록
 * @param excludeUser 제외할 사용자
 * @param count 선택할 리뷰어 수
 * @returns 선택된 리뷰어 목록
 */
export function selectReviewers(admins: AdminUser[], excludeUser: string, count = 2): AdminUser[] {
  const candidates = admins.filter((admin) => admin.github !== excludeUser);

  // Fisher-Yates shuffle
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
