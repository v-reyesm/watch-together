# Deployment Guide

## Architecture overview

WatchTogether runs three containers:

| Service    | Image base       | Port | Description              |
| ---------- | ---------------- | ---- | ------------------------ |
| `frontend` | node:20-alpine   | 3000 | Next.js 15 (standalone)  |
| `backend`  | node:20-alpine   | 8080 | NestJS API               |
| `postgres` | postgres:16-alpine | 5432 | PostgreSQL database      |

## Environment variables

### Frontend (Next.js)

| Variable                       | Required | Description                         |
| ------------------------------ | -------- | ----------------------------------- |
| `NEXT_PUBLIC_API_URL`          | yes      | Backend URL, no trailing slash (e.g. `https://api.example.com`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | yes      | Google OAuth client ID              |
| `NODE_ENV`                     | yes      | Set to `production`                 |

### Backend (NestJS)

| Variable         | Required | Description                                   |
| ---------------- | -------- | --------------------------------------------- |
| `DB_HOST`        | yes      | Database host (`postgres` in Docker network)  |
| `DB_PORT`        | yes      | Database port (`5432`)                        |
| `DB_USERNAME`    | yes      | Database user                                 |
| `DB_PASSWORD`    | yes      | Database password                             |
| `DB_NAME`        | yes      | Database name                                 |
| `JWT_SECRET`     | yes      | Secret for signing JWT tokens — use a long random string |
| `JWT_EXPIRES_IN` | no       | JWT lifetime, defaults to `24h`               |
| `GOOGLE_CLIENT_ID` | yes    | Google OAuth client ID, used to verify ID tokens server-side. Must match the frontend's `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| `CORS_ORIGIN`    | no       | Frontend origin (e.g. `https://app.example.com`). Defaults to `http://localhost:3000`, so always set it in production |
| `TMDB_API_KEY`   | yes      | TMDB v3 API key for media search              |
| `TMDB_BASE_URL`  | yes      | TMDB API base URL (`https://api.themoviedb.org/3`) |
| `PORT`           | no       | Defaults to `8080`                            |

### PostgreSQL

| Variable            | Required | Description      |
| ------------------- | -------- | ---------------- |
| `POSTGRES_DB`       | yes      | Database name    |
| `POSTGRES_USER`     | yes      | Database user    |
| `POSTGRES_PASSWORD` | yes      | Database password |

## Docker Compose for production

The included `docker-compose.yml` works for production with two changes:

1. **Replace default credentials** — the compose file ships with `watchtogether`/`watchtogether` for convenience. Override via a `.env` file or environment variables.
2. **Create `src/api/.env`** — the backend reads its env file for `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `TMDB_API_KEY`, and `CORS_ORIGIN`.

```bash
# Build and start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

The PostgreSQL data is persisted in the `postgres_data` named volume.

## Reverse proxy with Caddy

HTTPS is a hard requirement in production, not a nice-to-have: Google OAuth only accepts plain-HTTP origins/redirects on `localhost`, and PWA installability plus service workers require a secure context. Everything below assumes the app is served over HTTPS.

Caddy provides automatic HTTPS via Let's Encrypt. Install Caddy on the host and create a `Caddyfile`:

```caddyfile
app.example.com {
    reverse_proxy localhost:3000
}

api.example.com {
    reverse_proxy localhost:8080
}
```

Then run:

```bash
sudo caddy start
```

Caddy will automatically obtain and renew TLS certificates. Set `NEXT_PUBLIC_API_URL=https://api.example.com` and `CORS_ORIGIN=https://app.example.com` accordingly.

### Alternative: single domain

If you prefer a single domain, route `/api/*` to the backend:

```caddyfile
example.com {
    handle /api/* {
        reverse_proxy localhost:8080
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

With this setup, set `NEXT_PUBLIC_API_URL=https://example.com` and `CORS_ORIGIN=https://example.com`.

## PostgreSQL backups

### Automated daily backup

Create a cron job on the host:

```bash
# /etc/cron.d/watchtogether-backup
0 3 * * * root docker compose -f /path/to/docker-compose.yml exec -T postgres pg_dump -U watchtogether watchtogether | gzip > /backups/watchtogether-$(date +\%Y\%m\%d).sql.gz
```

### Manual backup and restore

```bash
# Backup
docker compose exec -T postgres pg_dump -U watchtogether watchtogether > backup.sql

# Restore
docker compose exec -T postgres psql -U watchtogether watchtogether < backup.sql
```

### Retention

Add a cleanup step to keep the last 30 days:

```bash
find /backups -name "watchtogether-*.sql.gz" -mtime +30 -delete
```

## Health endpoints

Both services expose health checks:

| Service  | Endpoint          | Expected response |
| -------- | ----------------- | ----------------- |
| Frontend | `GET /api/health` | `200 OK`          |
| Backend  | `GET /api/health` | `200 OK`          |

The PostgreSQL container has a built-in healthcheck via `pg_isready`.

### Monitoring

Use the health endpoints with any uptime monitor (UptimeRobot, Uptime Kuma, etc.):

```bash
# Quick check from host
curl -sf http://localhost:3000/api/health && echo "frontend ok"
curl -sf http://localhost:8080/api/health && echo "backend ok"
```

Note that Docker's built-in healthcheck only marks a container as `unhealthy` — it does **not** restart it. `restart: unless-stopped` reacts to the process exiting, not to health status. If you want automatic restarts on `unhealthy`, run a helper such as [autoheal](https://github.com/willfarrell/docker-autoheal), or rely on your uptime monitor to alert you.

## Updating

```bash
git pull
docker compose up -d --build
```

TypeORM still runs with `synchronize: false`, but the backend now applies pending migrations automatically during startup. After pulling a version that includes new migrations, `docker compose up -d --build` is enough as long as the backend container starts successfully.
