# 기준 간 트레이드오프

> "이 4가지 기준을 모두 한꺼번에 충족하기는 어려워요."
> — Toss Frontend Fundamentals

## 개요

가독성, 예측 가능성, 응집도, 결합도 4가지 기준은 때때로 서로 충돌한다. 상황에 따라 어떤 기준을 우선할지 판단이 필요하다.

## 일반적인 우선순위

```
가독성 > 예측 가능성 > 응집도 > 결합도
```

이유: 코드는 쓰는 시간보다 읽는 시간이 훨씬 많다. 가독성이 떨어지면 다른 모든 것이 의미 없어진다.

## 흔한 트레이드오프 상황

### 1. 가독성 vs 응집도

**상황**: 관련 코드를 모으면 파일이 너무 길어진다.

```tsx
// 응집도 우선: 한 파일에 모두
// UserProfile.tsx (500줄)
function UserProfile() { ... }
function useUserData() { ... }
function formatUserInfo() { ... }
const USER_CONSTANTS = { ... };
```

```tsx
// 가독성 우선: 분리
// UserProfile.tsx (100줄)
// useUserData.ts (80줄)
// userUtils.ts (50줄)
// userConstants.ts (20줄)
```

**판단 기준**: 파일이 200줄을 넘어가면 분리 고려. 단, 같은 폴더에 두어 응집도 유지.

### 2. 응집도 vs 결합도

**상황**: 코드를 한 곳에 모으면 그 모듈에 대한 의존성이 높아진다.

```tsx
// 응집도 우선: 모든 사용자 로직을 한 Hook에
function useUser() {
  // 사용자 데이터, 권한, 설정, 알림 등 모두 관리
  return { user, permissions, settings, notifications };
}

// 결합도 우선: 역할별로 분리
function useUser() { return user; }
function usePermissions() { return permissions; }
function useSettings() { return settings; }
```

**판단 기준**: 함께 변경되는 빈도를 확인. 항상 함께 변경되면 응집도 우선, 독립적으로 변경되면 결합도 우선.

### 3. 가독성 vs 결합도

**상황**: 코드를 이해하기 쉽게 인라인하면 중복이 생기고, 추상화하면 읽기 어려워진다.

```tsx
// 가독성 우선: 인라인
function ProductCard({ product }) {
  const isAvailable = product.stock > 0 && !product.isDiscontinued;
  // 의도가 명확하지만 여러 곳에 중복될 수 있음
}

// 결합도 우선: 추상화
function ProductCard({ product }) {
  const isAvailable = checkAvailability(product);
  // 한 곳에서 관리되지만 구현을 보러 가야 함
}
```

**판단 기준**: 비즈니스 규칙이면 추상화(버그 수정 시 한 곳만 고치면 됨), 단순 조건이면 인라인.

### 4. 예측 가능성 vs 응집도

**상황**: 일관된 패턴을 따르면 관련 코드가 흩어진다.

```tsx
// 예측 가능성 우선: 타입별 분류
/hooks/useUser.ts
/hooks/useProduct.ts
/components/UserCard.tsx
/components/ProductCard.tsx

// 응집도 우선: 기능별 분류
/features/user/useUser.ts
/features/user/UserCard.tsx
/features/product/useProduct.ts
/features/product/ProductCard.tsx
```

**판단 기준**: 팀 컨벤션에 따라. 단, 기능별 분류가 일반적으로 더 나은 경우가 많음.

## 판단 프레임워크

트레이드오프 상황에서 다음 질문을 던져보세요:

1. **변경 빈도**: 이 코드들이 함께 변경되는가?
2. **이해 비용**: 새로운 팀원이 이해하는 데 얼마나 걸릴까?
3. **버그 위험**: 어떤 구조가 실수를 줄여줄까?
4. **테스트 용이성**: 어떤 구조가 테스트하기 쉬운가?

## 결론

정답은 없다. 상황과 맥락에 따라 판단하되, 결정의 이유를 팀과 공유하고 일관성을 유지하는 것이 중요하다.

## 참고

- [Toss Frontend Fundamentals](https://frontend-fundamentals.com)
- [GitHub Discussions](https://github.com/toss/frontend-fundamentals/discussions)
