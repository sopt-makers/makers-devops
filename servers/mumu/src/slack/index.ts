import { createSlackThread, findSlackThread, slackClient } from "@makers-devops/slack";
import { getPullRequestThreadKey } from "./key";
import type { PullRequest, PullRequestReviewComment, PullRequestReviewRequested } from "@makers-devops/github";
import { CHANNELS } from "../constant";
import { PR_리뷰, PR_열림, PR_재리뷰 } from "@makers-devops/slack-blocks";
import type { PR열림Options, PR리뷰재요청Options } from "@makers-devops/slack-blocks";

/** PR에 대한 스레드를 생성합니다. */
export const createPullRequestThread = async (pull: PullRequest, options: PR열림Options) => {
  const key = getPullRequestThreadKey(pull);

  const result = await createSlackThread(key, {
    channel: CHANNELS.FRONTEND_BOT,
    message: PR_열림.slackPayload(pull, options),
    ex: 60 * 60 * 24 * 21,
  });

  return result;
};

/** PR 스레드에 대한 스레드 reply를 생성합니다. */
export const createPullRequestReviewCommentReply = async (comment: PullRequestReviewComment) => {
  const key = getPullRequestThreadKey(comment);
  const thread = await findSlackThread(key);

  if (!thread) {
    console.error(`${key}: Slack thread not found`);
    return null;
  }

  try {
    const response = await slackClient.chat.postMessage({
      channel: thread.channel,
      thread_ts: thread.thread_ts,
      ...PR_리뷰.slackPayload(comment),
    });

    if (!response.ok) {
      console.error(`${key}: Slack thread reply failed`);
      return null;
    }

    return {
      id: key,
      channel: thread.channel,
      thread_ts: response.ts,
    };
  } catch {
    console.error(`${key}: Slack thread reply failed`);
  }
  return null;
};

/** PR 스레드에 리뷰 재요청 reply를 생성합니다. */
export const createPullRequestReRequestedReply = async (
  payload: PullRequestReviewRequested,
  options: PR리뷰재요청Options,
) => {
  const key = getPullRequestThreadKey(payload);
  const thread = await findSlackThread(key);

  if (!thread) {
    console.error(`${key}: Slack thread not found`);
    return null;
  }

  try {
    const response = await slackClient.chat.postMessage({
      channel: thread.channel,
      thread_ts: thread.thread_ts,
      ...PR_재리뷰.slackPayload(payload, options),
    });

    if (!response.ok) {
      console.error(`${key}: Slack thread reply failed`);
      return null;
    }

    return {
      id: key,
      channel: thread.channel,
      thread_ts: response.ts,
    };
  } catch {
    console.error(`${key}: Slack thread reply failed`);
  }
  return null;
};
