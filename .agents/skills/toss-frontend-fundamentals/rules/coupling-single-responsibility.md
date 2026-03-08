# 책임을 하나씩 관리하기

## 요약

하나의 Hook, 함수, 컴포넌트가 여러 책임을 가지면 수정 시 영향 범위가 커진다. 책임을 분리하여 결합도를 낮춘다.

## 문제 상황

하나의 Hook이 모든 페이지 상태를 관리하면, 해당 Hook에 의존하는 모든 컴포넌트가 영향을 받는다.

## 나쁜 예시

```tsx
// hooks/usePageState.ts
function usePageState() {
  const [cardId, setCardId] = useQueryParam('cardId');
  const [statementId, setStatementId] = useQueryParam('statementId');
  const [startDate, setStartDate] = useQueryParam('startDate');
  const [endDate, setEndDate] = useQueryParam('endDate');
  const [statusList, setStatusList] = useQueryParam('statusList');

  return {
    cardId, setCardId,
    statementId, setStatementId,
    startDate, setStartDate,
    endDate, setEndDate,
    statusList, setStatusList,
  };
}

// 여러 컴포넌트에서 사용
function CardFilter() {
  const { cardId, setCardId } = usePageState();  // 필요한 것보다 많이 구독
  // ...
}
```

**문제점**: `CardFilter`는 `cardId`만 필요한데 `usePageState`의 모든 상태 변경에 영향을 받는다.

## 좋은 예시

```tsx
// hooks/useCardIdParam.ts
function useCardIdParam() {
  return useQueryParam('cardId');
}

// hooks/useDateRangeParam.ts
function useDateRangeParam() {
  const [startDate, setStartDate] = useQueryParam('startDate');
  const [endDate, setEndDate] = useQueryParam('endDate');
  return { startDate, endDate, setStartDate, setEndDate };
}

// hooks/useStatusListParam.ts
function useStatusListParam() {
  return useQueryParam('statusList');
}

// 컴포넌트에서는 필요한 것만 사용
function CardFilter() {
  const [cardId, setCardId] = useCardIdParam();
  // cardId 변경만 이 컴포넌트에 영향
}

function DateFilter() {
  const { startDate, endDate, setStartDate, setEndDate } = useDateRangeParam();
  // 날짜 관련 변경만 이 컴포넌트에 영향
}
```

**개선점**: 각 Hook이 단일 책임을 가져 영향 범위가 좁아진다.

## 컴포넌트에도 적용

```tsx
// Bad: 너무 많은 책임
function UserPage() {
  // 사용자 데이터 페칭
  // 사용자 프로필 렌더링
  // 사용자 설정 관리
  // 사용자 활동 로그 표시
}

// Good: 책임 분리
function UserPage() {
  return (
    <>
      <UserProfile />
      <UserSettings />
      <UserActivityLog />
    </>
  );
}
```

## 핵심 포인트

- 하나의 단위(Hook/함수/컴포넌트)는 하나의 책임만
- 여러 곳에서 사용되는 Hook은 더 작게 분리
- 수정 시 영향 범위를 좁게 유지
- 필요한 것만 구독/import

## 참고

- [Toss Frontend Fundamentals - 책임을 하나씩 관리하기](https://frontend-fundamentals.com/code-quality/en/code/examples/use-page-state-coupling)
