# DocManager — ERP-lite Document Management System

A professional, mobile-responsive business document management system built with Next.js, TypeScript, and PostgreSQL. Covers the complete sales workflow: **Quotation → Purchase Order → Delivery Order → Invoice**.

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Authentication** | JWT-based login, role-based access (admin/user), session management |
| **Companies** | Sender company profiles with logos, tax details, bank info |
| **Customers** | Receiver profiles with contact details, address management |
| **Quotations** | Split-screen editor with live preview, revisions, duplicate, status workflow |
| **Purchase Orders** | Real file upload (PDF/images), link POs to quotations, status tracking |
| **Delivery Orders** | Generate from approved quotations, item management, delivery tracking |
| **Invoices** | Generate from DOs, payment status tracking (UNPAID/PAID/OVERDUE) |
| **Dashboard** | Key metrics, status counts, revenue overview |
| **Audit Logs** | Track CREATED, EDITED, DELETED, REVISED, UPLOADED actions |
| **Admin Settings** | Feature toggles for each module |

### Document Features

- **PDF Export** — Generate professional PDF documents for quotations, delivery orders, and invoices
- **Email** — Send quotations and invoices with PDF attachments via SMTP
- **Print** — Browser print with print-optimized CSS
- **Document IDs** — Auto-generated: `COMPANYSHORT-TYPE-YYYYMMDD-###` (e.g., `ACME-Q-20260501-001`)
- **Revisions** — Revision tracking with `-R1`, `-R2` suffixes
- **File Upload** — Upload PO documents (PDF, PNG, JPG, DOC, DOCX — max 10MB)

### Mobile Responsive

- Full responsive layout for desktop, tablet, and mobile
- Collapsible sidebar navigation
- Optimized tables with hidden columns on smaller screens

## Tech Stack

- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM v7
- **Auth**: JWT via `jose`, password hashing via `bcryptjs`
- **PDF**: `@react-pdf/renderer` for server-side PDF generation
- **Email**: `nodemailer` for SMTP email sending
- **Icons**: Lucide React
- **Dates**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/Kavi-1004/Test.git
   cd Test
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/docmanager"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional: Email (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="Your Company <your-email@gmail.com>"
   ```

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) and login:
   - **Email**: `admin@docmanager.com`
   - **Password**: `admin123`

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── companies/        # Company management
│   │   ├── customers/        # Customer management
│   │   ├── quotations/       # Quotation list + editor
│   │   ├── purchase-orders/  # PO upload + management
│   │   ├── delivery-orders/  # DO creation + management
│   │   ├── invoices/         # Invoice creation + management
│   │   ├── logs/             # Audit log viewer
│   │   ├── settings/         # Admin feature toggles
│   │   └── page.tsx          # Dashboard home
│   ├── api/                  # REST API routes
│   │   ├── auth/             # Login, logout, session
│   │   ├── companies/        # CRUD + [id]
│   │   ├── customers/        # CRUD + [id]
│   │   ├── quotations/       # CRUD + [id] + pdf + email
│   │   ├── purchase-orders/  # CRUD + [id]
│   │   ├── delivery-orders/  # CRUD + [id] + pdf
│   │   ├── invoices/         # CRUD + [id] + pdf + email
│   │   ├── upload/           # File upload + serve
│   │   ├── logs/             # Audit log query
│   │   └── settings/         # Feature toggles
│   └── login/                # Login page
├── components/
│   ├── layout/Sidebar.tsx    # Navigation sidebar
│   └── quotations/           # QuotationEditor + QuotationPreview
├── lib/
│   ├── auth.ts               # JWT auth helpers
│   ├── email.ts              # SMTP email sending
│   ├── id-generator.ts       # Document ID generation
│   ├── log.ts                # Audit log helper
│   ├── prisma.ts             # Prisma client
│   ├── utils.ts              # Formatting utilities
│   └── pdf/                  # PDF document templates
│       ├── quotation-pdf.tsx
│       ├── delivery-order-pdf.tsx
│       └── invoice-pdf.tsx
└── middleware.ts              # Auth middleware
prisma/
├── schema.prisma             # Database schema (15 tables)
└── seed.ts                   # Admin user + roles seed
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password, returns JWT cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current session user |

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all companies (supports `?search=`) |
| POST | `/api/companies` | Create company |
| GET | `/api/companies/[id]` | Get company by ID |
| PUT | `/api/companies/[id]` | Update company |
| DELETE | `/api/companies/[id]` | Delete company |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers (supports `?search=`) |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers/[id]` | Get customer by ID |
| PUT | `/api/customers/[id]` | Update customer |
| DELETE | `/api/customers/[id]` | Delete customer |

