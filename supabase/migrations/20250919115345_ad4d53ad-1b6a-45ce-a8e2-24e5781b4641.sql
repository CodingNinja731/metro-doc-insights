-- Create a simple test document to verify processing is working
INSERT INTO documents (
  filename, 
  storage_path, 
  file_size, 
  file_type, 
  uploaded_by, 
  status
) VALUES (
  'test-mock-processing.pdf',
  'test-path/test-mock-processing.pdf',
  1024,
  'application/pdf',
  (SELECT auth.uid()),
  'queued'
);

-- Check if any documents are currently queued
SELECT id, filename, status, attempts, created_at 
FROM documents 
WHERE status = 'queued' 
ORDER BY created_at DESC 
LIMIT 5;