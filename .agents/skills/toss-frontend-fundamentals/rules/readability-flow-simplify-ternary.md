# 삼항 연산자 단순하게 하기

## 요약

중첩된 삼항 연산자는 조건의 구조가 명확하게 보이지 않아 코드를 읽기 어렵게 만든다. if문이나 즉시 실행 함수로 대체한다.

## 문제 상황

삼항 연산자가 중첩되면 각 조건의 분기를 머릿속에서 추적해야 하며, 실수하기 쉽다.

## 나쁜 예시

```tsx
const status = hasA && hasB
  ? "BOTH"
  : hasA || hasB
    ? hasA
      ? "A_ONLY"
      : "B_ONLY"
    : "NONE";
```

**문제점**: 조건의 흐름을 파악하기 어렵고, 괄호 없이는 우선순위도 헷갈린다.

## 좋은 예시

### 방법 1: 즉시 실행 함수 (IIFE)

```tsx
const status = (() => {
  if (hasA && hasB) return "BOTH";
  if (hasA) return "A_ONLY";
  if (hasB) return "B_ONLY";
  return "NONE";
})();
```

### 방법 2: 별도 함수 추출

```tsx
function getStatus(hasA: boolean, hasB: boolean) {
  if (hasA && hasB) return "BOTH";
  if (hasA) return "A_ONLY";
  if (hasB) return "B_ONLY";
  return "NONE";
}

const status = getStatus(hasA, hasB);
```

**개선점**: 각 조건이 순차적으로 평가되어 흐름이 명확하다.

## 삼항 연산자를 사용해도 괜찮은 경우

```tsx
// 단순한 이분 조건
const label = isActive ? 'Active' : 'Inactive';

// JSX에서 간단한 조건부 렌더링
return isLoading ? <Spinner /> : <Content />;
```

## 핵심 포인트

- 삼항 연산자 중첩은 피한다 (최대 1단계)
- 복잡한 조건은 if문이나 함수로 분리
- 가독성을 위해 약간의 코드량 증가는 감수

## 참고

- [Toss Frontend Fundamentals - 삼항 연산자 단순하게 하기](https://frontend-fundamentals.com/code-quality/en/code/examples/ternary-operator)
