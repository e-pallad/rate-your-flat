# Project Planning - Rate Your Flat

## Project Overview

A platform for tenants to rate and review rental flats, helping others make informed housing decisions.

---

## Current Goals (This Sprint/Iteration)

- [x] Dark mode - auto-detect system preference (no manual toggle needed)
- [x] Add error/loading boundaries - `error.tsx` and `loading.tsx` for better UX
- [x] Pagination for flat listings and reviews

---

## In Progress

_(nothing currently in progress)_

---

## Backlog

### Features

- [ ] User profile page
- [ ] Image uploads for flats/reviews
- [ ] Edit/delete reviews
- [ ] Edit flats
- [ ] Loading skeletons
- [ ] Advanced search and filter functionality (by price, location, amenities)
- [ ] Map integration to display flat locations
- [ ] Favourite/bookmark flats
- [ ] Social features (sharing reviews)
- [ ] Email notifications for new reviews
- [ ] Analytics dashboard for landlords
- [ ] Mobile app API
- [ ] Progressive Web App (PWA) support

### Monetization (deferred — planned)

- [ ] Featured/promoted listings (`Flat.promoted`, `Flat.promotedUntil`)
- [ ] One-time verification badge fee (`Flat.verificationPaid`)
- [ ] Data & market reports (`/api/reports/[city]`)
- [ ] Referral/affiliate links (`/partners` page)

### Technical Improvements

- [ ] **Rate limiting** - Login and review submission have no rate limiting (registration already has it)
- [ ] ~~**Auth security**~~ - Email enumeration fixed: register now returns 201 with ambiguous message for duplicate emails
- [ ] **Password validation** - Add minimum length/complexity requirements on registration
- [ ] **CSRF protection** - Custom API routes do not validate CSRF tokens
- [ ] **Verification code generation** - Generate code at flat creation time for the claim flow
- [ ] **JWT role staleness** - Role in JWT not updated when admin changes a user's role
- [ ] **Standardize translations** - Server components use local inline dict; consider consolidating

### Bug Fixes

- [ ] ...

---

## Completed

- [x] User authentication (register/login)
- [x] Role-based access (LANDLORD / RENTER / MODERATOR / ADMIN)
- [x] Flat listings with search
- [x] Reviews & ratings system (with anonymous option, landlord response)
- [x] Flat verification / claim system
- [x] German & English i18n (custom hand-rolled context in `src/lib/i18n.tsx`)
- [x] Write Review page (`/flat/[slug]/review`)
- [x] Add Flat page (`/flat/new`) — any logged-in user
- [x] Admin dashboard — stats, user management, content moderation ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- [x] Moderator dashboard — delete flats/reviews ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- [x] Role-based header routing (ADMIN → `/admin`, MODERATOR → `/moderator`) ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- [x] JWT revocation middleware — DB check on every request ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- [x] Anonymous reviewer privacy fix — moderator/admin APIs redact identity ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- [x] CI/CD pipeline with GitHub Actions (lint, typecheck, build, test) ([PR #2](https://github.com/e-pallad/rate-your-flat/pull/2))
- [x] Unit test suite (Vitest) — 24 tests across slug, ratings, i18n ([PR #3](https://github.com/e-pallad/rate-your-flat/pull/3))
- [x] Prettier formatting enforcement across all source files ([PR #3](https://github.com/e-pallad/rate-your-flat/pull/3))
- [x] Extracted `generateSlug`, `parseRatings`, `averageOverall` to `src/lib/` ([PR #3](https://github.com/e-pallad/rate-your-flat/pull/3))
- [x] Dark mode — `next-themes` ThemeProvider wired with `defaultTheme=system`
- [x] Error/loading boundaries — `error.tsx` and `loading.tsx` for root, flat detail, and auth routes
- [x] Pagination — flat listings (12/page) and reviews (10/page)
- [x] README/SPEC/PLANNING docs updated — stale tech stack, SQLite references, completed items ([PR #4 equivalent](https://github.com/e-pallad/rate-your-flat/tree/docs/update-readme))

---

## Code Review Findings (For Reference)

### Open Issues

4. **No Password Validation** - Registration accepts any password beyond 8-char minimum

7. **Rate Limiting** - No rate limiting on login or review submission (registration already has it)

8. **CSRF Protection** - Custom API routes do not validate CSRF tokens

9. **Verification Code Generation** - `verificationCode` is stored as `null`; generate at flat creation

10. **JWT Role Staleness** - Role in JWT not refreshed when admin changes a user's role

### Resolved

- ~~**Dark Mode**~~ - `next-themes` ThemeProvider wired with `defaultTheme=system, enableSystem`; `.dark` CSS variables already existed
- ~~**No Error/Loading Boundaries**~~ - `error.tsx` and `loading.tsx` added at root, flat detail, and auth route levels
- ~~**No Pagination**~~ - Flat listings (12/page) and reviews (10/page) with prev/next controls
- ~~**Auth Email Enumeration**~~ - Register endpoint returns `201` with ambiguous message for duplicate emails
- ~~**Inline Translations**~~ - Server components intentionally use a local inline dict + `getTranslation()` helper; `translations` is now exported from `src/lib/i18n.tsx` for use in tests and client components. Pattern is consistent and documented in `AGENTS.md`.
- ~~**Anonymous Reviewer Privacy**~~ - Moderator and admin APIs now redact reviewer identity for anonymous reviews ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))
- ~~**JWT Revocation**~~ - Middleware performs a DB check on every authenticated request ([PR #1](https://github.com/e-pallad/rate-your-flat/pull/1))

---

## Notes

- Follow existing shadcn/ui patterns for new components
- `next-themes` is configured — ThemeProvider wraps the entire app in `providers.tsx`
