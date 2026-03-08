# 로직 종류에 따라 함수 쪼개기

## 요약

하나의 함수가 여러 종류의 로직(데이터 가공, UI 렌더링, 부수 효과 등)을 처리하면, 로직 종류별로 함수를 분리한다.

## 문제 상황

함수가 너무 많은 책임을 가지면 수정할 때 영향 범위를 파악하기 어렵고, 테스트하기도 힘들다.

## 나쁜 예시

```tsx
function useUserDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const userData = await fetchUser();
      const statsData = await fetchStats(userData.id);

      // 데이터 가공
      const processedStats = {
        ...statsData,
        averageScore: statsData.totalScore / statsData.count,
        rank: calculateRank(statsData),
      };

      setUser(userData);
      setStats(processedStats);
      setIsLoading(false);

      // 로깅
      logPageView('dashboard', userData.id);
    }
    loadData();
  }, []);

  return { user, stats, isLoading };
}
```

**문제점**: 데이터 페칭, 가공, 상태 관리, 로깅이 한 곳에 혼재되어 있다.

## 좋은 예시

```tsx
function useUserDashboard() {
  const user = useUser();
  const stats = useUserStats(user?.id);
  const processedStats = useProcessedStats(stats);

  usePageViewLog('dashboard', user?.id);

  return {
    user,
    stats: processedStats,
    isLoading: !user || !stats,
  };
}

function useUser() {
  // 사용자 데이터 페칭만 담당
}

function useUserStats(userId: string | undefined) {
  // 통계 데이터 페칭만 담당
}

function useProcessedStats(stats: Stats | null) {
  // 데이터 가공만 담당
  return useMemo(() => {
    if (!stats) return null;
    return {
      ...stats,
      averageScore: stats.totalScore / stats.count,
      rank: calculateRank(stats),
    };
  }, [stats]);
}

function usePageViewLog(page: string, userId?: string) {
  // 로깅만 담당
}
```

**개선점**: 각 Hook이 단일 책임을 가지며, 조합하여 사용한다.

## 핵심 포인트

- 데이터 페칭, 가공, 부수 효과를 분리
- 각 함수/Hook은 한 가지 일만 수행
- 조합(Composition)으로 복잡한 로직 구성

## 참고

- [Toss Frontend Fundamentals - 로직 종류에 따라 합쳐진 함수 쪼개기](https://frontend-fundamentals.com/code-quality/en/)
