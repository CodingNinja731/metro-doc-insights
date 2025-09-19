-- Reset documents for mock processing test
UPDATE documents 
SET status = 'queued', attempts = 0, processing_error = NULL, last_error_at = NULL 
WHERE id IN ('7238300f-6d83-4935-9307-eac32adf5e5c', '3b2c0dc2-32b4-4000-8d0f-089111f41a87');

-- Trigger processing with fixed mock mode
SELECT net.http_post(
  url := 'https://wmopracxcszsbylonbno.supabase.co/functions/v1/process-document',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3ByYWN4Y3N6c2J5bG9uYm5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTgyOTUsImV4cCI6MjA3MzIzNDI5NX0.x2RThimSmoFtGTxSvipHN8ifapeO2kK3Vh0hZxKNZpE"}'::jsonb,
  body := '{"trigger": "fixed_mock_test"}'::jsonb
) as request_id;