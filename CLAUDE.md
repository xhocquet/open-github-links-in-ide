# Open GitHub Links in IDE

Browser extension (Chrome + Firefox) that opens GitHub file links directly in your IDE.

## Commands

- `yarn install --frozen-lockfile` — install dependencies
- `yarn build` — production build (webpack)
- `yarn dev` — development build
- `yarn build:test` — production build with test config
- `yarn lint` — ESLint + Prettier check (zero warnings allowed)
- `yarn lint:fix` — auto-fix lint issues
- `yarn type-check` — TypeScript type checking (`tsc --noEmit`)
- `yarn test:chrome` — Cypress e2e tests in Chrome
- `yarn test:firefox` — Cypress e2e tests in Firefox

## Architecture

TypeScript browser extension built with Webpack. No framework — vanilla TS.

- `src/manifest.json` — extension manifest
- `src/inject.ts` — content script injected into GitHub pages (main logic)
- `src/inject.css` — content script styles
- `src/background.ts` — service worker / background script
- `src/popup.html` / `src/popup.ts` — extension popup UI (settings)
- `src/types.ts` — shared types
- `src/utils.ts` — shared utilities
- `cypress/` — e2e tests

## Style

- Prettier: no semicolons, trailing commas, 120 char width
- ESLint: strict TypeScript rules (strict-boolean-expressions, no-unnecessary-condition)
- CI: CircleCI runs type-check, lint, build, then Cypress on Chrome and Firefox
