# InvoiceForge

Monorepo: `backend/` (Hono API) + `frontend/` (Astro + Preact + Tailwind). No test suite, no linter, no formatter configured.

## Commands

```bash
# Start both (from root, local development)
npm run dev

# Start via Docker Compose (recommended for testing container setup)
docker compose up --build -d     # ports: host 4322 (frontend) & 3002 (backend)
docker compose down              # stop containers

# Backend only
cd backend && npm run dev        # port 3001, uses tsx + node --watch

# Frontend only
cd frontend && npm run dev       # port 4321 (Astro dev server)

# Frontend build (SSR mode, no adapter wired — see BACKLOG item 6)
cd frontend && npm run build
```

There is no `typecheck`, `lint`, `test`, or `format` script anywhere. No CI, no pre-commit hooks.

## Architecture

**Backend** — `backend/src/`
- `index.ts`: Hono app entry. CORS `*`, logger, routes mounted at `/api/{clients,pics,invoices,settings,companies}`. Port 3001 hardcoded.
- `routes/`: One file per resource (client, invoice, pic, settings, company).
- `schemas/`: Zod schemas for validation.
- `services/`: Business logic, JSON file reads/writes via `utils/storage.ts`.
- `utils/storage.ts`: `readJson`/`writeJson` helpers. Data lives in `backend/data/*.json` (gitignored). Auto-creates dirs. No locking.
- `utils/id.ts`: Sequential ID generation (`CLI-001`, `INV/2026/06/001`, `COMP-001`).

**Frontend** — `frontend/src/`
- `pages/`: Astro file-based routing. `index.astro` is dashboard. `invoice/`, `client/`, `pic/`, `settings/` subdirs. `changelog.astro`.
- `components/`: Preact `.tsx` components (interactive islands).
- `lib/api.ts`: Fetch wrapper. Detects SSR: uses `API_URL_SSR` (default `http://localhost:3001`) on server, `PUBLIC_API_URL` (default `http://localhost:3001`) in browser.
- `lib/firebase.ts`: Firebase init present but **analytics is unused** — dead code.
- `lib/calculate.ts`, `lib/format.ts`: Invoice math and currency formatting.
- `layouts/`: Astro layout shells.
- `styles/`: Global CSS.
- `astro.config.mjs`: `output: 'server'` (SSR), Preact integration, Tailwind v4 via Vite plugin. Node adapter commented out.

## Key quirks

- **No database.** All persistence is flat JSON files in `backend/data/`. Concurrent writes corrupt data.
- **No tests.** Do not run `npm test` — it just echoes an error.
- **No auth.** CORS is wide open. Don't commit `.env` (contains real bank/NPWP creds).
- **Backend ESM** (`"type": "module"`). Frontend is also ESM. Root `package.json` is CommonJS.
- **Strict TS** in backend (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Frontend uses Astro strict preset.
- **`verbatimModuleSyntax: true`** in backend tsconfig — imports must use `type` keyword for type-only imports.
- **Astro SSR mode** with no deploy adapter configured. `astro build` alone won't produce a deployable artifact.
- **Tailwind v4** (not v3). Uses `@tailwindcss/vite` plugin, not PostCSS config. No `tailwind.config.*` file.
- **Invoice number format**: `INV/YYYY/MM/NNN` — generated server-side, monthly sequence resets.
- **Signature uploads**: `backend/uploads/` dir, served via `@hono/node-server/serve-static`. Uses `writeFileSync` (blocking).
- **No pagination** on list endpoints. All records returned at once.
- **Backend `.env`**: company identity settings (name, address, NPWP, bank). Not used for secrets beyond that.
- **Docker Port Mapping**: Host ports are mapped to `3002` (backend) and `4322` (frontend) to prevent conflicts, while internal container ports remain `3001` (backend) and `4321` (frontend).
- **API URL SSR**: Frontend SSR calls (like dashboard) fetch via `http://backend:3001/api` inside the Docker network. Client-side fetches (like forms) use `http://localhost:3002/api`.

## Files to read before editing

- `BACKLOG.log` — known bugs and tech debt list
- `backend/src/utils/storage.ts` — how data layer works
- `frontend/src/lib/api.ts` — all API endpoints and contract
- `backend/src/schemas/` — Zod shapes define the data model
