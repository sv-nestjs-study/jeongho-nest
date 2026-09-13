FROM node:24-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/board/api/package.json apps/board/api/package.json
COPY apps/board/web/package.json apps/board/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/tailwind-config/package.json packages/tailwind-config/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @jeongho-nest/db build && pnpm --filter @jeongho-nest/api build
RUN pnpm --filter @jeongho-nest/api deploy --legacy --prod /production

FROM node:24-bookworm-slim AS runner

WORKDIR /app

COPY --from=builder /production ./apps/board/api
COPY --from=builder /app/packages/db/dist ./packages/db/dist
RUN ln -s ../../apps/board/api/node_modules ./packages/db/node_modules

EXPOSE 3000

CMD ["node", "apps/board/api/dist/main"]
