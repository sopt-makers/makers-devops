# 매직 넘버 없애기 (응집도 관점)

## 요약

매직 넘버를 상수로 추출할 때, 그 상수를 어디에 배치할지가 응집도에 영향을 준다. 관련된 코드 가까이에 상수를 둔다.

## 문제 상황

상수를 전역 constants 파일에 모아두면, 정작 사용하는 코드와 멀어져 맥락을 잃는다.

## 나쁜 예시

```tsx
// constants/index.ts - 모든 상수가 한 곳에
export const ANIMATION_DELAY_MS = 300;
export const MAX_RETRY_COUNT = 3;
export const MIN_PASSWORD_LENGTH = 8;
export const API_TIMEOUT_MS = 5000;
export const PAGE_SIZE = 20;
// ... 100개의 상수

// components/LikeButton.tsx
import { ANIMATION_DELAY_MS } from '@/constants';

async function handleLike() {
  await postLike();
  await delay(ANIMATION_DELAY_MS);
}
```

**문제점**: `ANIMATION_DELAY_MS`가 `LikeButton`에서만 사용되는데, 전역 constants에 있어 관계를 파악하기 어렵다.

## 좋은 예시

```tsx
// components/LikeButton.tsx
const ANIMATION_DELAY_MS = 300;  // 이 파일에서만 사용

async function handleLike() {
  await postLike();
  await delay(ANIMATION_DELAY_MS);
}
```

### 여러 곳에서 사용하는 경우

```tsx
// features/auth/constants.ts - 인증 관련 상수만
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_LOGIN_ATTEMPTS = 5;
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// features/auth/components/PasswordInput.tsx
import { MIN_PASSWORD_LENGTH } from '../constants';
```

## 상수 배치 가이드

| 사용 범위 | 배치 위치 |
|----------|----------|
| 단일 파일 | 해당 파일 상단 |
| 단일 기능(feature) | `features/xxx/constants.ts` |
| 앱 전체 | `shared/constants.ts` (최소한으로) |

## 핵심 포인트

- 상수는 사용하는 코드 가까이에 배치
- 전역 constants 파일 비대화 방지
- 기능별로 상수 파일 분리
- 정말 전역적인 것만 공유 폴더에

## 참고

- [Toss Frontend Fundamentals - 매직 넘버 없애기](https://frontend-fundamentals.com/code-quality/en/code/examples/magic-number-cohesion)
