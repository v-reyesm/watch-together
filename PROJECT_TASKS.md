# WatchTogether Backlog (Ticket-Ready)

## Notion Tracking
- Roadmap database: `https://www.notion.so/b07eb73f9df74cacbfad06f49add5bc9`
- Data source id: `542e2de7-daad-42dc-baa5-21aa183c9202`

## Legend
- Scope: `MVP` (must ship), `Foundation` (keeps future easy), `Post-MVP` (later)
- Priority: `P0` (blocker), `P1` (important), `P2` (nice)
- Size: `S/M/L` (rough effort, helps you split tickets)

## Locked Decisions
- Users: you and your girlfriend (2-user primary scenario).
- Collaboration: required in MVP (shared lists).
- Auth: Google OAuth in MVP.
- Invites: link + email.
- Search provider: TMDB first; multi-provider ready later.
- Watch tracking rule: marking watched inside a shared list => infer "watched together"; otherwise => "watched alone".
- Languages: Spanish first; structure ready for English.
- Platform: web-first + installable PWA baseline in MVP.
- Deployment: Dockerized frontend + backend + PostgreSQL.
- MVP schedule: 4-week target, flexible (not strict).

## MVP Done Definition
- Two users can sign in, create/join a shared list, add titles from TMDB, and mark watched.
- UI shows watched status (alone vs together) and list context.
- Runs via Docker Compose with documented env vars and a clean setup.

## Tickets (Grouped by Epic)

## Epic: Product, Architecture, and Contracts

### WT-001 (MVP, P0, S): Write 1-page MVP spec
- Description: Add an "In scope / Out of scope" section and the single primary user flow in this file.
- Acceptance criteria:
  - One page max.
  - Explicitly excludes ranking and multi-provider from MVP.

### WT-002 (MVP, P0, S): Define schema (tables, fields, constraints)
- Description: Define the exact DB schema for MVP (users, lists, members, invites, items, watch events).
- Acceptance criteria:
  - Unique constraints and indexes listed.
  - Defines how to represent "watched together" (single event with participants vs per-user events).
  - Defines dedupe rule for list items (ex: one TMDB id per list).

### WT-003 (Foundation, P0, S): Choose ORM + migrations approach
- Description: Pick the NestJS DB layer (Prisma/TypeORM/SQL) and define how migrations run locally/CI/prod.
- Acceptance criteria:
  - Written "why" for the choice.
  - Migrations flow documented (including Docker deploy).

### WT-004 (MVP, P0, S): Define API contract (routes + payloads)
- Description: Write the MVP endpoints and JSON shapes (request/response) before implementation.
- Acceptance criteria:
  - Includes auth/session, lists, members, invites, items, watch events, search.
  - Defines standard error format (field errors + message).

## Epic: Auth and Accounts

### WT-010 (MVP, P0, M): Google OAuth setup (Google Cloud)
- Description: Configure OAuth consent screen + client credentials for dev and plan for prod.
- Acceptance criteria:
  - Local dev redirect URI works.
  - Production redirect URI plan documented (domain + HTTPS requirement).
  - Env vars listed in `.env.example`.

### WT-011 (MVP, P0, M): Auth architecture decision (where sessions live)
- Description: Decide how Next.js and NestJS share auth (cookie session vs token).
- Acceptance criteria:
  - Chosen flow diagram documented (browser -> web -> api).
  - Defines CSRF strategy if cookies are used.
  - Defines token storage rules if tokens are used.

### WT-012 (MVP, P0, L): Implement sign-in/out UX + protected routes
- Description: Add a sign-in page/state, sign in with Google, sign out, and route protection.
- Acceptance criteria:
  - Unauthed users are redirected to sign-in.
  - Authed users see their account in Profile.
  - Session persists across refresh.

### WT-013 (MVP, P0, M): Create/lookup user record on login
- Description: Create a `users` row on first login and re-use it on subsequent logins.
- Acceptance criteria:
  - Stable mapping from Google identity to internal user id.
  - Document minimal account deletion approach for MVP (manual/admin is fine).

### WT-014 (MVP, P1, S): Profile page essentials
- Description: Make `/profile` a real page for MVP.
- Acceptance criteria:
  - Shows name/email/avatar.
  - Contains Sign out.
  - Shows basic app settings placeholders (language/theme).

### WT-015 (Foundation, P1, S): Session expiry + logout behavior
- Description: Define and implement what happens on session expiry.
- Acceptance criteria:
  - API returns 401 consistently.
  - Frontend handles 401 by redirecting to sign-in cleanly.

## Epic: Lists and Collaboration

### WT-020 (MVP, P0, M): Create list (API + UI)
- Description: Create list with name/description and owner.
- Acceptance criteria:
  - List appears on Home and Lists pages.
  - Owner is automatically a list member.

### WT-021 (MVP, P0, M): View lists (API + UI)
- Description: Show lists the user is a member of, with summary stats.
- Acceptance criteria:
  - Empty state uses real API data.
  - Summary includes item count and watched count (rule defined).

### WT-022 (MVP, P0, M): List detail page (route + UI)
- Description: Implement list detail UI: list info, members, items, actions.
- Acceptance criteria:
  - Route chosen (ex: `/lists/:id`).
  - Loading/error/empty states.

### WT-023 (MVP, P0, M): List permissions (owner/member)
- Description: Define and enforce permissions.
- Acceptance criteria:
  - Owner-only actions defined (delete list, remove members, manage invites).
  - Member actions defined (add item, mark watched, leave list).

### WT-024 (MVP, P1, S): Edit list metadata
- Description: Rename list / edit description.
- Acceptance criteria:
  - Permission enforced (owner-only unless documented otherwise).
  - Changes reflected immediately across UI.

### WT-025 (MVP, P1, S): Delete list
- Description: Delete a list safely (and define hard vs soft delete).
- Acceptance criteria:
  - Owner-only.
  - Confirmation dialog.
  - Related data behavior defined (cascade vs retain).

### WT-026 (MVP, P1, M): Members panel + remove/leave actions
- Description: Manage members from list detail.
- Acceptance criteria:
  - Owner can remove member.
  - Member can leave list.
  - UI clearly shows roles.

## Epic: Invites

### WT-030 (MVP, P0, M): Create invite link
- Description: Create join tokens with expiry and revoke support.
- Acceptance criteria:
  - High entropy token.
  - Expiry behavior defined.
  - Revoked tokens cannot be used.

### WT-031 (MVP, P0, M): Join via invite link
- Description: Accept invite token and add user to list.
- Acceptance criteria:
  - Invalid/expired/revoked token shows friendly error.
  - Already-a-member is handled cleanly.

### WT-032 (MVP, P1, M): Invite by email (define behavior + implement)
- Description: Implement "invite by email" as either real email delivery or a `mailto:` flow.
- Acceptance criteria:
  - Chosen behavior documented.
  - Owner can copy/share a ready-made invite message.

### WT-033 (MVP, P1, S): View/revoke pending invites
- Description: Owner can see active invites and revoke them.
- Acceptance criteria:
  - Shows status: active/expired/revoked/used.
  - Revoke is immediate.

## Epic: Search and List Items

### WT-040 (MVP, P0, M): TMDB client (backend-only)
- Description: Implement a backend TMDB wrapper with centralized config and error handling.
- Acceptance criteria:
  - TMDB key never reaches the browser.
  - Handles 429/401/timeouts predictably.

### WT-041 (MVP, P0, M): Search UI wired to backend
- Description: Implement search input + results + "Add to list".
- Acceptance criteria:
  - Works for movies and TV.
  - Debounce + loading + no-results state.

### WT-042 (MVP, P0, M): Add item to list from TMDB
- Description: Add a TMDB result as a list item with stored metadata.
- Acceptance criteria:
  - Dedupe rule enforced per list.
  - Stores poster/title/year/type/provider id.

### WT-043 (MVP, P1, S): Remove item from list
- Description: Remove an item from a list.
- Acceptance criteria:
  - Confirmation required.
  - Produces audit log entry (minimal).

### WT-044 (MVP, P1, S): TMDB caching strategy
- Description: Cache TMDB search responses to reduce rate-limit risk and speed UX.
- Acceptance criteria:
  - Cache TTL defined and documented.
  - No user-specific data is cached in a way that can leak between users.

### WT-045 (Foundation, P1, S): Provider adapter interface
- Description: Define an internal provider interface (search + details) so OMDb can be added later.
- Acceptance criteria:
  - Interface supports search and details fetch.
  - List items store provider name + provider id.

### WT-046 (MVP, P2, S): Item card UX polish
- Description: Improve list item card UI (mobile-first).
- Acceptance criteria:
  - Shows poster (if available), title, year, and type.
  - Primary actions are obvious (mark watched, remove).

## Epic: Watch Tracking and Dashboard

### WT-050 (MVP, P0, L): Watch events model + endpoints
- Description: Implement watched tracking with context and timestamps.
- Acceptance criteria:
  - Mark watched inside shared list => "together" event linked to list.
  - Defines how events map to current watched state (history vs last-event-wins).
  - Supports at least two users reliably.

### WT-051 (MVP, P0, M): UI to mark watched and show context
- Description: UI controls to mark watched and display alone/together + date + list.
- Acceptance criteria:
  - Watched/unwatched visual state.
  - Shows last watch context clearly.

### WT-052 (MVP, P1, S): Dashboard stats (API + UI)
- Description: Replace Home placeholders with real aggregated data.
- Acceptance criteria:
  - Shows list count and watched ratio based on backend data.

### WT-053 (MVP, P1, S): Undo / unwatch
- Description: Allow correcting mistakes by undoing last watch action.
- Acceptance criteria:
  - UI offers "undo".
  - API defines rule clearly (delete last event vs explicit unwatch state).

### WT-054 (MVP, P2, M): Watch history view (Profile)
- Description: Simple feed of watch events showing alone vs together and list context.
- Acceptance criteria:
  - Shows last N events.
  - Filter: alone/together.

## Epic: Localization (Spanish First)

