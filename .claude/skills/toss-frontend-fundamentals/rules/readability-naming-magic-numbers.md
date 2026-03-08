# 매직 넘버에 이름 붙이기

## 요약

코드에 직접 숫자 값을 넣는 "매직 넘버" 대신, 의미를 설명하는 상수명을 사용한다.

## 문제 상황

매직 넘버는 그 의도를 알 수 없다. 같은 숫자 300이라도 애니메이션 시간인지, 타임아웃인지, 다른 의미인지 코드만 봐서는 판단할 수 없다.

## 나쁜 예시

```tsx
async function handleLikeClick() {
  await postLike();
  await delay(300);
  await refetchLikes();
}
```

**문제점**: `300`이 무엇을 의미하는가?
- 애니메이션 완료 대기?
- 서버 반영 대기?
- 테스트용 지연?

## 좋은 예시

```tsx
const ANIMATION_DELAY_MS = 300;

async function handleLikeClick() {
  await postLike();
  await delay(ANIMATION_DELAY_MS);
  await refetchLikes();
}
```

**개선점**: 상수명으로 300ms가 애니메이션 지연임을 명확히 알 수 있다.

## 더 많은 예시

```tsx
// Bad
if (password.length < 8) { ... }
if (retryCount > 3) { ... }
const timeout = 5000;

// Good
const MIN_PASSWORD_LENGTH = 8;
const MAX_RETRY_COUNT = 3;
const API_TIMEOUT_MS = 5000;

if (password.length < MIN_PASSWORD_LENGTH) { ... }
if (retryCount > MAX_RETRY_COUNT) { ... }
```

## 핵심 포인트

- 단위를 이름에 포함 (`_MS`, `_PX`, `_PERCENT` 등)
- 상수는 UPPER_SNAKE_CASE 사용
- 0, 1 같은 명백한 숫자는 예외일 수 있음
- 응집도 관점에서 상수 위치도 고려 (관련 코드 근처에 배치)

## 참고

- [Toss Frontend Fundamentals - 매직 넘버에 이름 붙이기](https://frontend-fundamentals.com/code-quality/en/code/examples/magic-number-readability)
