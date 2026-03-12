# Agent Guidelines for Rate Your Flat

This file provides guidelines for AI agents working on this codebase.

## Runtime Environment

This project is developed on **WSL2** (Windows Subsystem for Linux), but **Docker Desktop runs on the Windows host**. The Docker socket is shared into WSL via Docker Desktop's WSL integration, so `docker` and `docker compose` commands work from within WSL — but agents should be aware of the following:

- **`docker compose` commands work from WSL** via the socket Docker Desktop exposes at `/var/run/docker.sock`. If commands fail with a socket error, ensure Docker Desktop is running on the host and WSL integration is enabled in Docker Desktop settings.
- **The agent cannot directly start containers for the user** — `docker compose up` / `down` / `build` must be run by the user in a terminal, or by the agent via Bash (only works if Docker Desktop is already running on the host).
- **Port mappings are on the Windows host**, not WSL. `localhost:3000` means the Windows browser — not a WSL process.
- **The app container image is not live-reloading** — after source changes, rebuild and restart: `docker compose build app && docker compose up -d app`.
- **For local development**, only the database container is needed: `docker compose up db -d`, then `npm run dev` from WSL for a live-reloading dev server.

## Build / Lint / Test Commands

### Development
```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Database
```bash
# Start only the PostgreSQL container (for local dev with `npm run dev`)
docker compose up db -d

# Generate Prisma client (after schema changes)
./node_modules/.bin/prisma generate

# Push schema to the running database (creates/updates tables, no migration files)
DATABASE_URL="postgresql://flatrate:flatrate_password@localhost:5432/rateyourflat" ./node_modules/.bin/prisma db push

# Reset database (drops all data)
DATABASE_URL="postgresql://flatrate:flatrate_password@localhost:5432/rateyourflat" ./node_modules/.bin/prisma db push --force-reset

# Apply DB helper functions (run once after db push, or after --force-reset)
# These are plain SQL functions not expressible in schema.prisma
DATABASE_URL="postgresql://flatrate:flatrate_password@localhost:5432/rateyourflat" node -e "
const {PrismaClient}=require('./node_modules/@prisma/client');
const fs=require('fs');
const p=new PrismaClient();
p.\$executeRawUnsafe(fs.readFileSync('prisma/functions.sql','utf8')).then(()=>p.\$disconnect());
"
```

### Code Quality
```bash
npm run lint        # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

### Testing
The project uses **Vitest** for unit tests. Test files live in `tests/`.

```bash
npm test            # Run the full test suite (vitest run)
npm run typecheck   # Run TypeScript type checking (tsc --noEmit)
npm run lint        # Run ESLint
npx prettier --check "src/**/*.{ts,tsx}"  # Check formatting
```

**Before every commit, run all four commands above and fix any failures.**

> **Note on newly created files:** Prettier is not run automatically on commit. Any file you create or significantly edit must be formatted with `npx prettier --write <file>` (or `npx prettier --write "src/**/*.{ts,tsx}"`) before committing, or the CI format check will fail.

#### Test conventions
- Use Vitest (`describe`, `it`, `expect`) — no Jest globals
- Test files: `tests/<name>.test.ts` (or `.tsx` for component tests)
- Pure utility functions live in `src/lib/` and must be exported so they can be imported in tests without rendering React
- Do **not** add side-effectful imports (Next.js routing, Prisma, `next-auth`) to test files — test pure logic only; DB/HTTP behaviour belongs in integration tests (none exist yet)
- Use the optional `suffix` parameter on `generateSlug` to make slug tests deterministic — never mock `Math.random`

#### Existing test files

| File | Tests | Coverage |
|---|---|---|
| `tests/slug.test.ts` | 7 | `src/lib/slug.ts` — `generateSlug` |
| `tests/ratings.test.ts` | 9 | `src/lib/ratings.ts` — `parseRatings`, `averageOverall` |
| `tests/i18n.test.ts` | 8 | `src/lib/i18n.tsx` — `translations` lookup, fallback chain, en↔de completeness |

#### When to add tests
- Any new function extracted to `src/lib/` must have a corresponding test file or entries added to an existing one
- New i18n keys must be covered by the completeness tests automatically (they check all keys exist in both languages)
- If you add a new pure utility, extract it to `src/lib/` first, then test it

