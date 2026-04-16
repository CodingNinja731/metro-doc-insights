
SELECT cron.schedule(
  'process-documents-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://wmopracxcszsbylonbno.supabase.co/functions/v1/process-document',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3ByYWN4Y3N6c2J5bG9uYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTgyOTUsImV4cCI6MjA3MzIzNDI5NX0.x2RThimSmoFtGTxSvipHN8ifapeO2kK3Vh0hZxKNZpE"}'::jsonb,
    body:=concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
