# 시점 이동 줄이기

## 요약

코드를 읽을 때 위아래로 왔다 갔다 해야 하는 "시점 이동"을 최소화하여 위에서 아래로 자연스럽게 읽히게 한다.

## 문제 상황

변수 선언과 사용 위치가 멀리 떨어져 있거나, 함수 정의가 호출 위치보다 아래에 있으면 코드를 이해하기 위해 스크롤을 반복해야 한다.

## 나쁜 예시

```tsx
function UserProfile() {
  const user = useUser();
  const posts = usePosts(user?.id);
  const followers = useFollowers(user?.id);
  const settings = useSettings();

  // ... 50줄의 다른 코드 ...

  const displayName = user?.nickname || user?.name || 'Anonymous';

  // ... 30줄의 다른 코드 ...

  return (
    <div>
      <h1>{displayName}</h1>
      {/* user, posts, followers 사용 */}
    </div>
  );
}
```

**문제점**: `displayName`을 이해하려면 위로 스크롤해서 `user`를 확인해야 한다.

## 좋은 예시

```tsx
function UserProfile() {
  const user = useUser();
  const displayName = user?.nickname || user?.name || 'Anonymous';

  const posts = usePosts(user?.id);
  const followers = useFollowers(user?.id);

  const settings = useSettings();

  return (
    <div>
      <h1>{displayName}</h1>
      {/* ... */}
    </div>
  );
}
```

**개선점**: 관련 있는 코드를 가까이 배치하여 시점 이동을 줄인다.

## 핵심 포인트

- 변수는 사용되는 곳 가까이에 선언
- 관련 있는 로직끼리 그룹화
- 함수 정의는 호출보다 위에 배치하거나, 별도 파일로 분리
- 긴 함수는 분리를 고려

## 참고

- [Toss Frontend Fundamentals - 시점 이동 줄이기](https://frontend-fundamentals.com/code-quality/en/)
