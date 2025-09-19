-- Reset real documents with storage files for proper testing
UPDATE documents 
SET status = 'queued', attempts = 0, processing_error = NULL, last_error_at = NULL 
WHERE id IN (
  SELECT id 
  FROM documents 
  WHERE storage_path IS NOT NULL 
  AND storage_path != 'test-path/test-mock-processing.pdf'
  LIMIT 2
);