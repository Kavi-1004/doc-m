# DocManager — API Documentation

Complete REST API reference for the DocManager document management system.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Companies](#companies)
4. [Customers](#customers)
5. [Quotations](#quotations)
6. [Purchase Orders](#purchase-orders)
7. [Delivery Orders](#delivery-orders)
8. [Invoices](#invoices)
9. [File Upload](#file-upload)
10. [Audit Logs](#audit-logs)
11. [Settings](#settings)
12. [Error Handling](#error-handling)

---

## Overview

- **Base URL**: `http://localhost:3000/api`
- **Content Type**: `application/json` (except file uploads which use `multipart/form-data`)
- **Authentication**: JWT token stored in `auth-token` HTTP-only cookie
- All write operations (POST, PUT, DELETE, PATCH) require authentication
- All responses return JSON

---

## Authentication

### POST `/api/auth/login`

Log in with email and password. Returns user data and sets an HTTP-only JWT cookie.

**Request Body:**
```json
{
  "email": "admin@docmanager.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@docmanager.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["companies:read", "companies:write", "..."]
  }
}
```

**Errors:**
- `400` — Email and password are required
- `401` — Invalid email or password

**Cookie Set:** `auth-token` (HTTP-only, 24h expiry)

---

### POST `/api/auth/logout`

Clear the authentication cookie.

**Response (200):**
```json
{ "success": true }
```

---

### GET `/api/auth/me`

Get the current authenticated user's session.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@docmanager.com",
    "name": "Admin User",
    "role": "admin",
    "permissions": ["..."]
  }
}
```

**Errors:**
- `401` — Not authenticated

---

## Companies

### GET `/api/companies`

List all companies. Supports optional search.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by company name or short code (case-insensitive) |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "shortCode": "ACME",
    "address": "123 Business St",
    "phone": "+1234567890",
    "email": "info@acme.com",
    "website": "https://acme.com",
    "logoUrl": null,
    "taxId": "TAX-001",
    "taxRate": 7.0,
    "bankName": "Business Bank",
    "bankAccount": "1234567890",
    "bankBranch": "Main Branch",
    "swiftCode": "BBUSUS33",
    "createdAt": "2026-05-01T00:00:00.000Z",
    "updatedAt": "2026-05-01T00:00:00.000Z"
  }
]
```

---

### POST `/api/companies`

Create a new company. **Requires authentication.**

**Request Body:**
```json
{
  "name": "Acme Corp",
  "shortCode": "ACME",
  "address": "123 Business St",
  "phone": "+1234567890",
  "email": "info@acme.com",
  "website": "https://acme.com",
  "taxId": "TAX-001",
  "taxRate": "7.0",
  "bankName": "Business Bank",
  "bankAccount": "1234567890",
  "bankBranch": "Main Branch",
  "swiftCode": "BBUSUS33"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Company name |
| `shortCode` | Yes | Short code for document IDs (max 10 chars, auto-uppercased) |
| `address` | No | Company address |
| `phone` | No | Phone number |
| `email` | No | Email address |
| `website` | No | Website URL |
| `taxId` | No | Tax identification number |
| `taxRate` | No | Default tax rate (%) |
| `bankName` | No | Bank name |
| `bankAccount` | No | Bank account number |
| `bankBranch` | No | Bank branch |
| `swiftCode` | No | SWIFT/BIC code |

**Response (201):** The created company object.

**Errors:**
- `400` — Name and short code are required
- `401` — Unauthorized

---

### GET `/api/companies/[id]`

Get a single company by ID.

**Response (200):** Company object.

**Errors:**
- `404` — Company not found

---

### PUT `/api/companies/[id]`

Update an existing company. **Requires authentication.**

**Request Body:** Same fields as POST (all optional for update).

**Response (200):** Updated company object.

---

### DELETE `/api/companies/[id]`

Delete a company. **Requires authentication.**

**Response (200):**
```json
{ "success": true }
```

---

## Customers

### GET `/api/customers`

List all customers. Supports optional search.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by customer name (case-insensitive) |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Client Inc",
    "contactPerson": "John Doe",
    "email": "john@client.com",
    "phone": "+1234567890",
    "address": "456 Client Ave",
    "taxId": "CT-001",
    "createdAt": "2026-05-01T00:00:00.000Z",
    "updatedAt": "2026-05-01T00:00:00.000Z"
  }
]
```

---

### POST `/api/customers`

Create a new customer. **Requires authentication.**

**Request Body:**
```json
{
  "name": "Client Inc",
  "contactPerson": "John Doe",
  "email": "john@client.com",
  "phone": "+1234567890",
  "address": "456 Client Ave",
  "taxId": "CT-001"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Customer name |
| `contactPerson` | No | Primary contact person |
| `email` | No | Email address |
| `phone` | No | Phone number |
| `address` | No | Customer address |
| `taxId` | No | Tax identification number |

**Response (201):** The created customer object.

---

### GET `/api/customers/[id]`

Get a single customer by ID.

---

### PUT `/api/customers/[id]`

Update a customer. **Requires authentication.**

---

### DELETE `/api/customers/[id]`

Delete a customer. **Requires authentication.**

---

## Quotations

### GET `/api/quotations`

List all quotations with company, customer, and item counts.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by quotation number, title, or customer name |
| `status` | string | Filter by status: `DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `REVISED`, `EXPIRED` |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "quotationNumber": "ACME-Q-20260501-001",
    "title": "Website Development",
    "status": "DRAFT",
    "discount": 0,
    "taxRate": 7,
    "taxAmount": 70,
    "subtotal": 1000,
    "grandTotal": 1070,
    "terms": "Net 30",
    "warranty": "1 year",
    "footer": "Thank you for your business",
    "revisionNumber": 0,
    "parentId": null,
    "date": "2026-05-01T00:00:00.000Z",
    "company": { "name": "Acme Corp", "shortCode": "ACME" },
    "customer": { "name": "Client Inc" },
    "_count": { "items": 3, "purchaseOrders": 0 }
  }
]
```

---

### POST `/api/quotations`

Create a new quotation. **Requires authentication.**

**Request Body:**
```json
{
  "companyId": "uuid",
  "customerId": "uuid",
  "title": "Website Development",
  "status": "DRAFT",
  "items": [
    {
      "description": "Frontend Development",
      "quantity": 1,
      "unit": "lot",
      "unitPrice": 5000,
      "sortOrder": 0
    }
  ],
  "discount": 0,
  "taxRate": 7,
  "terms": "Net 30",
  "warranty": "1 year",
  "footer": "Thank you"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `companyId` | Yes | Sender company ID |
| `customerId` | Yes | Receiver customer ID |
| `title` | No | Quotation title |
| `status` | No | Initial status (default: `DRAFT`) |
| `items` | No | Array of line items |
| `discount` | No | Flat discount amount (default: 0) |
| `taxRate` | No | Tax percentage (default: 0) |
| `terms` | No | Terms and conditions text |
| `warranty` | No | Warranty information |
| `footer` | No | Footer text |

**Response (201):** Created quotation with company, customer, and items.

The `quotationNumber` is auto-generated as `COMPANYSHORT-Q-YYYYMMDD-###`.

---

### GET `/api/quotations/[id]`

Get a single quotation with all relations (company, customer, items, POs, DOs, invoices).

---

### PUT `/api/quotations/[id]`

Update a quotation. **Requires authentication.** Replaces all items.

**Request Body:** Same as POST.

---

### DELETE `/api/quotations/[id]`

Delete a quotation and its items. **Requires authentication.**

---

### PATCH `/api/quotations/[id]`

Perform special actions on a quotation. **Requires authentication.**

#### Revise
```json
{ "action": "revise" }
```
Creates a new revision with `-R#` suffix. The original quotation status is set to `REVISED`.

**Response (200):** The new revision quotation object.

#### Duplicate
```json
{ "action": "duplicate" }
```
Creates an exact copy with a new quotation number.

**Response (200):** The duplicated quotation object.

---

### GET `/api/quotations/[id]/pdf`

Download the quotation as a PDF document.

**Response:** PDF file (`application/pdf`)

---

### POST `/api/quotations/[id]/email`

Send the quotation via email with PDF attachment. **Requires SMTP configuration.**

**Request Body:**
```json
{
  "to": "client@example.com",
  "subject": "Quotation ACME-Q-20260501-001",
  "message": "Please find attached our quotation."
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `to` | Yes | Recipient email address |
| `subject` | No | Email subject (auto-generated if empty) |
| `message` | No | Additional message body |

**Response (200):**
```json
{ "success": true }
```

---

## Purchase Orders

### GET `/api/purchase-orders`

List all purchase orders with linked quotation and customer.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by PO number or quotation number |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "poNumber": "PO-2026-001",
    "status": "RECEIVED",
    "fileUrl": "/api/upload/abc123.pdf",
    "fileName": "purchase-order.pdf",
    "notes": "Rush order",
    "receivedDate": "2026-05-01T00:00:00.000Z",
    "quotation": { "quotationNumber": "ACME-Q-20260501-001", "title": "..." },
    "customer": { "name": "Client Inc" }
  }
]
```

---

### POST `/api/purchase-orders`

Create a new purchase order. **Requires authentication.**

**Request Body:**
```json
{
  "quotationId": "uuid",
  "customerId": "uuid",
  "poNumber": "PO-2026-001",
  "fileUrl": "/api/upload/abc123.pdf",
  "fileName": "purchase-order.pdf",
  "notes": "Rush order"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `quotationId` | Yes | Linked quotation ID |
| `customerId` | Yes | Customer ID |
| `poNumber` | No | Customer's PO number |
| `fileUrl` | No | URL of uploaded PO file |
| `fileName` | No | Original filename |
| `notes` | No | Additional notes |

---

### GET `/api/purchase-orders/[id]`

Get a single purchase order by ID.

---

### PUT `/api/purchase-orders/[id]`

Update a purchase order (e.g., change status). **Requires authentication.**

---

### DELETE `/api/purchase-orders/[id]`

Delete a purchase order. **Requires authentication.**

---

## Delivery Orders

### GET `/api/delivery-orders`

List all delivery orders with company, customer, quotation, and item count.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by DO number or customer name |

---

### POST `/api/delivery-orders`

Create a new delivery order. **Requires authentication.**

**Request Body:**
```json
{
  "companyId": "uuid",
  "customerId": "uuid",
  "quotationId": "uuid",
  "deliveryDate": "2026-05-15",
  "items": [
    {
      "description": "Widget A",
      "quantity": 100,
      "unit": "pcs",
      "sortOrder": 0
    }
  ],
  "footer": "Handle with care"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `companyId` | Yes | Sender company ID |
| `customerId` | Yes | Receiver customer ID |
| `quotationId` | No | Linked quotation ID |
| `deliveryDate` | No | Expected delivery date (ISO format) |
| `items` | No | Array of delivery items |
| `footer` | No | Footer notes |

The `doNumber` is auto-generated as `COMPANYSHORT-DO-YYYYMMDD-###`.

---

### GET `/api/delivery-orders/[id]`

Get a single delivery order with items.

---

### PUT `/api/delivery-orders/[id]`

Update a delivery order. **Requires authentication.**

---

### DELETE `/api/delivery-orders/[id]`

Delete a delivery order. **Requires authentication.**

---

### GET `/api/delivery-orders/[id]/pdf`

Download the delivery order as a PDF document.

**Response:** PDF file (`application/pdf`)

---

## Invoices

### GET `/api/invoices`

List all invoices with company and customer.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by invoice number or customer name |
| `status` | string | Filter by status: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED` |

---

### POST `/api/invoices`

Create a new invoice. **Requires authentication.**

**Request Body:**
```json
{
  "companyId": "uuid",
  "customerId": "uuid",
  "deliveryOrderId": "uuid",
  "dueDate": "2026-06-01",
  "items": [
    {
      "description": "Widget A",
      "quantity": 100,
      "unit": "pcs",
      "unitPrice": 10.00,
      "sortOrder": 0
    }
  ],
  "discount": 50,
  "taxRate": 7,
  "footer": "Payment terms: Net 30"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `companyId` | Yes | Sender company ID |
| `customerId` | Yes | Receiver customer ID |
| `quotationId` | No | Linked quotation ID |
| `purchaseOrderId` | No | Linked PO ID |
| `deliveryOrderId` | No | Linked delivery order ID |
| `dueDate` | No | Payment due date (ISO format) |
| `items` | No | Array of invoice line items |
| `discount` | No | Flat discount amount |
| `taxRate` | No | Tax percentage |
| `footer` | No | Footer notes |

The `invoiceNumber` is auto-generated as `COMPANYSHORT-I-YYYYMMDD-###`.

---

### GET `/api/invoices/[id]`

Get a single invoice with items.

---

### PUT `/api/invoices/[id]`

Update an invoice (including status changes). **Requires authentication.**

---

### DELETE `/api/invoices/[id]`

Delete an invoice. **Requires authentication.**

---

### GET `/api/invoices/[id]/pdf`

Download the invoice as a PDF document.

**Response:** PDF file (`application/pdf`)

---

### POST `/api/invoices/[id]/email`

Send the invoice via email with PDF attachment. **Requires SMTP configuration.**

**Request Body:**
```json
{
  "to": "client@example.com"
}
```

**Response (200):**
```json
{ "success": true }
```

---

## File Upload

### POST `/api/upload`

Upload a file. **Requires authentication.** Uses `multipart/form-data`.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (the file to upload)

**Constraints:**
- Allowed types: PDF, PNG, JPG, JPEG, DOC, DOCX
- Maximum size: 10 MB

**Response (200):**
```json
{
  "fileUrl": "/api/upload/abc123-uuid.pdf",
  "fileName": "purchase-order.pdf",
  "fileSize": 204800,
  "fileType": "application/pdf"
}
```

**Errors:**
- `400` — No file provided
- `400` — Invalid file type
- `400` — File too large (max 10 MB)

---

### GET `/api/upload/[filename]`

Serve an uploaded file by its filename.

**Response:** The file with appropriate content type.

**Errors:**
- `404` — File not found

---

## Audit Logs

### GET `/api/logs`

Query audit logs with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `entity` | string | Filter by entity type: `Company`, `Customer`, `Quotation`, `PurchaseOrder`, `DeliveryOrder`, `Invoice`, `Settings` |
| `action` | string | Filter by action type: `CREATED`, `EDITED`, `DELETED`, `REVISED`, `UPLOADED` |

**Response (200):**
```json
[
  {
    "id": "uuid",
    "action": "CREATED",
    "entity": "Quotation",
    "entityId": "uuid",
    "details": "Created quotation: ACME-Q-20260501-001",
    "createdAt": "2026-05-01T10:30:00.000Z",
    "user": {
      "name": "Admin User",
      "email": "admin@docmanager.com"
    }
  }
]
```

---

## Settings

### GET `/api/settings`

Get all feature settings.

**Response (200):**
```json
[
  { "id": "uuid", "key": "quotation_enabled", "value": "true" },
  { "id": "uuid", "key": "po_enabled", "value": "true" },
  { "id": "uuid", "key": "do_enabled", "value": "true" },
  { "id": "uuid", "key": "invoice_enabled", "value": "true" },
  { "id": "uuid", "key": "default_tax_rate", "value": "0" },
  { "id": "uuid", "key": "company_name", "value": "DocManager" }
]
```

---

### PUT `/api/settings`

Update feature settings. **Requires authentication.**

**Request Body:**
```json
{
  "settings": [
    { "key": "quotation_enabled", "value": "true" },
    { "key": "default_tax_rate", "value": "7" }
  ]
}
```

---

## Error Handling

All API errors return a JSON object with an `error` field:

```json
{
  "error": "Description of what went wrong"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request — missing required fields or invalid data |
| `401` | Unauthorized — not logged in or token expired |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error |

### Authentication Errors

All protected endpoints return `401 Unauthorized` if:
- No `auth-token` cookie is present
- The JWT token has expired (24h lifetime)
- The token is invalid
