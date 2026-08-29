# RichSentry

**Know when your services fail. Before your users do.**

RichSentry is a production-minded website and API monitoring SaaS built with Next.js, Supabase and Vercel. It performs HTTP checks on the server, records latency and availability, confirms failures before opening incidents, and isolates resources by organization.

## Included

- Professional landing page, authentication screens and responsive observability dashboard
- Google OAuth authentication restricted to personal `@gmail.com` accounts, with persistent cookie sessions
- Multi-organization PostgreSQL schema with OWNER, ADMIN, MEMBER and VIEWER roles
- Row Level Security policies for tenant isolation
- Authenticated monitor REST API and paginated check history
- Real HTTP/HTTPS monitoring with timeout, status and latency thresholds
- SSRF protection for private, loopback, link-local and metadata addresses
- DNS validation on every request and redirect; maximum three redirects
- Configurable failure and recovery confirmation
- Automatic incident creation and resolution
- Protected, batched monitor worker triggered by Supabase Cron, with per-monitor locking
- Immediate first check when a monitor is created and an authenticated dashboard heartbeat as a free fallback
- Structured secret-free logs, security headers and critical-rule tests

## Architecture

The App Router owns pages and thin route handlers. Monitoring logic lives under `src/lib/monitoring`, validation under `src/lib/schemas`, and database clients under `src/lib/supabase`. PostgreSQL RLS is the final authorization boundary. The service role is server-only and limited to the monitor worker.

```text
User → Monitor API → PostgreSQL
                       ↓
Supabase Cron → worker endpoint → due batch → SSRF-safe HTTP check
                       ↓
              history + state transition
                       ↓
                 incident lifecycle
```

## Setup

1. Install Node.js 20+ and run `npm install`.
2. Create a Supabase project and run `supabase/migrations/001_initial.sql` in its SQL editor.
3. Copy `.env.example` to `.env.local` and fill the Supabase keys and a long random `MONITOR_WORKER_SECRET`.
4. In Google Auth Platform, create a Web OAuth client and add the Supabase callback URL shown in **Authentication → Providers → Google** as an authorized redirect URI.
5. Enable the Google provider in Supabase using that client ID and secret. Disable new email/password signups in Supabase so the provider configuration matches the application policy.
6. Add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback` to the Supabase redirect allow list.
7. Run `npm run dev` and open `http://localhost:3000`.

For the first account, create an organization and an OWNER membership row in Supabase. A later onboarding transaction can automate this bootstrap.

## Environment

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are browser configuration. `SUPABASE_SERVICE_ROLE_KEY` and `MONITOR_WORKER_SECRET` are server secrets and must never use the `NEXT_PUBLIC_` prefix.

## Free deployment and scheduling

Import the repository into the free Vercel Hobby plan, add every variable from `.env.example`, and deploy. There are no Vercel Cron Jobs in this project.

After deployment, run `supabase/migrations/002_enable_free_scheduler.sql` and then customize and run `supabase/setup-free-scheduler.sql` in the Supabase SQL Editor. The latter stores the deployed worker URL and `MONITOR_WORKER_SECRET` in Supabase Vault and asks Supabase Cron to call the protected worker once per minute. Each invocation claims up to 20 due monitors and ignores stale locks after two minutes.

New monitors are checked immediately. While an authenticated dashboard is open, it also processes due monitors once per minute as a fallback. Supabase Cron is still required for continuous checks while nobody has the dashboard open.

This setup requires no paid subscription. It remains subject to the quotas and fair-use rules of Vercel Hobby and Supabase Free. Supabase may pause a free project after one week without activity; an actively monitoring project ordinarily continues receiving scheduled database activity, but the free tier does not provide an uptime SLA.

## Security

Input is validated with Zod and ownership is enforced by RLS. Checks reject credentials in URLs, non-HTTP protocols, reserved IP ranges, internal suffixes and cloud metadata hosts. Each redirect is resolved and validated again. Sensitive headers are never returned by list APIs or logged. Before handling real secrets, add KMS-backed encryption for the `encrypted_headers` column.

## Verification

Run `npm run lint`, `npm test`, and `npm run build`. Demo values are confined to presentation pages and never seed production automatically.

## Roadmap

The service boundaries are ready for signed webhooks, email delivery, SSL expiry checks, public status pages, scheduled maintenance, retention aggregation, Stripe billing and a public token-authenticated API.
