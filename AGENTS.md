# WatchTogether — Agent & AI Instructions

This file defines **restrictions and locked decisions** for AI assistants and agents working on this repo. Follow these when suggesting changes, implementing features, or answering questions. Full backlog and tickets live in [PROJECT_TASKS.md](./PROJECT_TASKS.md).

---

## Locked Decisions (Do Not Change Unless Explicitly Requested)

Treat these as fixed constraints. Do not suggest alternatives or “better” options unless the user explicitly asks to revisit them.

| Area | Decision |
|------|----------|
| **Users** | Primary scenario: 2 users (you and your girlfriend). |
| **Collaboration** | Required in MVP: shared lists. |
| **Auth** | Google OAuth in MVP. |
| **Invites** | Link + email. |
| **Search provider** | TMDB first; architecture must be ready for multi-provider later. |
| **Watch tracking** | Marking watched **inside a shared list** ⇒ infer “watched together”; otherwise ⇒ “watched alone”. |
| **Languages** | Spanish first; structure must be ready for English. |
| **Platform** | Web-first + installable PWA baseline in MVP. |
| **Deployment** | Dockerized frontend + backend + PostgreSQL. |
| **MVP schedule** | 4-week target, flexible (not strict). |

---

## MVP Scope Boundaries

- **In scope for MVP:** Two users can sign in, create/join a shared list, add titles from TMDB, mark watched; UI shows watched status (alone vs together) and list context; runs via Docker Compose with documented env vars.
- **Explicitly out of scope for MVP:** Ranking, multi-provider search (OMDb etc.). Do not implement these in MVP unless the user explicitly asks.

---

## Technical Constraints (from PROJECT_TASKS.md)

- **API auth:** Enforce authentication and per-list authorization; 401 and 403 must be consistent.
- **TMDB:** Backend-only; TMDB key must never reach the browser.
- **Sessions:** Behavior on expiry must be defined (API returns 401; frontend redirects to sign-in).
- **List items:** Dedupe rule per list (e.g. one TMDB id per list); store provider name + provider id for future multi-provider.
- **Errors:** Map backend errors to clear Spanish user-facing messages where applicable.

---

## When in Doubt

- Prefer decisions and acceptance criteria from [PROJECT_TASKS.md](./PROJECT_TASKS.md) for the relevant epic/ticket.
- For schema, API contracts, and watch-event semantics, follow the tickets (WT-002, WT-004, WT-050, etc.) and existing code rather than inventing new models.

## Other considerations
- On the API project, when a entity references another entity, it must be imported like this `import { Media } from "../../media/entities/media.entity";`, since it will work running on docker or in the cli
