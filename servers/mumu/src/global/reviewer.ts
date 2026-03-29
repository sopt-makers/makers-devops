import type { AdminUser } from "../types";

/** 웹훅의 하나의 유효한 요청에 대한 리뷰어를 저장합니다. */
let reviewers: AdminUser[] = [];

export const setReviewers = (_reviewers: AdminUser[]) => {
  reviewers = _reviewers;
};

export const getReviewers = () => reviewers;
