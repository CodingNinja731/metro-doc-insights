-- Add missing columns for document processing error handling and retry logic
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_error TEXT,
ADD COLUMN IF NOT EXISTS last_error_at TIMESTAMP WITH TIME ZONE;

-- Update existing documents to have attempts = 0 for consistency
UPDATE public.documents 
SET attempts = 0 
WHERE attempts IS NULL;