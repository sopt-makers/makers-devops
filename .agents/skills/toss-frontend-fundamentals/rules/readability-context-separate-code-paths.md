# 같이 실행되지 않는 코드 분리하기

## 요약

동시에 실행되지 않는 코드를 하나의 컴포넌트/함수에 두지 말고, 분기별로 분리하여 맥락을 줄인다.

## 문제 상황

하나의 컴포넌트에서 여러 상태(권한, 조건 등)를 모두 처리하면 코드를 읽는 사람이 한 번에 고려해야 하는 맥락이 많아진다.

## 나쁜 예시

```tsx
function SubmitButton() {
  const isViewer = useRole() === "viewer";

  useEffect(() => {
    if (isViewer) return;
    showButtonAnimation();
  }, [isViewer]);

  return isViewer ? (
    <TextButton disabled>Submit</TextButton>
  ) : (
    <Button type="submit">Submit</Button>
  );
}
```

**문제점**: `isViewer` 분기가 useEffect와 return 모두에 흩어져 있어 각 케이스를 이해하기 어렵다.

## 좋은 예시

```tsx
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function ViewerSubmitButton() {
  return <TextButton disabled>Submit</TextButton>;
}

function AdminSubmitButton() {
  useEffect(() => {
    showButtonAnimation();
  }, []);
  return <Button type="submit">Submit</Button>;
}
```

**개선점**: 각 컴포넌트가 하나의 케이스만 담당하여 맥락이 명확해진다.

## 핵심 포인트

- 분기문이 여러 곳에 흩어져 있다면 분리 신호
- 각 분기를 별도 컴포넌트/함수로 추출
- 상위에서는 어떤 케이스인지만 판단

## 참고

- [Toss Frontend Fundamentals - 같이 실행되지 않는 코드 분리하기](https://frontend-fundamentals.com/code-quality/en/code/examples/submit-button)