### Quotations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotations` | List quotations (supports `?search=`, `?status=`) |
| POST | `/api/quotations` | Create quotation |
| GET | `/api/quotations/[id]` | Get quotation with items, company, customer |
| PUT | `/api/quotations/[id]` | Update quotation |
| DELETE | `/api/quotations/[id]` | Delete quotation |
| PATCH | `/api/quotations/[id]` | Revise (`action: "revise"`) or Duplicate (`action: "duplicate"`) |
| GET | `/api/quotations/[id]/pdf` | Download quotation as PDF |
| POST | `/api/quotations/[id]/email` | Email quotation with PDF attachment |

### Purchase Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders` | List all POs |
| POST | `/api/purchase-orders` | Create PO (link to quotation) |
| GET | `/api/purchase-orders/[id]` | Get PO details |
| PUT | `/api/purchase-orders/[id]` | Update PO status |
| DELETE | `/api/purchase-orders/[id]` | Delete PO |

### Delivery Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/delivery-orders` | List all DOs |
| POST | `/api/delivery-orders` | Create DO |
| GET | `/api/delivery-orders/[id]` | Get DO with items |
| PUT | `/api/delivery-orders/[id]` | Update DO |
| DELETE | `/api/delivery-orders/[id]` | Delete DO |
| GET | `/api/delivery-orders/[id]/pdf` | Download DO as PDF |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices (supports `?search=`, `?status=`) |
| POST | `/api/invoices` | Create invoice |
| GET | `/api/invoices/[id]` | Get invoice with items |
| PUT | `/api/invoices/[id]` | Update invoice |
| DELETE | `/api/invoices/[id]` | Delete invoice |
| GET | `/api/invoices/[id]/pdf` | Download invoice as PDF |
| POST | `/api/invoices/[id]/email` | Email invoice with PDF attachment |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file (multipart/form-data) |
| GET | `/api/upload/[filename]` | Serve uploaded file |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Query audit logs |
| GET | `/api/settings` | Get feature settings |
| PUT | `/api/settings` | Update feature settings |

## Document ID Format

Documents use auto-generated IDs based on company short code:

```
COMPANYSHORT-TYPE-YYYYMMDD-###
```

Examples:
- Quotation: `ACME-Q-20260501-001`
- Delivery Order: `ACME-DO-20260501-001`
- Invoice: `ACME-I-20260501-001`
- Revision: `ACME-Q-20260501-001-R1`

## Totals Calculation

```
Subtotal = Sum of (Quantity × Unit Price) for each item
Tax Amount = (Subtotal - Discount) × (Tax Rate / 100)
Grand Total = Subtotal - Discount + Tax Amount
```

## Email Configuration

Email sending requires SMTP configuration via environment variables. The system supports:
- Sending quotations with PDF attachments
- Sending invoices with PDF attachments
- Custom subject and message body
- Auto-populated recipient from customer email

If SMTP is not configured, the email feature will return an informative error message.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Database

The system uses 15 PostgreSQL tables:

- `User`, `Role` — Authentication & authorization
- `Company` — Sender company profiles
- `Customer` — Receiver/client profiles
- `Quotation`, `QuotationItem` — Quotation documents & line items
- `PurchaseOrder` — Customer PO uploads
- `DeliveryOrder`, `DeliveryOrderItem` — Delivery tracking
- `Invoice`, `InvoiceItem` — Billing documents & line items
- `Log` — Audit trail
- `FeatureSetting` — Admin feature toggles
- `PaymentMethod` — Payment method configuration

## Business Value

This ERP-lite platform is suitable for:
- Trading companies
- Construction firms
- Distribution businesses
- Service providers
- Manufacturing SMEs

## Future Expansion (Phase 10)

- Supplier management
- Procurement module
- Inventory tracking
- Accounting integration
- POS module
- Advanced analytics/reporting
