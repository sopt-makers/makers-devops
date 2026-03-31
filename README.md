## Makers Devops

SOPT Makers 팀의 DevOps 자동화 서버들을 관리하는 pnpm 모노레포입니다.

## 기술 스택

- **Runtime**: Node.js + TypeScript
- **Package Manager**: pnpm (workspace)
- **Linter / Formatter**: Biome
- **Git Hooks**: Husky + lint-staged

## Skills

AI Agent가 활용할 수 있는 스킬 목록입니다. `.agents/skills/` 디렉토리에서 관리됩니다.

| 스킬                         | 설명                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `create-devops-pr`           | devops 모노레포에서 일관된 형식(`type [scope]: description`)의 PR을 자동 생성                           |
| `scaffold-server`            | `servers/` 하위에 TypeScript + Express + pnpm workspace 기반의 서버 프로젝트를 표준 구조로 스캐폴딩     |
| `toss-frontend-fundamentals` | 토스 Frontend Fundamentals 기반으로 가독성·예측 가능성·응집도·결합도 4가지 기준의 코드 품질 피드백 제공 |
