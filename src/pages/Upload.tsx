import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, FileText, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  documentId?: string;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      setUploadedFiles(prev => [...prev, {
        id: fileId,
        file,
        progress: 0,
        status: 'uploading'
      }]);

      uploadFile(file, fileId);
    });
  };

  const uploadFile = async (file: File, fileId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create file path with user ID
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (storageError) {
        throw storageError;
      }

      // Create database record
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          storage_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: user.id,
          status: 'queued'
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Update file status to processing
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'processing', documentId: documentData.id, progress: 100 }
          : f
      ));

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_user_id: user.id,
        p_action: 'document_uploaded',
        p_document_id: documentData.id,
        p_details: { filename: file.name, file_size: file.size }
      });

      // Trigger document processing
      setTimeout(async () => {
        try {
          const { error: processError } = await supabase.functions.invoke('process-document');
          if (processError) {
            console.error('Processing trigger error:', processError);
          }
        } catch (error) {
          console.error('Failed to trigger processing:', error);
        }
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed' } : f
        ));
        
        toast({
          title: "Upload Complete",
          description: `${file.name} has been uploaded and queued for processing`,
        });
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: error.message, progress: 0 }
          : f
      ));
      
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateFileProgress = (fileId: string, progress: number) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress } : f
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', error: undefined, progress: 0 }
          : f
      ));
      uploadFile(file.file, fileId);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Complete';
      case 'error':
        return 'Failed';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Documents</h1>
        <p className="text-muted-foreground mt-2">
          Upload your documents for intelligent processing and analysis
        </p>
      </div>

      <Card className="border-2 border-dashed border-muted">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-all ${
              isDragActive ? 'bg-muted/50' : 'hover:bg-muted/25'
            }`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, TXT, PNG, JPG (Max 20MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Upload Progress</h3>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground">{file.file.name}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        <Badge variant={file.status === 'error' ? 'destructive' : 'secondary'}>
                          {getStatusText(file.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      {file.status === 'uploading' && (
                        <span>{Math.round(file.progress)}%</span>
                      )}
                    </div>
                    
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <Progress value={file.progress} className="h-2" />
                    )}
                    
                    {file.error && (
                      <p className="text-sm text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {file.status === 'error' && (
                      <Button 
                        onClick={() => retryUpload(file.id)}
                        size="sm" 
                        variant="outline"
                      >
                        Retry
                      </Button>
                    )}
                    <Button 
                      onClick={() => removeFile(file.id)}
                      size="sm" 
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;