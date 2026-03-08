---
name: scaffold-server
description: devops 모노레포의 servers/ 하위에 새로운 서버 프로젝트를 스캐폴딩하는 스킬. TypeScript + Express + pnpm workspace 기반의 표준 아키텍처를 즉시 생성. 새 서버 추가, 서버 프로젝트 생성, 서버 보일러플레이트, scaffold, 새 서비스 셋업 요청 시 반드시 이 스킬을 활성화. "새 서버 만들어줘", "서버 추가해줘", "boilerplate 만들어줘" 같은 요청에도 적극적으로 트리거.
---

# Scaffold Server

이 스킬은 `makers-devops` 모노레포의 `servers/` 디렉토리 하위에 새로운 서버 프로젝트를 표준 아키텍처로 즉시 생성한다.

## 생성되는 파일 구조

```
servers/<server-name>/
├── package.json
├── tsconfig.json
├── Dockerfile
├── README.md
├── .env
├── .env.example
└── src/
    └── index.ts
```

**공통 기술 스택**: Node.js 22, TypeScript 5, Express 4, tsx (런타임), pnpm workspaces, Biome (lint/format), Docker

---

## 스캐폴딩 절차

### 1단계: 서버 이름 수집

사용자에게 **서버 이름**만 질문한다 (kebab-case, 예: `noti-bot`, `deploy-helper`).

이름을 받은 즉시 아래 2단계로 진행하며, 이 이름을 `{{SERVER_NAME}}`으로 표기한다.

### 2단계: 파일 생성

아래 7개 파일을 모두 생성한다. `{{SERVER_NAME}}`을 실제 서버 이름으로 치환한다.

#### `servers/{{SERVER_NAME}}/package.json`

```json
{
  "name": "@makers-devops/{{SERVER_NAME}}",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "tsx --watch src/index.ts",
    "start": "tsx src/index.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "dotenv": "^16.4.0",
    "express": "^4.21.0",
    "tsx": "^4.19.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/express": "^5.0.0"
  }
}
```

#### `servers/{{SERVER_NAME}}/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"]
}
```

#### `servers/{{SERVER_NAME}}/Dockerfile`

```dockerfile
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY servers/{{SERVER_NAME}}/package.json ./servers/{{SERVER_NAME}}/package.json

RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app/servers/{{SERVER_NAME}}

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/servers/{{SERVER_NAME}}/node_modules ./node_modules

COPY . .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "-F=@makers-devops/{{SERVER_NAME}}", "start"]
```

#### `servers/{{SERVER_NAME}}/README.md`

```markdown
# {{SERVER_NAME}}

> TODO: 서버 설명을 작성하세요.

## 개발 환경 실행

\`\`\`bash

# 의존성 설치 (루트에서)

pnpm install

# 개발 서버 실행

pnpm -F=@makers-devops/{{SERVER_NAME}} dev
\`\`\`

## 환경변수

`.env.example`을 참고하여 `.env` 파일을 생성하세요.
```

#### `servers/{{SERVER_NAME}}/.env`

```
PORT=3000
```

#### `servers/{{SERVER_NAME}}/.env.example`

```
PORT=3000
```

#### `servers/{{SERVER_NAME}}/src/index.ts`

```typescript
import "dotenv/config";
import express from "express";

async function main() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`{{SERVER_NAME}} server running on port:${port}`);
  });
}

main();
```

### 3단계: 생성 완료 안내

모든 파일 생성 후 아래 내용을 안내한다:

1. **생성된 파일 목록** 요약
2. **다음 실행 커맨드**:
   ```bash
   pnpm install
   pnpm -F=@makers-devops/{{SERVER_NAME}} dev
   ```
3. `.env`에 필요한 환경변수를 추가하고, 동일하게 `.env.example`에도 키만 명세해 둘 것 안내

---

## 주의사항

- `pnpm-workspace.yaml`과 루트 `package.json`의 `workspaces`는 이미 `servers/*`를 포함하므로 수정 불필요
- `.env`는 gitignore 처리되어 있으므로 커밋되지 않음
- 서버 이름은 반드시 kebab-case (예: `noti-bot` O, `notiBot` X)
- Biome 린트/포맷은 루트 `biome.json` 설정이 전체 워크스페이스에 자동 적용됨
