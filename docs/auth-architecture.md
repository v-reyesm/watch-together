# Authentication Architecture

## Strategy

**JWT (JSON Web Tokens)** — The NestJS API is the single authority that issues and validates all JWTs. Both email+password and Google OAuth flows produce the same JWT format.

## Auth Flow

```
Browser                        Next.js Frontend              NestJS API
  │                                │                            │
  │── Sign in (email/pass) ───────>│                            │
  │                                │── POST /api/auth/login ──>│
  │                                │<── { accessToken } ───────│
  │                                │                            │
  │── Sign in with Google ────────>│                            │
  │   (Google ID token)            │── POST /api/auth/google ─>│
  │                                │<── { accessToken } ───────│
  │                                │                            │
  │── Register ───────────────────>│                            │
  │                                │── POST /api/auth/register>│
  │                                │<── { accessToken } ───────│
  │                                │                            │
  │── Any protected action ───────>│                            │
  │                                │── GET /api/... ──────────>│
  │                                │   Authorization: Bearer T  │
  │                                │<── 200 / 401 ────────────│
```

## Decisions

| Area | Decision |
|------|----------|
| Token type | JWT signed with HS256 and `JWT_SECRET` from env |
| Token issuer | NestJS API only |
| Token payload | `{ sub: userId, email }` — minimal, no sensitive data |
| Token expiry | Configurable via `JWT_EXPIRES_IN` (default: `24h` for MVP) |
| Refresh token | **Not in MVP** — when JWT expires the user signs in again |
| Token storage (frontend) | In-memory (React state/context) + sessionStorage for persistence across refreshes |
| Token transport | `Authorization: Bearer <token>` header on every API request |
| Cookie session | Not used |
| CSRF | Not needed (no cookie-based auth) |

## Sign-in Methods

### Email + Password
1. User submits email + password to `POST /api/auth/login`
2. API finds user by email, compares password hash (bcrypt, constant-time)
3. On success, returns `{ accessToken }` (JWT)
4. On failure, returns generic 401 ("Credenciales inválidas") to prevent user enumeration

### Registration (Email + Password)
1. User submits email, password, name to `POST /api/auth/register`
2. API validates input (email format, password >= 8 chars, name length)
3. Checks email uniqueness, hashes password with bcrypt (cost factor 10)
4. Creates user record, returns `{ accessToken }` (JWT)

### Google OAuth
1. Frontend obtains Google ID token (via Google Identity Services)
2. Frontend sends `{ idToken }` to `POST /api/auth/google`
3. API verifies ID token with Google (signature, expiry, audience = `GOOGLE_CLIENT_ID`)
4. Extracts `sub`, `email`, `name`, `picture` from token
5. Finds user by `googleId` (sub) or creates new user
6. Returns `{ accessToken }` (same JWT format)

## Security

- Passwords hashed with bcrypt (cost 10); never logged or returned in responses
- JWT secret must be high-entropy, loaded from `JWT_SECRET` env var
- Rate limiting on auth endpoints (login, register, google) to prevent brute-force
- Generic error messages on login failure to prevent user enumeration
- Google ID token verified for signature, expiry, and audience before trusting
- Security headers via Helmet; CORS with explicit origins
- HTTPS required in production (OAuth + PWA requirement)

## Session Expiry

- Expired JWT → API returns 401
- Frontend intercepts 401, clears stored token, redirects to `/sign-in`
- Optional message: "Sesión expirada" (Spanish-first)

## Account Deletion (MVP)

No self-service account deletion in MVP. Removal is manual (DB or admin). Existing foreign keys define cascade behavior for lists, invites, and watch events.

## Out of Scope (MVP)

- Email verification
- Forgot / reset password
- Refresh tokens
- Self-service account deletion
