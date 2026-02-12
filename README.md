# WatchTogether

WatchTogether is a split frontend/backend project for managing shared watchlists.

- Frontend: Next.js app in `src/app`
- Backend: NestJS app in `src/api`

## Project Structure

```text
watch-together/
├── src/
│   ├── app/                  # Next.js App Router frontend
│   │   ├── api/health/route.ts
│   │   ├── components/
│   │   ├── config/page.tsx
│   │   ├── lists/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── search/page.tsx
│   │   └── page.tsx
│   └── api/                  # NestJS backend
│       ├── src/main.ts
│       ├── src/app.module.ts
│       └── test/
├── public/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Requirements

- Node.js 20+
- pnpm 8+ (workspace is configured with pnpm)

## Install

```bash
pnpm install
```

## Run in Development

Run both frontend and backend:

```bash
pnpm dev
```

Or run each service separately:

```bash
pnpm dev:web
pnpm dev:api
```

Default local ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## Available Scripts (root)

- `pnpm dev:web` - start Next.js frontend
- `pnpm dev:api` - start NestJS backend from the workspace package
- `pnpm dev` - start both frontend and backend concurrently
- `pnpm build` - build frontend
- `pnpm start` - run frontend in production mode
- `pnpm lint` - lint frontend

## Backend (NestJS)

Backend package path: `src/api`

Useful backend commands:

```bash
pnpm --filter watch-together-backend run dev
pnpm --filter watch-together-backend run test
pnpm --filter watch-together-backend run test:e2e
pnpm --filter watch-together-backend run build
```

## Docker

The provided Docker setup builds and serves the frontend app.

```bash
docker compose up --build
```

Notes:

- Container exposes port `3000`
- `docker-compose.yml` expects `DATABASE_URL` from `.env` or environment
