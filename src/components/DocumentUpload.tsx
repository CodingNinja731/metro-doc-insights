import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  File, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

const DocumentUpload = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    newFiles.forEach(uploadFile => {
      simulateUpload(uploadFile.id);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      
      setUploadedFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, progress: Math.min(progress, 100) }
          : file
      ));

      if (progress >= 100) {
        clearInterval(interval);
        // Start processing phase
        setTimeout(() => {
          setUploadedFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'processing', progress: 0 }
              : file
          ));
          simulateProcessing(fileId);
        }, 500);
      }
    }, 200);
  };

  const simulateProcessing = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      
      setUploadedFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, progress: Math.min(progress, 100) }
          : file
      ));

      if (progress >= 100) {
        clearInterval(interval);
        // Randomly succeed or fail
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { 
                ...file, 
                status: isSuccess ? 'completed' : 'error',
                progress: 100,
                error: isSuccess ? undefined : 'Processing failed - unsupported format'
              }
            : file
        ));

        if (isSuccess) {
          toast({
            title: "Document Processed Successfully",
            description: `${uploadedFiles.find(f => f.id === fileId)?.file.name} is ready for review`,
          });
        }
      }
    }, 300);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const retryProcessing = (fileId: string) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: 'processing', progress: 0, error: undefined }
        : file
    ));
    simulateProcessing(fileId);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-destructive" />;
      case 'doc':
      case 'docx':
        return <File className="h-8 w-8 text-primary" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-8 w-8 text-accent-teal" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 text-primary animate-pulse" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing with AI...';
      case 'completed':
        return 'Ready for review';
      case 'error':
        return 'Processing failed';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-heading-2 font-bold text-primary mb-2">
          Document Upload
        </h1>
        <p className="text-muted-foreground">
          Upload documents for AI-powered processing and analysis
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="card-elevated mb-8">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'dragover' : ''} m-6`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isDragActive ? 'Drop files here...' : t.dragAndDropFiles}
                </p>
                <p className="text-muted-foreground mt-1">
                  {t.orClickToSelect}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t.supportedFormats}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 10MB per file
                </p>
              </div>
              
              <Button className="btn-kmrl-primary">
                Select Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-heading-4">{t.uploadProgress}</CardTitle>
            <CardDescription>
              {uploadedFiles.filter(f => f.status === 'completed').length} of {uploadedFiles.length} files processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-4 p-4 bg-surface rounded-lg">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadFile.file.name)}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground truncate">
                          {uploadFile.file.name}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(uploadFile.status)}
                            <span className="text-sm text-muted-foreground">
                              {getStatusText(uploadFile.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {uploadFile.status === 'error' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryProcessing(uploadFile.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                      <div className="w-full">
                        <Progress value={uploadFile.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {uploadFile.progress.toFixed(0)}% complete
                        </p>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {uploadFile.error && (
                      <div className="mt-2">
                        <Badge variant="destructive" className="text-xs">
                          {uploadFile.error}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Success Badge */}
                    {uploadFile.status === 'completed' && (
                      <div className="mt-2">
                        <Badge className="status-success text-xs">
                          Processing Complete
                        </Badge>
                      </div>
                    )}
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

export default DocumentUpload;