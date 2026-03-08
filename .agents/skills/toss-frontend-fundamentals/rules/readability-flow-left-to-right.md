# 왼쪽에서 오른쪽으로 읽히게 하기

## 요약

코드는 자연어처럼 왼쪽에서 오른쪽으로 읽힐 때 가장 이해하기 쉽다. 비교문의 순서, 체이닝, 변수 배치를 고려한다.

## 문제 상황

비교문에서 상수가 왼쪽에 오거나(Yoda 조건), 깊은 중첩으로 핵심 로직이 오른쪽 끝에 숨어있으면 읽기 어렵다.

## 나쁜 예시

### Yoda 조건

```tsx
// Bad: 상수가 왼쪽
if (null === user) { ... }
if (18 <= age) { ... }

// Good: 변수가 왼쪽
if (user === null) { ... }
if (age >= 18) { ... }
```

### 깊은 체이닝

```tsx
// Bad: 핵심 로직이 맨 끝에
const result = data
  .filter(x => x.active)
  .map(x => x.value)
  .reduce((acc, val) => acc + val, 0)
  .toString()
  .padStart(5, '0');
```

## 좋은 예시

```tsx
// 의미 있는 중간 변수로 분리
const activeValues = data
  .filter(x => x.active)
  .map(x => x.value);

const total = activeValues.reduce((acc, val) => acc + val, 0);
const formattedTotal = total.toString().padStart(5, '0');
```

**개선점**: 각 단계의 의미가 명확하고, 디버깅도 쉽다.

## 조건문 순서

```tsx
// Bad: 부정 조건이 먼저
if (!isValid) {
  handleInvalid();
} else {
  handleValid();
}

// Good: 긍정 조건이 먼저 (주요 흐름)
if (isValid) {
  handleValid();
} else {
  handleInvalid();
}
```

## 핵심 포인트

- 비교문: 변수 왼쪽, 상수 오른쪽
- 조건문: 주요 케이스(긍정)를 먼저
- 체이닝: 너무 길면 중간 변수로 분리
- Early return으로 중첩 줄이기

## 참고

- [Toss Frontend Fundamentals - 왼쪽에서 오른쪽으로 읽히게 하기](https://frontend-fundamentals.com/code-quality/en/code/examples/comparison-order)
