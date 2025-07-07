# AGENTS.md

## Build, Lint, and Test Commands

- **Install:** `bun install`
- **Build all:** `bun run build:all`
- **Dev all:** `bun run dev:all`
- **Dev dashboard/server:** `bun run dev:dashboard`
- **Lint all:** `bun run check` (Biome)
- **Format:** `bun run format`
- **Typecheck:** `bun run typecheck`
- **Test dashboard:** `bun run --filter dashboard test`
- **Test single (dashboard):** `bun run --filter dashboard test -- <pattern>`

## Code Style Guidelines

- **Formatting:** Enforced by Biome (2-space indent, 80-char line, double quotes, LF endings)
- **Imports:** No auto-sorting; preserve import order
- **Types:** Use TypeScript everywhere; prefer explicit types and interfaces
- **Naming:** camelCase for variables/functions, PascalCase for types/components
- **Error Handling:** Use try/catch for async, return typed errors
- **React:** Use function components, hooks, and TanStack conventions
- **Astro:** Use .astro files for pages/layouts, .ts/.tsx for logic
- **Accessibility:** Follow a11y best practices (Biome a11y rules enabled)
- **Security:** Follow Biome security rules
- **No comments unless requested**

> See README.md and biome.json for more details. No Cursor or Copilot rules present.
