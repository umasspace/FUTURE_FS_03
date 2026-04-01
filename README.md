# umasCRM

> **⚠️ First Time Login Instructions:**
> 1. Enter credentials and click **Sign In**
> 2. If login fails, try clicking **Sign In** again (2-3 times)
> 3. After successful login, **reload the page** once
> 4. All demo data (contacts, companies, deals, tasks) will now appear

A modern CRM application built with Next.js 16, Tailwind CSS 4, shadcn/ui, Prisma, and PostgreSQL.

## Features

- **Dashboard** - Overview with metrics, charts, recent activities, upcoming tasks, and global search
- **Contacts** - Full CRUD with search, status filtering, and detail views
- **Companies** - Grid/table views with search, contact & deal counts
- **Deals** - Kanban board with drag-and-drop pipeline management
- **Tasks** - Task management with priority levels and due dates
- **Analytics** - Business insights and reporting

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Database:** SQLite with Prisma ORM
- **State Management:** Zustand (persisted to localStorage)
- **Charts:** Recharts
- **Auth:** Custom credentials-based authentication
- **Runtime:** Bun / Node.js

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js 18+
- npm/pnpm/yarn (if not using Bun)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
# Create a .env file with:
DATABASE_URL="file:../db/custom.db"

# Generate Prisma client
npx prisma generate

# Seed the database (optional - creates demo data)
npx prisma db seed
```

### Development

```bash
bun run dev
# or
npx next dev -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Email:** `admin@umascrm.com`
- **Password:** `admin123`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # App shell (sidebar, header, routing)
│   └── api/
│       ├── auth/login/          # Login API
│       ├── contacts/            # Contacts CRUD
│       ├── companies/           # Companies CRUD
│       ├── deals/               # Deals CRUD
│       ├── tasks/               # Tasks CRUD
│       ├── dashboard/           # Dashboard aggregation
│       └── search/              # Global search
├── components/
│   ├── crm/                     # CRM views & components
│   └── ui/                      # shadcn/ui components
├── hooks/                       # Custom React hooks
└── lib/                         # Utilities, store, DB client
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database |

## Global Search

The dashboard includes a global search feature accessible via the header search bar. It searches across:

- **Contacts** - Name, email, job title
- **Companies** - Name, industry, website
- **Deals** - Title, description
- **Tasks** - Title, description

Results are displayed grouped by category with relevant details.
