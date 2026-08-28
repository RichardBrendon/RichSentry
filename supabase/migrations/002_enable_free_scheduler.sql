-- Supabase Cron and pg_net are available on hosted Supabase projects.
-- No schedule is installed here because deployments have different URLs/secrets.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
