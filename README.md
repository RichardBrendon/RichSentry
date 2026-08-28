# RichSentry

**Know when your services fail. Before your users do.**

RichSentry is a production-minded website and API monitoring SaaS built with Next.js, Supabase and Vercel. It performs HTTP checks on the server, records latency and availability, confirms failures before opening incidents, and isolates resources by organization.

## Included

- Professional landing page, authentication screens and responsive observability dashboard
- Supabase authentication foundation and persistent cookie sessions
- Multi-organization PostgreSQL schema with OWNER, ADMIN, MEMBER and VIEWER roles
- Row Level Security policies for tenant isolation
- Authenticated monitor REST API and paginated check history
- Real HTTP/HTTPS monitoring with timeout, status and latency thresholds
- SSRF protection for private, loopback, link-local and metadata addresses
- DNS validation on every request and redirect; maximum three redirects
- Configurable failure and recovery confirmation
- Automatic incident creation and resolution
- Protected, batched Vercel Cron worker with per-monitor locking
- Structured secret-free logs, security headers and critical-rule tests

## Architecture

The App Router owns pages and thin route handlers. Monitoring logic lives under `src/lib/monitoring`, validation under `src/lib/schemas`, and database clients under `src/lib/supabase`. PostgreSQL RLS is the final authorization boundary. The service role is server-only and limited to the cron worker.

```text
User → Monitor API → PostgreSQL
                       ↓
Vercel Cron → due batch → SSRF-safe HTTP check
                       ↓
              history + state transition
                       ↓
                 incident lifecycle
```

## Setup

1. Install Node.js 20+ and run `npm install`.
2. Create a Supabase project and run `supabase/migrations/001_initial.sql` in its SQL editor.
3. Copy `.env.example` to `.env.local` and fill the Supabase keys and a long random `CRON_SECRET`.
4. Enable email/password authentication in Supabase.
5. Run `npm run dev` and open `http://localhost:3000`.

For the first account, create an organization and an OWNER membership row in Supabase. A later onboarding transaction can automate this bootstrap.

## Environment

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser configuration. `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are server secrets and must never use the `NEXT_PUBLIC_` prefix.

## Vercel

Import the repository, add every variable from `.env.example`, and deploy. `vercel.json` invokes `/api/cron/monitor` every minute. Vercel sends `Authorization: Bearer <CRON_SECRET>`. Each invocation claims up to 20 due monitors and ignores stale locks after two minutes.

## Security

Input is validated with Zod and ownership is enforced by RLS. Checks reject credentials in URLs, non-HTTP protocols, reserved IP ranges, internal suffixes and cloud metadata hosts. Each redirect is resolved and validated again. Sensitive headers are never returned by list APIs or logged. Before handling real secrets, add KMS-backed encryption for the `encrypted_headers` column.

## Verification

Run `npm run lint`, `npm test`, and `npm run build`. Demo values are confined to presentation pages and never seed production automatically.

## Roadmap

The service boundaries are ready for signed webhooks, email delivery, SSL expiry checks, public status pages, scheduled maintenance, retention aggregation, Stripe billing and a public token-authenticated API.