## Code Style Guidelines

### General
- Use TypeScript for all files (`.ts` or `.tsx`)
- Use functional components with React hooks
- Avoid `any`, use proper types
- Use strict TypeScript configuration

### Naming Conventions
- **Files:** kebab-case (e.g., `header.tsx`, `auth-config.ts`)
- **Components:** PascalCase (e.g., `Header`, `LoginForm`)
- **Variables/functions:** camelCase (e.g., `getUser`, `userData`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Database models:** PascalCase (e.g., `User`, `Flat`, `Review`)

### Imports
- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Order imports: external libs → internal components → local utilities
- Group by: React/Next → UI components → lib utilities → types

```typescript
// Good
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { User } from "@/types";
```

### Formatting
- Use Prettier (configured in `.prettierrc`)
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas
- Semicolons at end of statements

### Components
- Use Server Components by default in `app/` directory
- Add `"use client"` directive only when needed (hooks, event handlers)
- Extract reusable logic into custom hooks
- Keep components focused (single responsibility)

### Error Handling
- Use try/catch for async operations
- Return proper HTTP status codes in API routes
- Display user-friendly error messages
- Log errors server-side for debugging

```typescript
// API route error handling
export async function POST(req: Request) {
  try {
    const data = await req.json();
    // process...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Database (Prisma)
- Use Prisma Client as typed query builder
- Always include relations explicitly with `include`
- Use transactions for multi-step operations
- Handle null values with optional chaining
- **Prisma version**: The project uses Prisma **7.x** locally. Always use `./node_modules/.bin/prisma` (never `npx prisma`, which may pick up a globally-installed incompatible version)
- **Prisma 7 config**: datasource URL is now configured in `prisma.config.ts` (project root), not in `schema.prisma`. The config uses `env("DATABASE_URL")` — always set this env var before running any Prisma CLI command
- **Prisma 7 Docker**: `--skip-generate` flag was removed. Use plain `prisma db push`. The Prisma CLI (`prisma/build/index.js`) requires its full transitive dep tree (`@prisma/dev` → `valibot`, `hono`, etc.) — the runner stage must copy the full `node_modules/` directory (not just selective Prisma packages)
- `Role` is stored as a plain `String` field with valid values `"LANDLORD"` | `"RENTER"` | `"MODERATOR"` | `"ADMIN"`. Application code must enforce this.

```typescript
// Good
const flat = await prisma.flat.findUnique({
  where: { id: flatId },
  include: { landlord: true, reviews: true },
});
```

### Authentication
- Use NextAuth.js for auth management
- Protect routes with `auth()` helper
- Check roles for authorization
- Never expose passwords in API responses

### Internationalization
- The project uses a **custom hand-rolled i18n context** in `src/lib/i18n.tsx` (NOT i18next/react-i18next, despite those packages being installed)
- All translation strings live in the flat-key dict in `src/lib/i18n.tsx`
- The `src/messages/en.json` and `src/messages/de.json` files exist as reference but are NOT imported anywhere
- Use `useTranslation()` hook in client components
- Server components use a local inline `getTranslation(key)` helper (pattern already established in each server component)
- Keys use dot-notation: `section.subsection.key` (e.g. `flat.addFlat`, `review.comment`)
- Provide both German (`de`) and English (`en`) entries for every key
- Default language is German (`de`)

### CSS / Tailwind
- Use Tailwind CSS utility classes
- Use semantic class names when needed
- Keep custom CSS minimal (use CSS variables)
- Use shadcn/ui components for common patterns

### API Routes
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Validate input with Zod or manual validation
- Return consistent response format
- Use NextResponse for responses

### File Organization
```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Auth routes (login, register)
│   ├── (dashboard)/  # Protected dashboards (landlord, renter, admin, moderator)
│   ├── api/
│   │   ├── auth/     # NextAuth + register
│   │   ├── flats/    # POST create flat; [slug]/verify, [slug]/reviews
│   │   ├── admin/    # GET stats, users; PATCH/DELETE users; GET content flats/reviews
│   │   └── moderator/ # DELETE flats/[slug], reviews/[id]; GET content flats/reviews
│   └── flat/
│       ├── new/      # Add Flat form (any logged-in user)
│       └── [slug]/   # Flat detail, review form, verify form
├── components/
│   ├── layout/       # Header, Footer
│   └── ui/           # shadcn components
├── lib/              # auth.ts, db.ts, i18n.tsx, admin.ts, slug.ts, ratings.ts
├── messages/         # en.json / de.json (reference only — NOT imported)
└── types/            # TypeScript types
```

## Environment Setup

Create `.env` file (copy from `.env.example`):
```env
DATABASE_URL="postgresql://flatrate:flatrate_password@localhost:5432/rateyourflat"
NEXTAUTH_SECRET="min-32-chars-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Database Reset (Development)

When making schema changes:
1. Edit `prisma/schema.prisma`
2. Run `./node_modules/.bin/prisma generate`
3. Run `./node_modules/.bin/prisma db push` to sync schema (data preserved, requires db container running)
4. Or add `--force-reset` to reset completely

## Flat Ownership Model

Flats can be in one of three states:

| State | `landlordId` | `submittedById` | `verified` | Badge shown |
|---|---|---|---|---|
| Landlord-created | landlord user id | landlord user id | false → true | Verified / Unverified |
| Renter-submitted (unclaimed) | `null` | renter user id | false | Unclaimed |
| Claimed by landlord | landlord user id | renter user id | true | Verified |

**Key rules:**
- Any logged-in user (landlord or renter) can create a flat via `POST /api/flats` or `/flat/new`
- If the creator is a `LANDLORD`, `landlordId` is set to their id; otherwise it stays `null`
- Renter-submitted flats are immediately visible on the homepage with an "Unclaimed" badge
- Landlords verify/claim a flat via `POST /api/flats/[slug]/verify` — if the flat was unclaimed (`landlordId = null`), it is claimed and `landlordId` is set to that landlord's id
- The landlord claim flow (generating and distributing verification codes) is **deferred** — verification codes are not yet generated at flat creation time

## User Roles

| Role | Dashboard route | Capabilities |
|------|----------------|--------------|
| `RENTER` | `/renter` | Submit reviews, submit flats |
| `LANDLORD` | `/landlord` | Create/claim flats, respond to reviews |
| `MODERATOR` | `/moderator` | Delete any flat or review |
| `ADMIN` | `/admin` | All of the above + user management (change roles, delete users) + platform stats |

**Promote the first admin directly in the DB:**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

`src/lib/admin.ts` exports `requireAdmin()` and `requireModeratorOrAdmin()` helpers for server components and API routes.

## Security — Known Gaps (Deferred)

The following security improvements are noted but not yet implemented:

- **Rate limiting**: Registration endpoint has in-memory rate limiting (`src/lib/rate-limit.ts`, 5 req/60 s). Login and review submission endpoints still have no rate limiting — add middleware before production.
- ~~**Email enumeration**~~: Fixed — the register endpoint now returns `201` with an ambiguous message (`"If this email is not already registered, your account has been created."`) for duplicate emails, so callers cannot enumerate registered addresses.
- **CSRF protection**: NextAuth handles its own CSRF tokens, but custom API routes (`/api/flats`, `/api/flats/[slug]/reviews`) do not validate CSRF tokens. Use `SameSite=Strict` cookies or add a custom header check.
- **Verification code generation**: `POST /api/flats` currently stores `verificationCode: null`. For the claim flow, generate a random code (e.g. `crypto.randomUUID()`) at creation time and display it to the submitter so a landlord can claim the flat later.
- **JWT role staleness after role change**: When an admin changes a user's role via `PATCH /api/admin/users/[id]`, the user's existing JWT still carries the old role until they log out and back in (up to 30 days). The proxy in `src/proxy.ts` checks user existence but does not re-read the role on each request. Fix options: (a) re-fetch the role from the DB in the `jwt` callback on every token refresh, or (b) switch to `strategy: "database"` sessions so the role is always read live from the DB.

## Database / Production Notes

- **Current DB**: PostgreSQL — used for both local development (via Docker) and production
- **`Review.ratings`**: Stored as a JSON string with shape `{ overall, location, price, condition, noise, landlord }` — each value is an integer 1–5. Always parse with try/catch.

## Common Issues

### Prisma Client not generated
```bash
./node_modules/.bin/prisma generate
```

### Database connection error
- Check DATABASE_URL in `.env`
- Ensure the Docker db container is running: `docker compose up db -d`

### Auth not working
- Check NEXTAUTH_SECRET is set
- Ensure cookies are enabled
- Check browser console for errors

## Dependencies

Key packages:
- `next` - Framework
- `@prisma/client` - Database ORM
- `prisma` - Database tools
- `next-auth@beta` - Authentication
- `bcryptjs` - Password hashing
- `shadcn-ui` - UI components
- `i18next` - Internationalization
- `lucide-react` - Icons

## Automatic PR Creation

When completing significant work (features, bug fixes, refactoring), agents should create a pull request to the main repository:

- **Target Repository**: `https://github.com/e-pallad/rate-your-flat`
- **Branch**: Create a new branch for each piece of work
- **PR Description Should Include**:
  - Summary of what was changed and why
  - List of files modified
  - Test results (lint, typecheck, tests)
  - Any breaking changes or migration notes
  - Screenshots if UI changes were made

Use descriptive commit messages and branch names that reflect the work done.

## Self-Documenting

Agents should actively maintain and update AGENTS.md to keep it current:

- Add new conventions or patterns discovered during development
- Document any changes to build processes or tooling
- Update commands if dependencies change
- Note any useful findings that would help future agents
- Keep the file in sync with actual project practices

If you discover something useful or make a change that affects how other agents should work, update this file accordingly.

## FAQ — Living Document

The FAQ page (`src/app/faq/page.tsx`) and screenshot script (`scripts/faq-screenshots.mjs`) are designed to be updated as new features land.

**When adding a new feature:**
1. Add a corresponding FAQ entry in `src/app/faq/page.tsx`
2. If the feature has a notable UI (form, new page), add a screenshot entry in `scripts/faq-screenshots.mjs`
3. Re-run `npm run faq:screenshots` (requires `npm run dev` running on port 3000 in a separate terminal)
4. Add the new `faq.*` translation keys to both `en` and `de` dicts in `src/lib/i18n.tsx`
5. If the question is one of the top 3 most common, update the teaser in `src/app/page.tsx`

Screenshots are stored in `public/faq/` and served as static assets. The FAQ page gracefully skips images that don't exist yet (checked via `fs.existsSync` at render time).

**Screenshot notes:**
- Pages that require login (add flat, review form) will capture the login redirect unless a session cookie is injected. See the comment block in `scripts/faq-screenshots.mjs` for how to do this.
- The script uses Puppeteer's bundled Chromium (no `executablePath` needed). On WSL2 you may need to install system deps first: `sudo apt-get install -y libnspr4 libnss3 libasound2t64` (note: `libasound2` was renamed to `libasound2t64` on Ubuntu 24.04+).
- **`faq-review-form.png` is not yet captured** — the script skips it when no flats exist in the database. Once the app has been seeded with at least one flat, re-run `npm run faq:screenshots` to capture it.
- **`faq-add-flat.png` currently shows the login redirect** (20 KB, not the real form). To capture the actual add-flat form, inject a session cookie as described in `scripts/faq-screenshots.mjs` and re-run the script.

## Monetization Plans (Deferred)

The following monetization ideas have been selected and are planned for future implementation. None are implemented yet.

| Idea | Schema changes needed | Implementation notes |
|------|-----------------------|----------------------|
| **Featured / promoted listings** | `Flat.promoted Boolean @default(false)`, `Flat.promotedUntil DateTime?` | Homepage query orders `promoted=true` flats first. A `/landlord/promote/[slug]` checkout page (Stripe or placeholder) sets the flag with an expiry date. |
| **One-time verification badge fee** | `Flat.verificationPaid Boolean @default(false)` | Gate `POST /api/flats/[slug]/verify` behind a payment check. Verification codes are only issued after `verificationPaid=true`. Integrate Stripe Checkout or a payment link. |
| **Data & market reports** | None (read-only aggregation) | Add a `/api/reports/[city]` endpoint that returns aggregated avg ratings, review counts, and price trends per city. Full historical data gated behind an API key or subscription tier. |
| **Referral / affiliate links** | None | Static `/partners` page listing curated partner services (moving companies, insurance, utilities) with affiliate links. Can start as pure static content. |

**Priority order (suggested):** Featured listings → Verification badge fee → Referral links → Data reports
