# jeongho-nest

Nest 11 API와 Next.js 웹 앱을 pnpm workspace와 Turborepo로 관리하는 학습용 모노레포입니다.

## 구조

```text
apps/
└─ board/               게시판 서비스
   ├─ api/               Nest 11 + TypeORM API
   └─ web/               Next.js App Router + Tailwind CSS 4

packages/
├─ db/                  TypeORM 엔티티와 migration DataSource
├─ eslint-config/       Nest·Next 공통 ESLint 규칙
├─ tailwind-config/     공통 Tailwind 디자인 토큰
└─ tsconfig/            공통 TypeScript 설정
```

## 실행

```bash
corepack enable
pnpm install
```

기존 로컬 PostgreSQL을 사용할 때는 아래 명령으로 Nest API와 Next 앱을 함께 실행합니다.

```bash
pnpm dev
```

Docker PostgreSQL과 API를 함께 실행할 때는 아래처럼 실행한 뒤, Next 앱만 별도로 실행합니다.

```bash
docker compose up -d --build
pnpm --filter @jeongho-nest/web dev
```

- Next 웹: `http://localhost:3001`
- Nest API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

Next 웹의 `/api` 요청은 `apps/board/web/next.config.ts`의 rewrite를 통해 Nest API로 전달됩니다.

## 주요 명령어

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format:check
pnpm format:write
```

TypeORM migration 명령은 `packages/db`의 DataSource 설정을 사용합니다.

```bash
pnpm db:migration:generate
pnpm db:migration:run
```
