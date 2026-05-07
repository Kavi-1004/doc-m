# DocManager — Deployment Guide

Instructions for deploying DocManager to production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Build & Deploy Options](#build--deploy-options)
5. [Docker Deployment](#docker-deployment)
6. [Vercel Deployment](#vercel-deployment)
7. [VPS / Self-Hosted Deployment](#vps--self-hosted-deployment)
8. [Email (SMTP) Configuration](#email-smtp-configuration)
9. [File Upload Storage](#file-upload-storage)
10. [Security Checklist](#security-checklist)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 14+ (managed or self-hosted)
- A domain name (optional but recommended)
- SSL/TLS certificate (required for production)

---

## Environment Variables

Create a `.env` file or set these in your hosting platform's environment configuration:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/docmanager` |
| `NEXTAUTH_SECRET` | JWT signing secret (min 32 chars) | `generate-a-random-secret-here` |
| `NEXTAUTH_URL` | Full URL of your application | `https://docmanager.example.com` |

### Optional (Email / SMTP)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS (`true` for port 465) | `false` |
| `SMTP_USER` | SMTP username/email | `noreply@example.com` |
| `SMTP_PASS` | SMTP password or app password | `your-app-password` |
| `SMTP_FROM` | Sender display name and email | `DocManager <noreply@example.com>` |

### Generating a Secure Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Create the Database

```sql
CREATE DATABASE docmanager;
CREATE USER docmanager_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE docmanager TO docmanager_user;
```

### 2. Apply the Schema

```bash
npx prisma db push
```

This creates all 15 tables defined in `prisma/schema.prisma`.

### 3. Seed Initial Data

```bash
npx prisma db seed
```

This creates:
- Admin role with full permissions
- User role with limited permissions
- Default admin user (`admin@docmanager.com` / `admin123`)
- Default feature settings

> **Important:** Change the admin password after first login in production.

### Managed Database Services

The app works with any PostgreSQL 14+ provider:
- **Supabase** — Free tier available
- **Neon** — Serverless PostgreSQL
- **Railway** — Simple managed PostgreSQL
- **AWS RDS** — Enterprise-grade
- **DigitalOcean** — Managed databases

Use the connection string provided by your service as `DATABASE_URL`.

---

## Build & Deploy Options

### Production Build

```bash
npm run build
npm run start
```

The application runs on port 3000 by default. Set the `PORT` environment variable to change it.

---

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

RUN mkdir -p uploads && chown -R nextjs:nodejs uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://docmanager:password@db:5432/docmanager
      - NEXTAUTH_SECRET=your-production-secret
      - NEXTAUTH_URL=https://your-domain.com
    depends_on:
      - db
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=docmanager
      - POSTGRES_USER=docmanager
      - POSTGRES_PASSWORD=password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
  uploads:
```

### Running with Docker Compose

```bash
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

---

## Vercel Deployment

### 1. Push to GitHub

Ensure your repo is on GitHub.

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository.
2. Set the environment variables in the Vercel dashboard.
3. Deploy.

### 3. Database

Use a managed PostgreSQL service (Supabase, Neon, etc.) since Vercel is serverless.

### 4. Important Notes

- **File uploads**: Vercel's serverless functions have a read-only filesystem. You will need to use external storage (e.g., AWS S3, Cloudflare R2) for file uploads.
- **Standalone output**: Add `output: "standalone"` to `next.config.ts` if needed.

---

## VPS / Self-Hosted Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build the application
npm run build

# Set up the database
npx prisma db push
npx prisma db seed

# Start with PM2
pm2 start npm --name "docmanager" -- start

# Auto-restart on reboot
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name docmanager.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name docmanager.example.com;

    ssl_certificate /etc/letsencrypt/live/docmanager.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docmanager.example.com/privkey.pem;

    # Increase max upload size for PO file uploads
    client_max_body_size 15M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d docmanager.example.com
```

---

## Email (SMTP) Configuration

### Gmail (App Password)

1. Enable 2-Factor Authentication on your Google account.
2. Go to [App Passwords](https://myaccount.google.com/apppasswords).
3. Generate a new app password for "Mail".
4. Use these settings:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="DocManager <your-email@gmail.com>"
```

### Amazon SES

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-smtp-user"
SMTP_PASS="your-ses-smtp-password"
SMTP_FROM="DocManager <noreply@your-verified-domain.com>"
```

### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="DocManager <noreply@your-domain.com>"
```

### Testing Email

After configuring SMTP, test by sending a quotation or invoice email from the application. If email is not configured, the app will show an error message but will continue to work for all other features.

---

## File Upload Storage

By default, files are stored in the `uploads/` directory at the project root. For production:

### Local Storage (VPS/Docker)

- Ensure the `uploads/` directory exists and is writable
- Mount as a Docker volume for persistence
- Back up the directory regularly

### Cloud Storage (Recommended for Vercel/Serverless)

For serverless environments, you will need to modify `src/app/api/upload/route.ts` to use cloud storage:

- **AWS S3** — Use `@aws-sdk/client-s3`
- **Cloudflare R2** — S3-compatible API
- **Google Cloud Storage** — Use `@google-cloud/storage`

---

## Security Checklist

Before going to production, ensure:

- [ ] `NEXTAUTH_SECRET` is a strong, randomly generated value (not the default)
- [ ] Default admin password has been changed
- [ ] `DATABASE_URL` uses a strong password
- [ ] HTTPS is enabled (SSL/TLS certificate configured)
- [ ] `NEXTAUTH_URL` matches your actual domain
- [ ] Database is not publicly accessible (firewall rules)
- [ ] File upload directory is not browsable (handled by API routes)
- [ ] Environment variables are not committed to version control
- [ ] `.env` is listed in `.gitignore`
- [ ] Cookie `secure` flag is enabled in production (automatic when `NODE_ENV=production`)

---

## Monitoring & Maintenance

### Database Backups

Set up regular PostgreSQL backups:

```bash
# Manual backup
pg_dump -U docmanager -d docmanager > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * pg_dump -U docmanager -d docmanager > /backups/docmanager_$(date +\%Y\%m\%d).sql
```

### Logs

- Application logs: Check PM2 logs (`pm2 logs docmanager`) or Docker logs (`docker compose logs app`)
- Audit logs: Available in the application at `/logs`
- Database logs: Check your PostgreSQL server logs

### Updates

```bash
git pull origin main
npm install
npx prisma db push
npx prisma generate
npm run build
pm2 restart docmanager  # or docker compose up -d --build
```

---

## Troubleshooting

### Database Connection Failed

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running: `pg_isready`
- Ensure the database exists and user has permissions
- Check firewall rules allow connection on port 5432

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

### Prisma Client Issues

```bash
# Regenerate the Prisma client
npx prisma generate
```

### Email Not Sending

- Verify all `SMTP_*` environment variables are set
- Check SMTP credentials are correct
- For Gmail, ensure you're using an App Password (not your regular password)
- Check application logs for SMTP error messages

### File Upload Fails

- Ensure `uploads/` directory exists and is writable
- Check file size is under 10 MB
- Verify file type is one of: PDF, PNG, JPG, DOC, DOCX
- For Docker, ensure the uploads volume is mounted

### Port Already in Use

```bash
# Find and kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```
