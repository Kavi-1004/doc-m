---
name: testing-docmanager
description: End-to-end testing guide for DocManager application. Use when verifying UI, validation, CRUD, and document workflow changes.
---

# Testing DocManager

## Prerequisites

1. **PostgreSQL** must be running locally:
   ```bash
   sudo apt-get install -y postgresql postgresql-client
   sudo pg_ctlcluster 14 main start
   ```

2. **Create database and user** (if not already done):
   ```bash
   sudo -u postgres psql -c "CREATE USER docmanager WITH PASSWORD 'docmanager';"
   sudo -u postgres psql -c "CREATE DATABASE docmanager OWNER docmanager;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE docmanager TO docmanager;"
   ```

3. **Environment file** — create `.env` in repo root:
   ```
   DATABASE_URL="postgresql://docmanager:docmanager@localhost:5432/docmanager"
   NEXTAUTH_SECRET="test-secret-key-for-local-dev"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Install dependencies and seed database**:
   ```bash
   npm install
   npx prisma generate && npx prisma db push
   npx prisma db seed
   ```

5. **Start dev server**:
   ```bash
   npm run dev
   ```

## Test Account

- **Email**: admin@docmanager.com
- **Password**: admin123
- **Role**: Admin (full access to all modules)

## Key Test Flows

### Companies & Customers CRUD
- Create, edit, delete with toast notifications (bottom-right green toasts)
- Email validation: must have valid TLD (e.g., `user@domain.com`)
- Tax rate: must be 0–100
- Short code: must be unique (API returns 409 on duplicate)

### Document Pages (Quotations, Delivery Orders, Invoices)
- New document pages use side-by-side grid: form left, Live Preview right
- Required field validation: Company and Customer selects show red borders + inline error text
- Items must have at least a description filled in
- Discount must be >= 0, Tax Rate must be 0–100

### Settings
- Default Tax Rate validated 0–100 with error toast on out-of-range
- Module toggles (Delivery Order, Invoice, Purchase Order, Quotation)

### Loading States
- All list pages (Companies, Customers, Invoices, Delivery Orders) show a spinner during data fetch

## Notes

- The app uses Next.js App Router with Turbopack
- Toast notifications use a custom React Context provider (`ToastProvider` in layout)
- No CI is configured — rely on `npm run lint` and `npx tsc --noEmit` for checks
- PostgreSQL version may vary (14+ works); adjust `pg_ctlcluster` version accordingly
- The Prisma seed script creates the admin user and sample data automatically
