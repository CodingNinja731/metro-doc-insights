import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Calendar, User, Clock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  filename: string;
  storage_path: string;
  file_size: number | null;
  file_type: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  extracted_text: string | null;
  summary: string | null;
  action_items: string[] | null;
  classification: any;
  department: string | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tags: string[] | null;
  uploaded_by: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      fetchDocument();
    }
  }, [id, user]);

  const fetchDocument = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setDocument(data as Document);
      
      // Get signed URL for preview
      if (data.storage_path) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(data.storage_path, 3600);
        
        if (!urlError && urlData?.signedUrl) {
          setPreviewUrl(urlData.signedUrl);
        }
      }
      
    } catch (error: any) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600);

      if (error) throw error;
      
      if (data?.signedUrl) {
        const link = globalThis.document.createElement('a');
        link.href = data.signedUrl;
        link.download = document.filename;
        link.click();
      }
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'queued':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getUrgencyColor = (urgency: Document['urgency']) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Document Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{document.filename}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(document.created_at).toLocaleDateString()}
            </div>
            {document.file_size && (
              <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(document.status)}
          <span className="capitalize font-medium">{document.status}</span>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Document Information */}
        <div className="space-y-6">
          {/* AI Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {document.summary ? (
                <p className="text-foreground leading-relaxed">{document.summary}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {document.status === 'completed' 
                    ? 'No summary available for this document.'
                    : 'Summary will be available once processing is complete.'
                  }
                </p>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          {document.action_items && document.action_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {document.action_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-foreground">
                    {document.department || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Urgency</label>
                  <div className="mt-1">
                    <Badge className={getUrgencyColor(document.urgency)}>
                      {document.urgency.charAt(0).toUpperCase() + document.urgency.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Type</label>
                <p className="text-foreground">{document.file_type || 'Unknown'}</p>
              </div>
              
              {document.processed_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Processed At</label>
                  <p className="text-foreground">
                    {new Date(document.processed_at).toLocaleString()}
                  </p>
                </div>
              )}
              
              {document.tags && document.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Document Preview */}
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <div className="space-y-4">
                {document.file_type?.includes('pdf') ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-96 border border-border rounded"
                    title="Document Preview"
                  />
                ) : document.file_type?.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Document Preview"
                    className="w-full h-auto max-h-96 object-contain border border-border rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border rounded">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Preview not available for this file type
                    </p>
                    <Button onClick={handleDownload} variant="outline" className="mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )}
                
                {document.extracted_text && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Extracted Text</h4>
                    <div className="bg-muted p-3 rounded text-sm text-muted-foreground max-h-48 overflow-y-auto">
                      {document.extracted_text.substring(0, 500)}
                      {document.extracted_text.length > 500 && '...'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 border border-dashed border-border rounded">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Unable to load document preview
                </p>
                <Button onClick={handleDownload} variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentDetail;