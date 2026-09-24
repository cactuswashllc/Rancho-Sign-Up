@AGENTS.md

# Project notes

- Domain logic lives in `src/lib/` (signups, events, auth); pages and server actions stay thin.
  Every organizer page and server action must call `requireOrganizer()` / `requireAdmin()`.
- Sign-up quantity checks must stay inside the row-locking transaction in `src/lib/signups.ts`.
- Parent data (names, emails, student names) is only shown to organizers. Never log it; use synthetic
  data in tests.
- Before committing, run: `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test`.
