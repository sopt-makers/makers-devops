# 함께 수정되는 파일을 같은 디렉토리에 두기

## 요약

함께 수정될 가능성이 높은 파일들은 같은 디렉토리에 배치한다. 파일 간 거리가 가까울수록 수정 범위를 파악하기 쉽다.

## 문제 상황

기능별이 아닌 타입별로 파일을 분류하면, 하나의 기능을 수정할 때 여러 디렉토리를 넘나들어야 한다.

## 나쁜 예시

```
src/
├── components/
│   ├── UserProfile.tsx
│   ├── UserAvatar.tsx
│   └── ProductCard.tsx
├── hooks/
│   ├── useUser.ts
│   └── useProduct.ts
├── types/
│   ├── user.ts
│   └── product.ts
└── utils/
    ├── userUtils.ts
    └── productUtils.ts
```

**문제점**: User 관련 수정 시 4개 디렉토리를 오가야 한다.

## 좋은 예시

```
src/
├── features/
│   ├── user/
│   │   ├── components/
│   │   │   ├── UserProfile.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── hooks/
│   │   │   └── useUser.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   └── product/
│       ├── components/
│       │   └── ProductCard.tsx
│       ├── hooks/
│       │   └── useProduct.ts
│       ├── types.ts
│       └── index.ts
└── shared/
    └── components/
        └── Button.tsx
```

**개선점**: User 관련 파일이 한 곳에 모여 있어 수정 범위를 쉽게 파악할 수 있다.

## 컴포넌트 레벨에서도 적용

```
// Bad
src/
├── components/
│   └── Modal.tsx
├── styles/
│   └── Modal.css
└── tests/
    └── Modal.test.tsx

// Good
src/
└── components/
    └── Modal/
        ├── Modal.tsx
        ├── Modal.css
        ├── Modal.test.tsx
        └── index.ts
```

## 핵심 포인트

- 기능(Feature) 기반 디렉토리 구조 채택
- 함께 변경되는 파일은 가까이 배치
- 공유되는 코드만 별도 `shared/` 디렉토리로 분리
- 컴포넌트, 스타일, 테스트를 함께 배치

## 참고

- [Toss Frontend Fundamentals - 함께 수정되는 파일을 같은 디렉토리에 두기](https://frontend-fundamentals.com/code-quality/en/code/examples/code-directory)
