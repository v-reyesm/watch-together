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

Optional local git hooks with `pre-commit`:

Install the `pre-commit` CLI first, for example with `pipx install pre-commit` or `brew install pre-commit`.

```bash
pre-commit install --hook-type pre-commit --hook-type pre-push
```

Configured hooks:

- `pre-commit`: frontend lint + API lint
- `pre-push`: frontend typecheck + API typecheck

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
- `pnpm test:e2e:web` - run Playwright browser tests
- `pnpm test:e2e:web:headed` - run Playwright in headed mode
- `pnpm test:e2e:web:ui` - open the Playwright UI runner

## Backend (NestJS)

Backend package path: `src/api`

Useful backend commands:

```bash
pnpm --filter watch-together-backend run dev
pnpm --filter watch-together-backend run test
pnpm --filter watch-together-backend run test:e2e
pnpm --filter watch-together-backend run build
```

## Frontend E2E

Playwright is configured for browser end-to-end tests under `tests/e2e`, grouped by domain.

Current structure:

```text
tests/
└── e2e/
    └── auth/
        └── auth.spec.ts
```

The initial `auth` flow covers:

- guest redirect from a protected route to `/sign-in`
- sign-in through the web form
- sign-out from the profile page

These browser tests mock API responses in the page layer, so they are fast and stable while the backend evolves independently.

## Docker

The Docker Compose setup runs three services together:

- `frontend` (Next.js) on port `3000`
- `backend` (NestJS) on port `8080`
- `postgres` on port `5432`

```bash
docker compose up --build
```

Notes:

- Postgres data is persisted in the `postgres_data` volume.
- `DATABASE_URL` is wired to the `postgres` service for both frontend and backend containers.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Each deployment needs its own [TMDB API key](https://www.themoviedb.org/documentation/api).

## License

This project is licensed under the [MIT License](LICENSE).
