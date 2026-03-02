FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY . .

RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /app/servers/mumu
CMD ["pnpm", "start"]
