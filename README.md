# Rate Your Flat

A Next.js web application for tenants to rate and review rental flats. Users can browse flats, leave reviews, and help others make informed decisions about their housing choices.

## Features

- **Flat Listings**: Browse available rental flats with detailed information
- **Reviews & Ratings**: Rate flats across 6 dimensions (overall, location, price, condition, noise, landlord)
- **Image Uploads**: Attach photos to reviews (up to 5 images, 5 MB each)
- **Interactive Map**: View flat location on a Leaflet map
- **User Authentication**: Secure sign-up and login with NextAuth.js
- **Role-Based Access**: Renters, Landlords, Moderators, and Admins each have dedicated dashboards
- **Landlord Analytics**: Charts and stats for landlords on their flats and reviews
- **Landlord Responses**: Landlords can publicly respond to reviews
- **Content Moderation**: Moderator and Admin dashboards for managing flats and reviews
- **Internationalization**: Available in German (de) and English (en)
- **Dark Mode**: System auto-detect via next-themes
- **Modern UI**: Clean interface built with Tailwind CSS and shadcn/ui
- **FAQ Page**: Self-documenting FAQ with auto-generated screenshots
- **Automated Releases**: Versioned GitHub releases via release-it + conventional commits

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL 16 with Prisma ORM 7
- **Authentication**: NextAuth.js v5 (beta)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Internationalization**: Custom i18n context (German/English)
- **Maps**: Leaflet + React Leaflet
- **Charts**: Recharts
- **Validation**: Zod
- **Testing**: Vitest (24 unit tests)
- **Release Automation**: release-it + @release-it/conventional-changelog

## Getting Started

### Prerequisites

- Node.js 22+
- npm 11+
- PostgreSQL database (via Docker or a hosted instance)
- Docker (recommended — `docker compose up db -d` starts the DB)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/e-pallad/rate-your-flat.git
cd rate-your-flat
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database URL and auth secrets
```

4. Generate Prisma client and push schema:

```bash
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm test             # Run unit tests (Vitest)
npm run release      # Cut a versioned GitHub release (requires GITHUB_TOKEN)
npm run faq:screenshots  # Regenerate FAQ screenshot images
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login / Register
│   ├── (dashboard)/  # Landlord, Renter, Admin, Moderator dashboards
│   ├── api/          # API routes (auth, flats, reviews, admin, moderator)
│   ├── flat/         # Flat detail, review form, verify form
│   └── faq/          # FAQ page
├── components/
│   ├── layout/       # Header, Footer
│   └── ui/           # shadcn/ui components
├── lib/              # auth, db (Prisma), i18n, rate-limit, slug, ratings
├── messages/         # en.json / de.json (reference — NOT imported at runtime)
└── types/            # TypeScript types
prisma/
├── schema.prisma     # Database schema (User, Flat, Review, FlatImage)
└── functions.sql     # PL/pgSQL helpers (safe_jsonb_float)
prisma.config.ts      # Prisma 7 datasource configuration
release.config.js     # release-it configuration for GitHub releases
scripts/
└── faq-screenshots.mjs  # Puppeteer script for FAQ screenshots
public/faq/           # Auto-generated FAQ screenshots
tests/                # Vitest unit tests (slug, ratings, i18n)
.github/
├── workflows/ci.yml  # CI: lint, typecheck, test, build
├── workflows/semgrep.yml  # Static analysis (Semgrep)
└── dependabot.yml    # Weekly dependency updates
```

## User Roles

| Role | Dashboard | Capabilities |
|------|-----------|--------------|
| `RENTER` | `/renter` | Submit flats and reviews |
| `LANDLORD` | `/landlord` | Create/claim flats, respond to reviews, view analytics |
| `MODERATOR` | `/moderator` | Delete any flat or review |
| `ADMIN` | `/admin` | All of the above + user management + platform stats |

To promote the first admin, run directly in the DB:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Releasing

This project uses [release-it](https://github.com/release-it/release-it) with [conventional commits](https://www.conventionalcommits.org/) to automate versioning and GitHub releases.

```bash
# Dry run — preview what would happen
npx release-it --dry-run

