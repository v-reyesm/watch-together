# API Auth Contract

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <token>`.

## Auth Endpoints (public)

### POST /api/auth/register
Register a new user with email and password.

**Body:**
```json
{ "email": "user@example.com", "password": "secureP@ss1", "name": "Victor" }
```

**Responses:**
- `201` — `{ "accessToken": "jwt..." }`
- `400` — Validation error (email format, password < 8 chars, missing name)
- `409` — Email already registered

### POST /api/auth/login
Log in with email and password.

**Body:**
```json
{ "email": "user@example.com", "password": "secureP@ss1" }
```

**Responses:**
- `200` — `{ "accessToken": "jwt..." }`
- `401` — `{ "message": "Credenciales inválidas" }` (generic, no user enumeration)

### POST /api/auth/google
Exchange a Google ID token for a JWT.

**Body:**
```json
{ "idToken": "google-id-token..." }
```

**Responses:**
- `200` — `{ "accessToken": "jwt..." }`
- `401` — `{ "message": "Token de Google inválido" }`

## Protected Endpoints

### GET /api/users/me
Returns the authenticated user's profile.

**Responses:**
- `200` — `{ "id": 1, "email": "...", "name": "...", "avatarUrl": "..." | null, "createdAt": "..." }`
- `401` — Unauthorized

### PATCH /api/users/me
Update the authenticated user's profile.

**Body:**
```json
{ "name": "New Name" }
```

**Responses:**
- `200` — Updated user object (same shape as GET)
- `401` — Unauthorized

## Standard Error Format

All API errors follow this shape:

```json
{
  "statusCode": 400,
  "message": "Human-readable message",
  "errors": [{ "message": "Field-level error" }]
}
```

- `401` — Missing or invalid JWT
- `403` — Valid JWT but insufficient permissions (e.g. not a list member)
- `429` — Rate limit exceeded ("Intenta más tarde")

## Rate Limiting

Auth endpoints (`/api/auth/*`) are rate-limited:
- Short window: 20 requests / 60s
- Long window: 100 requests / 600s

Exceeded limits return `429 Too Many Requests`.

## Interactive Docs

Swagger / Scalar UI is available at `/api/docs` (development). OpenAPI JSON at `/openapi.json`.
