FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY servers/mumu/package.json ./servers/mumu/package.json

RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app/servers/mumu

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/servers/mumu/node_modules ./node_modules

COPY . .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "-F=@makers-devops/mumu", "start"]