# Create a release (bumps version, generates CHANGELOG.md, tags, creates GitHub release)
npm run release
```

Requires a `GITHUB_TOKEN` with repo write access (or `gh auth login`).

## CI / CD

Every pull request to `master` runs the full CI suite via GitHub Actions:

1. **Install** — `npm ci` with npm 11
2. **Audit** — `npm audit --audit-level=critical`
3. **Generate** — Prisma client
4. **Schema push** — `prisma db push` against a Postgres 16 service
5. **Format** — Prettier check on all `src/**/*.{ts,tsx}`
6. **Lint** — ESLint 9
7. **Typecheck** — `tsc --noEmit`
8. **Test** — Vitest (24 tests)
9. **Build** — Next.js production build

Semgrep static analysis runs in parallel on every PR using the `p/typescript`, `p/nodejs`, and `p/owasp-top-ten` rulesets.

## Completed Features

- [x] Admin and Moderator dashboards with role-based access control ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- [x] CI/CD pipeline with GitHub Actions (lint, typecheck, build, test) ([PR #2](https://github.com/e-pallad/rate-your-flat/pull/2))
- [x] Unit test suite (Vitest) and Prettier formatting enforcement ([PR #3](https://github.com/e-pallad/rate-your-flat/pull/3))
- [x] Missing flat management pages and API routes ([PR #12](https://github.com/e-pallad/rate-your-flat/pull/12), [PR #13](https://github.com/e-pallad/rate-your-flat/pull/13))
- [x] Rate limiting on auth and review endpoints ([PR #14](https://github.com/e-pallad/rate-your-flat/pull/14))
- [x] Stub pages for all footer links ([PR #15](https://github.com/e-pallad/rate-your-flat/pull/15))
- [x] Dark mode (system auto-detect via next-themes) ([PR #16](https://github.com/e-pallad/rate-your-flat/pull/16))
- [x] Error and loading boundaries (`error.tsx` / `loading.tsx`) ([PR #16](https://github.com/e-pallad/rate-your-flat/pull/16))
- [x] DB-side pagination for flat listings and reviews ([PR #16](https://github.com/e-pallad/rate-your-flat/pull/16))
- [x] Email enumeration fix on registration endpoint ([PR #16](https://github.com/e-pallad/rate-your-flat/pull/16))
- [x] Image uploads for reviews (up to 5 images, atomic quota via DB transaction) ([PR #17](https://github.com/e-pallad/rate-your-flat/pull/17))
- [x] Leaflet map integration on flat detail pages ([PR #17](https://github.com/e-pallad/rate-your-flat/pull/17))
- [x] Landlord analytics dashboard with Recharts ([PR #17](https://github.com/e-pallad/rate-your-flat/pull/17))
- [x] JWT role refresh and security hardening ([PR #17](https://github.com/e-pallad/rate-your-flat/pull/17))
- [x] Dependabot configuration for weekly npm updates ([PR #18](https://github.com/e-pallad/rate-your-flat/pull/18))
- [x] Semgrep static analysis CI workflow ([PR #26](https://github.com/e-pallad/rate-your-flat/pull/26))
- [x] Prisma 5→7 migration, React 19.2.4, pg 8.20, and other dependency updates ([PR #31](https://github.com/e-pallad/rate-your-flat/pull/31))
- [x] Automated GitHub releases with release-it and conventional changelog ([PR #32](https://github.com/e-pallad/rate-your-flat/pull/32))

## Planned Features

- [ ] Advanced search and filter (by city, price range, rating)
- [ ] Favorite/bookmark flats for later
- [ ] Social features (sharing reviews)
- [ ] Email notifications for new reviews
- [ ] Mobile app API
- [ ] Progressive Web App (PWA) support
- [ ] Featured / promoted listings (monetization)
- [ ] One-time verification badge fee (monetization)
- [ ] Market reports and analytics API
