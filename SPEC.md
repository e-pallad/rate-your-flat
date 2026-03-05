# Flat Rating Portal - Project Specification

## Project Overview
A platform enabling users to rate and review flats they've rented, helping future renters make informed decisions.

## Tech Stack
- **Frontend:** Next.js 16 (App Router) + TypeScript
- **Styling:** shadcn/ui + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v5 (credentials-based)
- **i18n:** Custom hand-rolled context in `src/lib/i18n.tsx` (German default, English)

## Core Features

### Authentication
- Separate landlord/renter roles
- Email/password registration and login
- JWT-based sessions
- Protected routes by role

### Flat Management
- Landlords can add flats with address
- Address verification via unique code
- Public flat profiles at `/flat/[slug]`
- Search by address, city, postal code

### Reviews & Ratings
- 5 category ratings: Location, Price, Condition, Noise, Landlord (1-5 stars each)
- Overall rating calculated automatically
- Text comments with optional anonymity
- One review per user-flat (editable)
- Landlord public responses

### Multi-language
- German (default) + English
- Full UI translation via i18next
- Language switcher in header

## Database Schema

### User
- id, email, passwordHash, name, role (LANDLORD|RENTER), emailNotifications, createdAt, updatedAt

### Flat
- id, slug, address, city, postalCode, country, description, landlordId, verified, verificationCode, verifiedAt, createdAt, updatedAt

### Review
- id, flatId, userId, ratings (JSON), comment, isAnonymous, landlordResponse, landlordResponseAt, createdAt, updatedAt

### FlatImage
- id, reviewId, filename, path, createdAt

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register)
│   ├── (dashboard)/     # Role-based dashboards
│   ├── api/             # API routes
│   │   ├── auth/        # Auth endpoints
│   │   ├── flats/       # Flat CRUD
│   │   └── reviews/    # Review CRUD
│   ├── flat/[slug]/     # Public flat pages
│   └── page.tsx         # Homepage
├── components/
│   ├── layout/          # Header, Footer
│   └── ui/              # shadcn components
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma client
│   └── i18n.ts          # i18n config
├── messages/            # Translation files (en.json, de.json)
└── types/               # TypeScript types
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run typecheck

# Generate Prisma client
./node_modules/.bin/prisma generate

# Push schema to database
./node_modules/.bin/prisma db push

# Reset database
./node_modules/.bin/prisma db push --force-reset
```

## Environment Variables

```env
DATABASE_URL="postgresql://flatrate:flatrate_password@localhost:5432/rateyourflat"

NEXTAUTH_SECRET="your-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

## Docker Setup

```bash
# Start all services (PostgreSQL + app)
docker compose up -d

# Start only database
docker compose up -d db
```

## Design Guidelines
- Clean, modern UI with shadcn/ui components
- Responsive design (mobile-first)
- Accessible (WCAG 2.1 AA)
- Consistent spacing using Tailwind's default spacing scale

## Future Enhancements
- Image uploads for reviews
- Email notifications via Resend
- Map-based flat search
- Advanced filtering and sorting
- Admin panel for content moderation
