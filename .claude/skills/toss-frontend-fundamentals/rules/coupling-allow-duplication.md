# 중복 코드 허용하기

## 요약

"DRY(Don't Repeat Yourself)"를 맹목적으로 따르면 오히려 결합도가 높아질 수 있다. 맥락이 다른 코드는 중복을 허용하는 것이 나을 때가 있다.

## 문제 상황

비슷해 보이는 코드를 무리하게 추상화하면, 나중에 각자 다른 방향으로 변경될 때 추상화가 방해가 된다.

## 나쁜 예시

```tsx
// 공통 컴포넌트로 추상화
function UserCard({ user, variant }: { user: User; variant: 'profile' | 'comment' | 'admin' }) {
  return (
    <div className={styles[variant]}>
      <Avatar user={user} size={variant === 'admin' ? 'large' : 'medium'} />
      <span>{user.name}</span>
      {variant === 'profile' && <FollowButton userId={user.id} />}
      {variant === 'comment' && <ReportButton userId={user.id} />}
      {variant === 'admin' && (
        <>
          <BanButton userId={user.id} />
          <DeleteButton userId={user.id} />
        </>
      )}
    </div>
  );
}
```

**문제점**:
- variant에 따른 분기가 복잡해짐
- 한 variant 변경이 다른 variant에 영향을 줄 수 있음
- 테스트가 어려움

## 좋은 예시

```tsx
// 각 맥락에 맞는 별도 컴포넌트
function ProfileUserCard({ user }: { user: User }) {
  return (
    <div className={styles.profile}>
      <Avatar user={user} size="medium" />
      <span>{user.name}</span>
      <FollowButton userId={user.id} />
    </div>
  );
}

function CommentUserCard({ user }: { user: User }) {
  return (
    <div className={styles.comment}>
      <Avatar user={user} size="medium" />
      <span>{user.name}</span>
      <ReportButton userId={user.id} />
    </div>
  );
}

function AdminUserCard({ user }: { user: User }) {
  return (
    <div className={styles.admin}>
      <Avatar user={user} size="large" />
      <span>{user.name}</span>
      <BanButton userId={user.id} />
      <DeleteButton userId={user.id} />
    </div>
  );
}
```

**개선점**: 각 컴포넌트가 독립적으로 변경될 수 있다.

## 중복 vs 추상화 판단 기준

**중복을 허용해야 할 때:**
- 비슷해 보이지만 변경 이유가 다른 경우
- 추상화 시 조건 분기가 많이 필요한 경우
- 각 사용처가 다른 방향으로 발전할 가능성이 높은 경우

**추상화해야 할 때:**
- 동일한 비즈니스 규칙을 표현하는 경우
- 버그 수정 시 모든 곳에 적용되어야 하는 경우
- 진짜로 같은 것인 경우

## 핵심 포인트

- "Rule of Three": 세 번 반복되면 그때 추상화 고려
- 잘못된 추상화는 중복보다 나쁘다
- 맥락이 다르면 코드가 같아도 다른 것
- 추상화 비용(결합도 증가) 고려

## 참고

- [Toss Frontend Fundamentals - 중복 코드 허용하기](https://frontend-fundamentals.com/code-quality/en/)