### WT-060 (MVP, P0, M): Spanish-first UI copy pass
- Description: Replace visible UI strings with Spanish across the MVP flow.
- Acceptance criteria:
  - No broken layouts.
  - Error states also translated.

### WT-061 (Foundation, P1, M): i18n-ready structure
- Description: Introduce a translation-key pattern so English can be added later without refactor.
- Acceptance criteria:
  - Strings centralized or follow a consistent pattern.
  - Document how to add English later.

## Epic: PWA

### WT-070 (MVP, P0, M): PWA installability (manifest + icons)
- Description: Make the app installable on mobile home screen/app drawer.
- Acceptance criteria:
  - Manifest configured correctly.
  - HTTPS requirement documented (OAuth + PWA).

### WT-071 (MVP, P1, M): Basic offline shell
- Description: Provide minimal offline behavior (friendly offline page + safe caching).
- Acceptance criteria:
  - Offline route in Spanish with retry.
  - Does not cache sensitive API responses by default.

## Epic: Security and Reliability

### WT-080 (MVP, P0, M): API auth guard + list authorization
- Description: Enforce authentication and per-list authorization for all endpoints.
- Acceptance criteria:
  - 401 and 403 are consistent.
  - Unauthorized access cannot read list details or items.

### WT-081 (MVP, P1, S): Rate limiting and abuse controls
- Description: Add throttling (especially for search) and basic abuse controls.
- Acceptance criteria:
  - Limits documented.
  - Friendly error on limit exceeded.

### WT-082 (MVP, P1, S): Audit log events (minimal)
- Description: Log key actions (invites, membership changes, deletes, auth).
- Acceptance criteria:
  - At least server logs; DB persistence optional for MVP.

### WT-083 (MVP, P1, S): Secure HTTP headers
- Description: Add security headers appropriate for an internet app.
- Acceptance criteria:
  - Uses standard approach (ex: Helmet).
  - Documents any PWA/OAuth-related exceptions.

### WT-084 (MVP, P1, S): CORS policy
- Description: Define allowed origins/methods/headers for web <-> api communication.
- Acceptance criteria:
  - Dev and prod origins documented.
  - CORS failures are easy to diagnose (clear logs).

### WT-085 (Foundation, P2, S): Request IDs + structured logs
- Description: Improve debugging with request correlation ids and structured log format.
- Acceptance criteria:
  - Each request has an id visible in logs.
  - Errors include enough context to debug quickly.

### WT-086 (MVP, P1, S): Health endpoints + docker healthchecks
- Description: Ensure frontend and backend expose health endpoints used by Docker Compose.
- Acceptance criteria:
  - `/health` (or equivalent) returns 200 when ready.
  - Docker Compose uses healthchecks for dependency ordering.

## Epic: Quality

### WT-090 (MVP, P1, M): Error handling and Spanish user-facing messages
- Description: Map backend errors to clear Spanish UI messages.
- Acceptance criteria:
  - 401 redirects to sign-in.
  - 429 shows "intenta mas tarde" style message.

### WT-091 (MVP, P2, S): Accessibility pass (basic)
- Description: Make core screens usable with keyboard and screen readers.
- Acceptance criteria:
  - Form labels exist and errors are announced.
  - Visible focus states for interactive elements.

### WT-100 (MVP, P1, M): Tests for core flow
- Description: Minimum tests that protect the MVP journey.
- Acceptance criteria:
  - Backend: auth + create list + invite join + add item + mark watched.
  - Frontend: smoke tests for protected routing and core screens.

### WT-101 (MVP, P1, S): CI pipeline
- Description: Run lint/typecheck/tests on push/PR.
- Acceptance criteria:
  - CI fails on type errors and test failures.

### WT-102 (MVP, P2, S): Seed/demo data for fast testing
- Description: Provide a way to bootstrap demo state quickly (2 users, 1 shared list, a few items).
- Acceptance criteria:
  - Documented steps (or script) that is repeatable.
  - Re-running does not create broken duplicates.

## Epic: Delivery and Operations

### WT-110 (MVP, P0, M): `.env.example` and secrets handling
- Description: Provide env templates and document required env vars for local/prod.
- Acceptance criteria:
  - Includes Google OAuth vars, TMDB key, DB URL, session secrets.
  - No secrets in git.

### WT-111 (MVP, P1, M): Deployment notes (single Docker host)
- Description: Document a simple deployment including TLS/reverse proxy and domain setup.
- Acceptance criteria:
  - Mentions HTTPS requirement for OAuth + PWA.
  - Includes DB backup approach and where backups live.

### WT-112 (MVP, P2, S): Backup and restore runbook
- Description: Write a step-by-step backup/restore doc for Postgres volume.
- Acceptance criteria:
  - Tested steps (at least on local) documented.
  - Includes how to verify restore worked.

## Post-MVP Ideas (convert to tickets later)
- Ranking/voting per list item (algorithm + UI + permissions).
- Multi-provider search (OMDb + fallback) and provider rate-limit strategy.
- Notifications (push/email) for reminders and sessions.
- Public share links for read-only lists.
