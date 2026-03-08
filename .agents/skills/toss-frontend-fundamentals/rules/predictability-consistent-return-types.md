# 같은 종류의 함수는 반환 타입 통일하기

## 요약

비슷한 역할을 하는 함수들은 일관된 반환 타입을 가져야 사용하는 쪽에서 예측 가능하다.

## 문제 상황

같은 종류의 함수가 다른 반환 타입을 가지면, 사용할 때마다 반환 타입을 확인해야 하고 실수가 발생하기 쉽다.

## 나쁜 예시

```tsx
// 일관성 없는 반환 타입
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}

async function fetchProducts(): Promise<{ data: Product[]; total: number }> {
  const res = await fetch('/api/products');
  return res.json();
}

async function fetchOrders(): Promise<Order[] | null> {
  const res = await fetch('/api/orders');
  if (!res.ok) return null;
  return res.json();
}
```

**문제점**: 각 함수의 반환 타입이 달라서 사용 패턴이 일관되지 않다.

## 좋은 예시

```tsx
// 일관된 반환 타입 정의
interface ApiResponse<T> {
  data: T;
  error: Error | null;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    return { data: null as any, error: error as Error };
  }
}

async function fetchProducts(): Promise<ApiResponse<Product[]>> {
  // 같은 패턴
}

async function fetchOrders(): Promise<ApiResponse<Order[]>> {
  // 같은 패턴
}
```

## Hook 예시

```tsx
// Bad: 일관성 없음
function useUser() {
  return { user, loading, error };
}

function useProducts() {
  return [products, isLoading];  // 배열 반환
}

// Good: 일관된 반환 형태
function useUser() {
  return { data: user, isLoading, error };
}

function useProducts() {
  return { data: products, isLoading, error };
}
```

## 핵심 포인트

- 같은 카테고리의 함수는 같은 반환 타입 사용
- 공통 인터페이스/타입 정의
- 에러 처리 방식도 통일 (throw vs return)
- TypeScript 제네릭 활용

## 참고

- [Toss Frontend Fundamentals - 같은 종류의 함수는 반환 타입 통일하기](https://frontend-fundamentals.com/code-quality/en/)
