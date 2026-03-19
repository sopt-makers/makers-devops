FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/redis/package.json ./packages/redis/
COPY servers/mumu/package.json ./servers/mumu/

RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app ./

COPY packages/redis ./packages/redis
COPY servers/mumu ./servers/mumu

EXPOSE 3000
CMD ["pnpm", "-F=@makers-devops/mumu", "start"]
