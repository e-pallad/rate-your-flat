# Project Planning - Rate Your Flat

## Project Overview

A platform for tenants to rate and review rental flats, helping others make informed housing decisions.

---

## Current Goals (This Sprint/Iteration)

- [ ] Write Review page (`/flat/[slug]/review`) - complete the review flow
- [ ] Add Flat page (`/flats/new`) - landlords can create listings
- [ ] Dark mode - auto-detect system preference (no manual toggle needed)

---

## In Progress

- [ ] ...

---

## Backlog

### Features
- [ ] User profile page
- [ ] Image uploads for reviews
- [ ] Edit/delete reviews
- [ ] Edit flats
- [ ] Pagination for flat listings and reviews
- [ ] Loading skeletons

### Technical Improvements
- [ ] **Standardize translations** - Refactor inline translations to use `useTranslation()` hook consistently
- [ ] **Add error/loading boundaries** - Create `error.tsx` and `loading.tsx` for better UX
- [ ] **Auth security** - Fix email enumeration vulnerability (return same message for invalid email/password)
- [ ] **Password validation** - Add minimum length/complexity requirements on registration

### Bug Fixes
- [ ] ...

---

## Completed

- [ ] User authentication (register/login)
- [ ] Role-based access (LANDLORD / RENTER)
- [ ] Flat listings with search
- [ ] Reviews & ratings system (with anonymous option, landlord response)
- [ ] Flat verification system
- [ ] German & English i18n

---

## Code Review Findings (For Reference)

### Issues Found

1. **Inline Translations** - Pages define own `translations` objects instead of using `TranslationProvider`
   - Affected: `src/app/page.tsx`, `src/app/flat/[slug]/page.tsx`
   - Fix: Use `useTranslation()` hook consistently

2. **Dark Mode Incomplete** - CSS variables exist but no provider implemented
   - Fix: Add `next-themes` provider with `useSystem={true}`

3. **No Error/Loading Boundaries** - Missing `error.tsx` and `loading.tsx` files

4. **Auth Email Enumeration** - Different error messages for invalid email vs password
   - Fix: Return same generic message for both cases

5. **No Password Validation** - Registration accepts any password

6. **No Pagination** - Flat listings and reviews grow unbounded

7. **No Loading States** - Missing skeletons for async data

---

## Notes

- Dark mode should auto-detect system preference (prefers-color-scheme)
- Use existing TranslationProvider for i18n strings
- Follow existing shadcn/ui patterns for new components
- `next-themes` package already installed but not configured

