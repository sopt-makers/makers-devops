# 숨은 로직 드러내기

## 요약

함수나 컴포넌트의 이름, 파라미터, 반환값에서 드러나지 않는 숨겨진 동작(부수 효과)은 예측을 어렵게 한다. 숨은 로직을 명시적으로 드러내라.

## 문제 상황

함수가 이름이 암시하는 것 이상의 동작을 수행하면, 호출하는 쪽에서 예상치 못한 결과를 맞닥뜨릴 수 있다.

## 나쁜 예시

```tsx
async function fetchBalance(userId: string) {
  const balance = await api.getBalance(userId);

  // 숨겨진 로깅 로직
  analytics.log('balance_fetched', { userId, balance });

  return balance;
}
```

**문제점**:
- `fetchBalance`라는 이름만으로는 로깅이 발생하는지 알 수 없다
- 로깅 서버 오류가 잔액 조회를 실패시킬 수 있다
- 테스트할 때 로깅 모킹도 필요해진다

## 좋은 예시

### 방법 1: 부수 효과 분리

```tsx
async function fetchBalance(userId: string) {
  return api.getBalance(userId);
}

// 호출부에서 명시적으로 로깅
async function handleBalanceCheck(userId: string) {
  const balance = await fetchBalance(userId);
  analytics.log('balance_fetched', { userId, balance });
  return balance;
}
```

### 방법 2: 이름으로 부수 효과 암시

```tsx
async function fetchBalanceWithLogging(userId: string) {
  const balance = await api.getBalance(userId);
  analytics.log('balance_fetched', { userId, balance });
  return balance;
}
```

## 더 많은 예시

```tsx
// Bad: 숨겨진 캐시 무효화
async function updateUser(user: User) {
  await api.updateUser(user);
  cache.invalidate('users');  // 숨겨진 부수 효과
}

// Good: 명시적 분리
async function updateUser(user: User) {
  return api.updateUser(user);
}

async function updateUserAndInvalidateCache(user: User) {
  await updateUser(user);
  cache.invalidate('users');
}
```

## 핵심 포인트

- 함수는 이름이 약속하는 일만 수행
- 부수 효과는 호출부에서 명시적으로 처리
- 부수 효과가 필수라면 이름에 반영
- 단일 책임 원칙 준수

## 참고

- [Toss Frontend Fundamentals - 숨은 로직 드러내기](https://frontend-fundamentals.com/code-quality/en/code/examples/hidden-logic)
