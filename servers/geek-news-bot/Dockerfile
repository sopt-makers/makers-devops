FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/ ./packages/
COPY servers/geek-news-bot/package.json ./servers/geek-news-bot/package.json

RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app ./

COPY packages/ ./packages/
COPY servers/geek-news-bot ./servers/geek-news-bot

CMD ["pnpm", "-F=@makers-devops/geek-news-bot", "start"]
