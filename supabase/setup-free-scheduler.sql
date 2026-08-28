-- Run once in the Supabase SQL Editor after deploying the app.
-- Replace both placeholder values before running this file.
select vault.create_secret(
  'https://YOUR-APP.vercel.app/api/tasks/monitor',
  'richsentry_worker_url',
  'RichSentry monitor worker URL'
);

select vault.create_secret(
  'REPLACE-WITH-THE-SAME-MONITOR_WORKER_SECRET-USED-IN-VERCEL',
  'richsentry_worker_secret',
  'RichSentry monitor worker authorization secret'
);

select cron.schedule(
  'richsentry-monitor-worker',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'richsentry_worker_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'richsentry_worker_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);
