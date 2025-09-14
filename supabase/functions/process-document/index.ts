import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface DocumentRow {
  id: string;
  filename: string;
  storage_path: string;
  status: string;
  uploaded_by: string;
}

interface AIResponse {
  summary: string;
  actionItems: string[];
  classification: {
    department: string;
    urgency: string;
    topic: string;
  };
}

// Mock OCR function (replace with Google Vision API)
async function extractTextFromFile(fileBuffer: ArrayBuffer, filename: string): Promise<string> {
  // Simple mock OCR - in production, use Google Vision API
  console.log(`Processing ${filename} for OCR...`);
  
  // Mock extracted text based on file type
  if (filename.toLowerCase().includes('invoice')) {
    return `Invoice #INV-2024-001
Date: ${new Date().toLocaleDateString()}
Amount: $1,250.00
Vendor: Tech Solutions Inc.
Description: Software licensing and maintenance services
Due Date: Net 30 days
Please process payment accordingly.`;
  } else if (filename.toLowerCase().includes('policy')) {
    return `COMPANY POLICY DOCUMENT
Subject: Remote Work Guidelines
Effective Date: January 1, 2024

All employees are required to follow remote work protocols including:
- Daily check-ins with supervisors
- Secure VPN connection for all work activities
- Regular progress reports
- Compliance with data security standards

This policy requires immediate implementation across all departments.
HR approval needed for exceptions.`;
  } else {
    return `Document processed: ${filename}
This is sample extracted text from the document.
The content includes important business information that requires review.
Key points include operational procedures, compliance requirements, and action items.
Please review and take appropriate action within 48 hours.
Contact the relevant department for clarification if needed.`;
  }
}

// AI summarization and classification
async function processWithAI(extractedText: string, filename: string): Promise<AIResponse> {
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIKey) {
    console.log('OpenAI API key not found, using mock AI processing');
    // Mock AI response
    return {
      summary: `Summary of ${filename}: This document contains important business information that requires attention. Key details include operational procedures, compliance requirements, and specific action items that need to be addressed within the specified timeframe.`,
      actionItems: [
        "Review document contents within 48 hours",
        "Forward to relevant department head",
        "Update compliance tracking system",
        "Schedule follow-up meeting if needed"
      ],
      classification: {
        department: filename.toLowerCase().includes('invoice') ? 'Finance' : 
                   filename.toLowerCase().includes('policy') ? 'HR' : 'Operations',
        urgency: filename.toLowerCase().includes('urgent') || filename.toLowerCase().includes('immediate') ? 'high' : 'medium',
        topic: filename.toLowerCase().includes('invoice') ? 'Financial' :
               filename.toLowerCase().includes('policy') ? 'Policy' : 'General Business'
      }
    };
  }

  try {
    const prompt = `Analyze this document and provide a structured response in JSON format:

Document: ${extractedText}

Please return a JSON object with:
- summary: A 100-150 word summary
- actionItems: Array of specific action items (3-5 items)
- classification: Object with department, urgency (low/medium/high), and topic

Respond only with valid JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI assistant that analyzes business documents and returns structured JSON responses.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('AI returned invalid JSON');
    }
  } catch (error) {
    console.error('AI processing failed:', error);
    throw error;
  }
}

async function processDocument(document: DocumentRow): Promise<void> {
  console.log(`Processing document ${document.id}: ${document.filename}`);
  
  try {
    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', document.id);

    // Log audit event
    await supabase.rpc('log_audit_event', {
      p_user_id: document.uploaded_by,
      p_action: 'document_processing_started',
      p_document_id: document.id,
      p_details: { filename: document.filename }
    });

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text using OCR
    const fileBuffer = await fileData.arrayBuffer();
    const extractedText = await extractTextFromFile(fileBuffer, document.filename);

    // Process with AI
    const aiResults = await processWithAI(extractedText, document.filename);

    // Update document with results
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'completed',
        extracted_text: extractedText,
        summary: aiResults.summary,
        action_items: aiResults.actionItems,
        classification: aiResults.classification,
        department: aiResults.classification.department,
        urgency: aiResults.classification.urgency,
        processed_at: new Date().toISOString()
      })
      .eq('id', document.id);

    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    // Log completion
    await supabase.rpc('log_audit_event', {
      p_user_id: document.uploaded_by,
      p_action: 'document_processing_completed',
      p_document_id: document.id,
      p_details: { 
        summary_length: aiResults.summary.length,
        action_items_count: aiResults.actionItems.length,
        classification: aiResults.classification
      }
    });

    console.log(`Successfully processed document ${document.id}`);

  } catch (error) {
    console.error(`Error processing document ${document.id}:`, error);
    
    // Update status to failed
    await supabase
      .from('documents')
      .update({ 
        status: 'failed',
        processed_at: new Date().toISOString()
      })
      .eq('id', document.id);

    // Log error
    await supabase.rpc('log_audit_event', {
      p_user_id: document.uploaded_by,
      p_action: 'document_processing_failed',
      p_document_id: document.id,
      p_details: { error: error.message }
    });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing documents worker started');

    // Fetch all queued documents
    const { data: queuedDocs, error: fetchError } = await supabase
      .from('documents')
      .select('id, filename, storage_path, status, uploaded_by')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch queued documents: ${fetchError.message}`);
    }

    if (!queuedDocs || queuedDocs.length === 0) {
      console.log('No queued documents found');
      return new Response(JSON.stringify({ message: 'No documents to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${queuedDocs.length} documents to process`);

    // Process each document
    const results = await Promise.allSettled(
      queuedDocs.map(doc => processDocument(doc))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Processing complete: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      processed: queuedDocs.length,
      successful,
      failed,
      documents: queuedDocs.map(d => ({ id: d.id, filename: d.filename }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});