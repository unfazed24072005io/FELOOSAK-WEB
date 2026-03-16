# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── feloosak/           # Feloosak finance app (React+Vite)
│   └── feloosak-mobile/    # Feloosak mobile app (Expo React Native)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/feloosak` (`@workspace/feloosak`)

Feloosak (فلوسك) — AI-powered finance super-app for Egypt & UAE. React+Vite SPA with Tailwind CSS.

**Key Features:**
- Login screen with split-panel layout (dark branding panel + sign-in form)
- Region selector (Egypt / UAE) with different tax rules, currencies, compliance
- Dashboard with Recharts (AreaChart monthly trend, PieChart top categories), stat cards, AI insight card, recent transactions
- Cash In/Out page with tabs (All, Cash In, Cash Out, Customers), add entry modal, delete on hover, customer trust ratings
- Invoices page with advanced invoice builder modal (multi-line items, qty/price/discount, VAT calc, subtotal/total, Submit ETA/Send)
- AI Insights page with variance analysis table and AI chat (keyword-based responses about VAT/tax/profit)
- Compliance page with VAT summary, corporate tax calculator, UAE 2026 amendments, tax calendar
- Settings page with region switcher, compliance badges, Egypt vs UAE comparison table, logout

**Design:**
- Design tokens: bg=#F6F5F0, accent=#C8A630, ok=#22A06B, bad=#E34935, warn=#E5890A, info=#2680EB
- Font: DM Sans / system-ui fallback
- Collapsible sidebar navigation with 6 pages
- Region data: Egypt (VAT 14%, EGP, ETA, CT 22.5%) and UAE (VAT 5%, AED, FTA, CT 9% above AED 375K)

**Dependencies:** React 19, Vite, Tailwind CSS 4, Recharts, wouter

- Entry: `src/main.tsx` → `src/App.tsx` (single-file app with all components)
- `pnpm --filter @workspace/feloosak run dev` — run the dev server

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/feloosak-mobile` (`@workspace/feloosak-mobile`)

Feloosak Mobile — Expo React Native app for iOS/Android. Connects to the same Express API backend as the web app.

**Key Features:**
- 4-tab navigation: Books, Customers, Invoices, Settings
- Auth flow: Login/Register modal with Feloosak branding
- Cash Books dashboard with balance summary, business/personal filter, create book
- Book detail screen with transactions list, add transaction form sheet
- Customers list with trust ratings, owed/paid balances, add customer form sheet
- Invoices list with status badges (draft/sent/paid), status advancement
- Settings with profile card, region switcher (Egypt/UAE), tax compliance badges
- API client with session cookie management for auth persistence
- Liquid glass tab bar support for iOS 26+ via NativeTabs

**Design:**
- Same design tokens as web: bg=#F6F5F0, accent=#C8A630
- Inter font family (Regular, Medium, SemiBold, Bold)
- Form sheets for adding transactions, customers, books
- Region-aware payment modes (EG: Instapay/Fawry/Vodafone Cash, AE: Apple Pay/ENBD)

**Dependencies:** Expo 54, expo-router, React Query, AsyncStorage, expo-blur, expo-glass-effect

**API Connection:**
- Base URL: `https://${EXPO_PUBLIC_DOMAIN}/api-server/api`
- Session cookies stored via AsyncStorage for native persistence
- CORS note: Web preview has cross-origin limitations; native Expo Go works fully

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
