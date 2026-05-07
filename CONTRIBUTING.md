# Contributing to DocManager

Thank you for your interest in contributing to DocManager! This guide will help you get set up and follow the project's conventions.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Conventions](#code-conventions)
6. [Database Changes](#database-changes)
7. [Adding a New Module](#adding-a-new-module)
8. [Testing](#testing)
9. [Submitting Changes](#submitting-changes)

---

## Prerequisites

- **Node.js** 18 or later
- **PostgreSQL** 14 or later
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

---

## Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/Kavi-1004/Test.git
cd Test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/docmanager"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with:
- Email: `admin@docmanager.com`
- Password: `admin123`

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes (uses layout with Sidebar)
│   │   ├── companies/        # Company CRUD page
│   │   ├── customers/        # Customer CRUD page
│   │   ├── quotations/       # Quotation list + editor (new, [id]/edit)
│   │   ├── purchase-orders/  # PO management page
│   │   ├── delivery-orders/  # DO list + creation form
│   │   ├── invoices/         # Invoice list + creation form
│   │   ├── logs/             # Audit log viewer
│   │   ├── settings/         # Feature toggle settings
│   │   ├── layout.tsx        # Dashboard shell (Sidebar + main content)
│   │   └── page.tsx          # Dashboard home with metrics
│   ├── api/                  # REST API route handlers
│   │   ├── auth/             # Login, logout, session
│   │   ├── companies/        # Company CRUD
│   │   ├── customers/        # Customer CRUD
│   │   ├── quotations/       # Quotation CRUD + PDF + email
│   │   ├── purchase-orders/  # PO CRUD
│   │   ├── delivery-orders/  # DO CRUD + PDF
│   │   ├── invoices/         # Invoice CRUD + PDF + email
│   │   ├── upload/           # File upload + serve
│   │   ├── logs/             # Audit log query
│   │   └── settings/         # Feature settings
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   └── globals.css           # Global styles + Tailwind imports
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx       # Navigation sidebar
│   └── quotations/
│       ├── QuotationEditor.tsx   # Split-screen quotation editor
│       └── QuotationPreview.tsx  # Live preview component
├── lib/
│   ├── auth.ts               # JWT authentication helpers
│   ├── email.ts              # SMTP email sending
│   ├── id-generator.ts       # Document ID generation
│   ├── log.ts                # Audit log helper
│   ├── prisma.ts             # Prisma client singleton
│   ├── utils.ts              # Formatting utilities
│   └── pdf/                  # PDF document templates
│       ├── quotation-pdf.tsx
│       ├── delivery-order-pdf.tsx
│       └── invoice-pdf.tsx
├── generated/prisma/         # Prisma generated client (do not edit)
└── middleware.ts              # Auth middleware for route protection
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Database seeding script
```

---

## Development Workflow

### Branch Naming

Use descriptive branch names:
```
feature/add-supplier-module
fix/quotation-total-calculation
docs/update-api-reference
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Running the Linter

Always run the linter before committing:

```bash
npm run lint
```

The project uses ESLint with `eslint-config-next` for Next.js-specific rules.

---

## Code Conventions

### TypeScript

- Strict mode is enabled (`"strict": true`)
- Use TypeScript interfaces for all data shapes
- Avoid `any` — use proper types or `unknown` with type narrowing
- Import paths use the `@/` alias (maps to `./src/`)

### React Components

- Use functional components with hooks
- Client components must have `"use client"` at the top
- Server components (default in App Router) should not use `useState`, `useEffect`, etc.
- Keep components focused — one responsibility per file

### Styling

- **Tailwind CSS 4** for all styling
- Follow existing class patterns: rounded corners (`rounded-lg`, `rounded-xl`), consistent spacing (`p-4`, `p-6`, `gap-3`, `gap-4`)
- Use responsive classes: `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Hide columns on smaller screens with `hidden md:table-cell`
- Icons from `lucide-react` — keep sizes consistent (`w-4 h-4` for actions, `w-5 h-5` for nav, `w-8 h-8` for features)

### API Routes

- All API routes are in `src/app/api/`
- Use Next.js Route Handlers (App Router)
- Always validate required fields and return appropriate status codes
- Use `getSession()` for authentication checks
- Use `createLog()` to record audit events for write operations
- Return `NextResponse.json()` for all responses

### File Naming

- Pages: `page.tsx` (Next.js convention)
- Components: PascalCase (`QuotationEditor.tsx`)
- Utilities: camelCase (`id-generator.ts`)
- API routes: `route.ts` or `route.tsx` (for PDF generation)

---

## Database Changes

### Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes to your development database
3. Run `npx prisma generate` to update the Prisma Client

### Adding Seed Data

Edit `prisma/seed.ts` and run:

```bash
npx prisma db seed
```

### Important Notes

- The Prisma client output is at `src/generated/prisma/` — do not edit these files
- The project uses `@prisma/adapter-pg` for PostgreSQL connection pooling
- Always include relations in queries where the frontend expects them

---

## Adding a New Module

To add a new module (e.g., Suppliers):

### 1. Database

Add the model to `prisma/schema.prisma`:

```prisma
model Supplier {
  id        String   @id @default(uuid())
  name      String
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run `npx prisma db push && npx prisma generate`.

### 2. API Routes

Create `src/app/api/suppliers/route.ts` for list + create:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(request: NextRequest) { /* ... */ }
export async function POST(request: NextRequest) { /* ... */ }
```

Create `src/app/api/suppliers/[id]/route.ts` for get, update, delete.

### 3. Frontend Page

Create `src/app/(dashboard)/suppliers/page.tsx` — follow the pattern of existing CRUD pages (companies, customers).

### 4. Navigation

Add the route to `navItems` in `src/components/layout/Sidebar.tsx`.

### 5. Permissions

Update `prisma/seed.ts` to include the new permissions in admin/user roles.

---

## Testing

The project does not currently have automated tests. When contributing:

- Manually test your changes in the browser
- Test on different screen sizes (desktop, tablet, mobile)
- Verify API endpoints using the browser dev tools or a tool like `curl`
- Check the audit logs to confirm write operations are logged

---

## Submitting Changes

1. Create a branch from the main branch
2. Make your changes following the conventions above
3. Run `npm run lint` to check for issues
4. Run `npm run build` to verify the production build passes
5. Commit with a descriptive message:
   ```
   feat: Add supplier management module
   fix: Correct invoice tax calculation
   docs: Update API documentation
   ```
6. Open a Pull Request with:
   - A clear description of the changes
   - Screenshots for UI changes
   - Any relevant testing notes
