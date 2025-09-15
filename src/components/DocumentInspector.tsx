import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  Share2, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Tag,
  AlertTriangle
} from 'lucide-react';

interface DocumentData {
  id: string;
  filename: string;
  storage_path: string;
  file_size: number;
  file_type: string;
  status: string;
  extracted_text: string | null;
  summary: string | null;
  action_items: string[] | null;
  classification: any;
  department: string | null;
  urgency: string | null;
  created_at: string;
  processed_at: string | null;
  uploaded_by: string;
}

const DocumentInspector = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
      setupRealtimeUpdates();
    }
  }, [id, user]);

  const fetchDocument = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Document not found",
            description: "The requested document could not be found",
            variant: "destructive",
          });
          navigate('/documents');
          return;
        }
        throw error;
      }

      setDocumentData(data);
    } catch (error: any) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: "Failed to load document details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase
      .channel(`document-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Document updated:', payload);
          setDocumentData(payload.new as DocumentData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDownload = async () => {
    if (!documentData) return;

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(documentData.storage_path, 300); // 5 minutes

      if (error) throw error;

      // Create a temporary link and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = data.signedUrl;
      downloadLink.download = documentData.filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast({
        title: "Download Started",
        description: "Your file download has begun",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReprocess = async () => {
    if (!documentData) return;

    try {
      setReprocessing(true);
      
      // Update document status to queued and reset error fields
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          status: 'queued',
          processing_error: null,
          last_error_at: null,
          attempts: 0
        })
        .eq('id', documentData.id);

      if (updateError) throw updateError;

      // Trigger processing
      const { error: processError } = await supabase.functions.invoke('process-document');
      if (processError) {
        console.error('Processing trigger error:', processError);
      }

      toast({
        title: "Reprocessing Started",
        description: "Document has been queued for reprocessing",
      });
    } catch (error: any) {
      console.error('Reprocess error:', error);
      toast({
        title: "Reprocess Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReprocessing(false);
    }
  };

  const handleShare = async () => {
    if (!documentData) return;

    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      
      toast({
        title: "Link Copied",
        description: "Document link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Document not found</h2>
          <p className="text-muted-foreground">The requested document could not be loaded</p>
          <Button onClick={() => navigate('/documents')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{documentData.filename}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusIcon(documentData.status)}
              <span className="text-sm text-muted-foreground capitalize">
                {documentData.status}
              </span>
              {documentData.department && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge variant="outline">{documentData.department}</Badge>
                </>
              )}
              {documentData.urgency && (
                <Badge variant={getUrgencyColor(documentData.urgency)}>
                  {documentData.urgency} Priority
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReprocess}
            disabled={reprocessing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${reprocessing ? 'animate-spin' : ''}`} />
            Reprocess
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Column */}
        <div className="space-y-6">
          {/* Summary */}
          {documentData.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{documentData.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {documentData.action_items && documentData.action_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {documentData.action_items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Classification */}
          {documentData.classification && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(documentData.classification).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-muted-foreground uppercase">
                        {key}
                      </label>
                      <p className="text-sm font-medium">{value as string}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <p className="font-medium">
                    {documentData.file_size ? (documentData.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Type:</span>
                  <p className="font-medium">{documentData.file_type || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>
                  <p className="font-medium">
                    {new Date(documentData.created_at).toLocaleString()}
                  </p>
                </div>
                {documentData.processed_at && (
                  <div>
                    <span className="text-muted-foreground">Processed:</span>
                    <p className="font-medium">
                      {new Date(documentData.processed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Viewer Column */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {documentData.status === 'completed' && documentData.extracted_text ? (
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <h4 className="font-medium mb-2">Extracted Text:</h4>
                  <pre className="whitespace-pre-wrap text-sm">{documentData.extracted_text}</pre>
                </div>
              ) : documentData.status === 'processing' ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Processing document...</p>
                  </div>
                </div>
              ) : documentData.status === 'failed' ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Processing failed</p>
                    <Button 
                      onClick={handleReprocess} 
                      className="mt-2"
                      disabled={reprocessing}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Queued for processing...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentInspector;