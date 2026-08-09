FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci

COPY . .
RUN npm run build --workspace=@jeongho-nest/api

FROM node:24-bookworm-slim AS runner

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --omit=dev

COPY --from=builder /app/apps/api/dist apps/api/dist

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
