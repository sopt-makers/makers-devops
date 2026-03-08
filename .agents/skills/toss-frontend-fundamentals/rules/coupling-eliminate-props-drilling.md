# Props Drilling 지우기

## 요약

여러 컴포넌트 계층을 통해 props를 전달하는 "Props Drilling"은 중간 컴포넌트들의 결합도를 높인다. Context, 상태 관리 라이브러리, 또는 컴포넌트 구조 변경으로 해결한다.

## 문제 상황

Props Drilling이 발생하면 중간 컴포넌트들이 실제로 사용하지 않는 props를 전달만 하게 되어, 불필요한 의존성이 생긴다.

## 나쁜 예시

```tsx
function App() {
  const user = useUser();
  return <Layout user={user} />;
}

function Layout({ user }) {
  return (
    <div>
      <Header user={user} />
      <Main user={user} />
    </div>
  );
}

function Header({ user }) {
  return (
    <header>
      <Logo />
      <UserMenu user={user} />
    </header>
  );
}

function UserMenu({ user }) {
  return <span>{user.name}</span>;  // 실제 사용처
}
```

**문제점**: `Layout`, `Header`는 `user`를 사용하지 않지만 전달해야 한다.

## 좋은 예시

### 방법 1: Context 사용

```tsx
const UserContext = createContext<User | null>(null);

function App() {
  const user = useUser();
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

function Layout() {
  return (
    <div>
      <Header />
      <Main />
    </div>
  );
}

function UserMenu() {
  const user = useContext(UserContext);
  return <span>{user?.name}</span>;
}
```

### 방법 2: Composition 패턴

```tsx
function App() {
  const user = useUser();

  return (
    <Layout
      header={<Header userMenu={<UserMenu user={user} />} />}
      main={<Main />}
    />
  );
}

function Layout({ header, main }) {
  return (
    <div>
      {header}
      {main}
    </div>
  );
}

function Header({ userMenu }) {
  return (
    <header>
      <Logo />
      {userMenu}
    </header>
  );
}
```

### 방법 3: 커스텀 Hook (상태 관리 라이브러리)

```tsx
// Zustand, Jotai, Recoil 등 사용
function UserMenu() {
  const user = useUserStore(state => state.user);
  return <span>{user.name}</span>;
}
```

## Props Drilling 해결 판단 기준

| 상황 | 해결 방법 |
|------|----------|
| 2-3단계, 자주 변경되지 않는 데이터 | Props 유지해도 됨 |
| 4단계 이상, 여러 곳에서 사용 | Context 고려 |
| 앱 전역 상태 | 상태 관리 라이브러리 |
| 특정 컴포넌트 트리에서만 사용 | Composition 패턴 |

## 핵심 포인트

- Props Drilling 자체가 항상 나쁜 것은 아님
- 중간 컴포넌트가 해당 props를 알 필요가 없다면 문제
- Context는 자주 변경되는 값에는 부적합 (리렌더링)
- Composition으로 구조 자체를 개선하는 것도 방법

## 참고

- [Toss Frontend Fundamentals - Props Drilling 지우기](https://frontend-fundamentals.com/code-quality/en/)
