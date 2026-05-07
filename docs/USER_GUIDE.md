# DocManager — User Guide

A comprehensive guide for using the DocManager business document management system.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Companies](#companies)
4. [Customers](#customers)
5. [Quotations](#quotations)
6. [Purchase Orders](#purchase-orders)
7. [Delivery Orders](#delivery-orders)
8. [Invoices](#invoices)
9. [Audit Logs](#audit-logs)
10. [Settings](#settings)
11. [Document Workflow](#document-workflow)
12. [PDF Export & Email](#pdf-export--email)
13. [Tips & Shortcuts](#tips--shortcuts)

---

## Getting Started

### Logging In

1. Open the application in your browser (default: `http://localhost:3000`).
2. Enter your email and password on the login page.
3. Click **Sign in**.

**Default admin credentials:**
- Email: `admin@docmanager.com`
- Password: `admin123`

> Change the default password after your first login in a production environment.

### Navigation

The sidebar on the left provides access to all modules:

| Icon | Module | Description |
|------|--------|-------------|
| Dashboard | **Dashboard** | Overview metrics and quick actions |
| Building | **Companies** | Manage sender company profiles |
| Users | **Customers** | Manage customer/receiver profiles |
| File | **Quotations** | Create and manage quotations |
| Upload | **Purchase Orders** | Upload and track customer POs |
| Truck | **Delivery Orders** | Create and manage delivery orders |
| Receipt | **Invoices** | Create invoices and track payments |
| Clipboard | **Audit Logs** | View all system activity |
| Settings | **Settings** | Configure system features |

On mobile devices, tap the menu icon (top-left) to toggle the sidebar.

---

## Dashboard

The dashboard provides an at-a-glance overview of your business:

### Metric Cards
- **Total Quotations** — Number of all quotations in the system
- **Approved Quotations** — Number of quotations with APPROVED status
- **PO Received** — Total purchase orders uploaded
- **DO Generated** — Total delivery orders created
- **Invoices Issued** — Total invoices in the system
- **Paid Invoices** — Number of fully paid invoices
- **Total Revenue** — Sum of all paid invoice grand totals

Click any metric card to navigate to the corresponding module.

### Quick Actions
Create new documents directly from the dashboard:
- **New Quotation** — Jump to the quotation editor
- **Manage Companies** — Go to company management
- **New Delivery Order** — Create a delivery order
- **New Invoice** — Create a new invoice

### Document Workflow
The dashboard displays the recommended 4-step workflow:
1. Create Quotation → 2. Receive PO → 3. Create Delivery Order → 4. Issue Invoice

---

## Companies

Companies represent your sender/business entities. Each company has a **short code** used in document ID generation.

### Adding a Company

1. Click **Add Company**.
2. Fill in the required fields:
   - **Company Name** (required)
   - **Short Code** (required, max 10 characters, auto-uppercased) — Used in document IDs (e.g., `ACME-Q-20260501-001`)
3. Optionally fill in:
   - Address, Phone, Email, Website
   - Tax ID, Tax Rate (%)
   - Bank Name, Bank Account, Bank Branch, SWIFT Code
4. Click **Create**.

### Editing a Company

1. Click the pencil icon on the company row.
2. Modify the fields.
3. Click **Update**.

### Deleting a Company

1. Click the trash icon on the company row.
2. Confirm the deletion in the dialog.

> Companies linked to existing quotations, delivery orders, or invoices cannot be deleted until those documents are removed.

### Searching

Use the search bar to filter companies by name.

---

## Customers

Customers represent the receivers/buyers of your documents.

### Adding a Customer

1. Click **Add Customer**.
2. Fill in:
   - **Customer Name** (required)
   - Contact Person, Email, Phone, Address, Tax ID (optional)
3. Click **Create**.

### Editing / Deleting

Same as companies — use the pencil (edit) or trash (delete) icons in the table.

### Searching

Use the search bar to filter by customer name.

---

## Quotations

Quotations are the starting point of the document workflow. The editor provides a **split-screen** layout with a form on the left and a live preview on the right.

### Creating a Quotation

1. Navigate to **Quotations** → click **New Quotation**.
2. Select a **Company** (sender) and **Customer** (receiver).
3. Enter an optional **Title** and **Date**.
4. Add line items:
   - **Description** — Item description
   - **Qty** — Quantity
   - **Unit** — Unit of measurement (default: "pcs")
   - **Unit Price** — Price per unit
   - The **Total** is calculated automatically (Qty × Unit Price)
5. Click **Add Item** to add more line items.
6. Set optional fields:
   - **Discount** — Flat discount amount
   - **Tax Rate (%)** — Applied to (Subtotal - Discount)
   - **Terms & Conditions**, **Warranty**, **Footer**
7. Click **Save Draft** or **Save & Send**.

### Quotation Statuses

| Status | Description |
|--------|-------------|
| **DRAFT** | Initial state, still being edited |
| **SENT** | Sent to the customer for review |
| **APPROVED** | Customer has approved the quotation |
| **REJECTED** | Customer has rejected the quotation |
| **REVISED** | A new revision has been created |
| **EXPIRED** | Quotation is no longer valid |

### Totals Calculation

```
Subtotal  = Sum of (Quantity × Unit Price) for each item
Tax Amount = (Subtotal - Discount) × (Tax Rate / 100)
Grand Total = Subtotal - Discount + Tax Amount
```

### Revising a Quotation

1. In the quotations list, click the **Revise** button (refresh icon).
2. A new quotation is created with `-R1`, `-R2`, etc. suffix.
3. The original quotation is marked as **REVISED**.
4. You are redirected to edit the new revision.

### Duplicating a Quotation

Click the **Duplicate** button (copy icon) to create an exact copy with a new quotation number.

### Searching & Filtering

- Use the **search bar** to search by quotation number, title, or customer name.
- Use the **status dropdown** to filter by status.

---

## Purchase Orders

Purchase Orders (POs) represent customer confirmations, typically linking back to a quotation.

### Uploading a Purchase Order

1. Click **Upload PO**.
2. Select a **Linked Quotation** (required) — shows quotations with SENT status.
3. Enter an optional **PO Number**.
4. Click **Choose File** to upload the PO document.
   - Accepted formats: PDF, PNG, JPG, DOC, DOCX
   - Maximum size: 10 MB
5. Add optional **Notes**.
6. Click **Upload PO**.

### PO Statuses

| Status | Description |
|--------|-------------|
| **RECEIVED** | PO has been received |
| **PROCESSING** | PO is being processed |
| **COMPLETED** | PO processing is complete |

### Viewing the Uploaded File

Click the download icon on a PO row to view/download the uploaded document.

---

## Delivery Orders

Delivery Orders (DOs) track the delivery of goods to customers.

### Creating a Delivery Order

1. Navigate to **Delivery Orders** → click **New Delivery Order**.
2. Optionally select a **From Quotation** to auto-fill company, customer, and items.
3. Select **Company** and **Customer** (required).
4. Set an optional **Delivery Date**.
5. Add/modify line items:
   - Description, Quantity, Unit
6. Add optional **Footer Notes**.
7. Click **Save**.

### DO Statuses

| Status | Description |
|--------|-------------|
| **PENDING** | Awaiting dispatch |
| **DISPATCHED** | Goods have been shipped |
| **DELIVERED** | Goods have been received |
| **CANCELLED** | Delivery order cancelled |

### PDF Export

Click the **Download** icon on a DO row to generate and download a PDF.

---

## Invoices

Invoices track billing and payment status.

### Creating an Invoice

1. Navigate to **Invoices** → click **New Invoice**.
2. Optionally select a **From Delivery Order** to auto-fill company, customer, and items.
3. Select **Company** and **Customer** (required).
4. Set an optional **Due Date**.
5. Add/modify line items with pricing:
   - Description, Quantity, Unit, Unit Price
6. Set **Discount** and **Tax Rate** as needed.
7. Add optional **Footer Notes**.
8. Click **Save**.

### Invoice Statuses

| Status | Description |
|--------|-------------|
| **UNPAID** | Payment not yet received |
| **PARTIALLY_PAID** | Partial payment received |
| **PAID** | Fully paid |
| **OVERDUE** | Past due date and unpaid |
| **CANCELLED** | Invoice cancelled |

You can change the payment status directly from the invoice list using the status dropdown on each row.

### PDF Export

Click the **Download** icon to generate and download the invoice as a PDF.

### Emailing an Invoice

1. Click the **Email** icon (envelope) on an invoice row.
2. Enter the recipient email address.
3. Click **Send Email**.

The invoice PDF is automatically attached to the email.

---

## Audit Logs

The audit log tracks all significant actions in the system.

### Logged Actions

| Action | Description |
|--------|-------------|
| **CREATED** | A new record was created |
| **EDITED** | An existing record was updated |
| **DELETED** | A record was removed |
| **REVISED** | A quotation revision was created |
| **UPLOADED** | A file was uploaded |

### Filtering Logs

- **Entity filter** — Filter by entity type (Company, Customer, Quotation, etc.)
- **Action filter** — Filter by action type (Created, Edited, Deleted, Revised)

Each log entry shows the timestamp, user name, action, entity type, and details.

---

## Settings

Admin users can configure system features from the Settings page.

### Feature Toggles

Enable or disable entire modules:
- **Quotation Module** — Enable/disable quotation creation
- **Purchase Order Module** — Enable/disable PO tracking
- **Delivery Order Module** — Enable/disable DO generation
- **Invoice Module** — Enable/disable invoice generation

### Default Values

- **Default Tax Rate (%)** — Set the default tax rate for new documents
- **System Name** — Customize the name displayed in the application

Click **Save Settings** to apply changes.

---

## Document Workflow

The recommended business workflow in DocManager:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌───────────┐
│  Quotation  │────▶│ Purchase     │────▶│ Delivery Order  │────▶│  Invoice  │
│  (DRAFT →   │     │ Order (PO)   │     │ (PENDING →      │     │ (UNPAID → │
│   SENT →    │     │              │     │  DISPATCHED →   │     │  PAID)    │
│   APPROVED) │     │              │     │  DELIVERED)     │     │           │
└─────────────┘     └──────────────┘     └─────────────────┘     └───────────┘
```

### Step-by-Step

1. **Create a Quotation** — Draft and send a price quote to your customer.
2. **Receive a PO** — When the customer approves, upload their purchase order.
3. **Create a Delivery Order** — Generate a DO from the approved quotation for shipping.
4. **Issue an Invoice** — Create an invoice from the delivery order for billing.

### Document ID Format

All documents use auto-generated IDs:

```
COMPANYSHORT-TYPE-YYYYMMDD-###
```

| Document | Type Code | Example |
|----------|-----------|---------|
| Quotation | Q | `ACME-Q-20260501-001` |
| Delivery Order | DO | `ACME-DO-20260501-001` |
| Invoice | I | `ACME-I-20260501-001` |
| Revision | R# suffix | `ACME-Q-20260501-001-R1` |

---

## PDF Export & Email

### PDF Export
Available for Quotations, Delivery Orders, and Invoices:
- Click the **Download** icon in the list view
- Or click the **PDF** button in the quotation editor

PDFs include company details, customer information, itemized tables, totals, and footer notes.

### Email Sending
Available for Quotations and Invoices:
- Click the **Email** button/icon
- Enter the recipient email address
- Optionally customize the subject and message (quotations)
- The PDF is auto-generated and attached

> Email requires SMTP configuration. See the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for setup instructions.

### Printing
In the quotation editor, click the **Print** button to use the browser's print dialog with print-optimized CSS.

---

## Tips & Shortcuts

- **Quick navigation** — Click any dashboard metric card to jump to that module
- **Auto-fill** — When creating DOs or Invoices, selecting a linked quotation/DO auto-fills company, customer, and items
- **Tax rate inheritance** — Selecting a company in the quotation editor auto-fills the company's default tax rate
- **Search everywhere** — All list pages have search bars that filter in real-time
- **Mobile friendly** — The sidebar collapses on mobile; tap the menu icon to toggle
- **Bulk actions** — Use the status dropdown on invoice rows to quickly update payment status
