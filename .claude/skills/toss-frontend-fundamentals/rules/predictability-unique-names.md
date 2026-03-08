# 이름 겹치지 않게 관리하기

## 요약

같은 스코프나 프로젝트 내에서 비슷한 역할을 하는 것들이 다른 이름을 가지거나, 다른 역할을 하는 것들이 같은 이름을 가지면 혼란을 초래한다.

## 문제 상황

이름이 겹치면 코드를 읽을 때 어떤 것을 가리키는지 추론해야 하고, 실수로 잘못된 것을 사용할 수 있다.

## 나쁜 예시

### 같은 이름, 다른 의미

```tsx
// api/user.ts
export function getUser(id: string) {
  return fetch(`/api/users/${id}`);
}

// hooks/user.ts
export function getUser(id: string) {
  const { data } = useSWR(`/api/users/${id}`);
  return data;
}

// 사용처에서 혼란
import { getUser } from '@/api/user';    // fetch 버전
import { getUser } from '@/hooks/user';  // hook 버전 - 충돌!
```

### 비슷한 역할, 다른 이름

```tsx
// 일관성 없는 네이밍
const fetchUser = () => { ... };
const getProducts = () => { ... };
const loadOrders = () => { ... };
const retrievePayments = () => { ... };
```

## 좋은 예시

```tsx
// 역할에 따라 명확한 접두사/접미사 사용
// API 함수
export function fetchUser(id: string) { ... }
export function fetchProducts() { ... }

// React Hooks
export function useUser(id: string) { ... }
export function useProducts() { ... }

// 유틸리티
export function formatUserName(user: User) { ... }
export function calculateTotal(items: Item[]) { ... }
```

## 네이밍 컨벤션 예시

| 역할 | 컨벤션 | 예시 |
|------|--------|------|
| API 호출 | `fetch*`, `post*`, `delete*` | `fetchUser`, `postComment` |
| React Hook | `use*` | `useUser`, `useAuth` |
| 이벤트 핸들러 | `handle*`, `on*` | `handleClick`, `onSubmit` |
| Boolean 변수 | `is*`, `has*`, `should*` | `isLoading`, `hasError` |
| 변환 함수 | `format*`, `parse*`, `to*` | `formatDate`, `toJSON` |

## 핵심 포인트

- 프로젝트 전체에서 일관된 네이밍 컨벤션 사용
- 역할이 다르면 이름도 다르게
- import 충돌이 발생하지 않도록 설계
- 팀과 컨벤션 합의하고 문서화

## 참고

- [Toss Frontend Fundamentals - 이름 겹치지 않게 관리하기](https://frontend-fundamentals.com/code-quality/en/)
