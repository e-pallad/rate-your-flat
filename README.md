# Rate Your Flat

A Next.js web application for tenants to rate and review rental flats. Users can browse flats, leave reviews, and help others make informed decisions about their housing choices.

## Features

- **Flat Listings**: Browse available rental flats with detailed information
- **Reviews & Ratings**: Users can rate flats and write detailed reviews
- **User Authentication**: Secure sign-up and login with NextAuth.js
- **Landlord Profiles**: View landlord information and their managed properties
- **Internationalization**: Available in German (de) and English (en)
- **Modern UI**: Clean interface built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (beta)
- **Styling**: Tailwind CSS + shadcn/ui
- **Internationalization**: i18next + react-i18next
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or SQLite for development)
- Docker (optional, for PostgreSQL)

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
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm test             # Run tests
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities and configurations
├── messages/         # Internationalization translations
└── types/            # TypeScript type definitions
```

## Future Steps

- [ ] Advanced search and filter functionality (by price, location, amenities)
- [ ] Map integration to display flat locations
- [ ] Favorite/bookmark flats for later
- [ ] Admin dashboard for content moderation
- [ ] Image uploads for flats
- [ ] Social features (sharing reviews)
- [ ] Email notifications for new reviews
- [ ] Analytics dashboard for landlords
- [ ] Mobile app API
- [ ] Progressive Web App (PWA) support
