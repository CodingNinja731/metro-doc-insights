import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Download, 
  Eye, 
  RefreshCw, 
  MessageSquare, 
  Edit3,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DocumentData {
  id: string;
  filename: string;
  originalFilename: string;
  uploadedBy: string;
  uploadedAt: Date;
  processedAt: Date;
  department: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'completed' | 'processing' | 'error';
  extractedText: string;
  summary: string;
  actionItems: string[];
  tags: string[];
  classification: {
    category: string;
    confidence: number;
  };
  auditTrail: {
    timestamp: Date;
    user: string;
    action: string;
    details: string;
  }[];
}

const DocumentInspector = ({ documentId }: { documentId?: string }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [newComment, setNewComment] = useState('');

  // Mock document data
  const document: DocumentData = {
    id: documentId || '1',
    filename: 'train_maintenance_report_q4_2024.pdf',
    originalFilename: 'Train_Maintenance_Report_Q4.pdf',
    uploadedBy: 'Rajesh Kumar',
    uploadedAt: new Date('2024-01-15T10:30:00'),
    processedAt: new Date('2024-01-15T10:33:00'),
    department: 'Operations',
    urgency: 'high',
    status: 'completed',
    extractedText: `QUARTERLY MAINTENANCE REPORT - Q4 2024
    
EXECUTIVE SUMMARY
This report provides a comprehensive analysis of the maintenance activities conducted during Q4 2024 for the Kochi Metro Rail system. During this period, we achieved 99.2% uptime across all operational lines.

KEY FINDINGS:
1. Preventive maintenance schedules were completed on time for 98% of scheduled activities
2. Three critical repairs were successfully completed without service disruption
3. New predictive maintenance system implementation reduced unexpected breakdowns by 45%

OPERATIONAL METRICS:
- Total operating hours: 4,380
- Scheduled maintenance hours: 720
- Unscheduled maintenance incidents: 12
- Average response time: 15 minutes

RECOMMENDATIONS:
1. Continue implementation of predictive maintenance across all systems
2. Increase inventory of critical spare parts
3. Schedule major overhauls for non-peak periods`,
    summary: 'Quarterly maintenance analysis showing 99.2% uptime with 3 critical repairs completed. Preventive maintenance achieved 98% on-time completion. New predictive maintenance system reduced breakdowns by 45%. Recommendations include expanding predictive maintenance and increasing spare parts inventory.',
    actionItems: [
      'Implement predictive maintenance system for remaining fleet sections',
      'Increase critical spare parts inventory by 20%',
      'Schedule major overhauls during off-peak hours',
      'Review and update maintenance protocols based on Q4 findings'
    ],
    tags: ['maintenance', 'operations', 'quarterly-report', 'uptime', 'critical'],
    classification: {
      category: 'Operational Report',
      confidence: 0.94
    },
    auditTrail: [
      {
        timestamp: new Date('2024-01-15T10:30:00'),
        user: 'Rajesh Kumar',
        action: 'Document Uploaded',
        details: 'Original PDF uploaded for processing'
      },
      {
        timestamp: new Date('2024-01-15T10:33:00'),
        user: 'AI System',
        action: 'Processing Completed',
        details: 'OCR and AI analysis completed successfully'
      },
      {
        timestamp: new Date('2024-01-15T11:15:00'),
        user: 'Priya Menon',
        action: 'Summary Reviewed',
        details: 'Summary approved by department supervisor'
      }
    ]
  };

  const handleEditSummary = () => {
    setEditedSummary(document.summary);
    setIsEditing(true);
  };

  const handleSaveSummary = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    // Add audit trail entry
    console.log('Summary updated:', editedSummary);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add to the audit trail
      console.log('Comment added:', newComment);
      setNewComment('');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'status-error';
      case 'medium': return 'status-warning';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-2 font-bold text-primary">Document Inspector</h1>
          <p className="text-muted-foreground mt-1">{document.originalFilename}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getUrgencyColor(document.urgency)}>
            {t[document.urgency as keyof typeof t]}
          </Badge>
          <Badge variant="outline">
            {document.classification.category}
          </Badge>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t.downloadOriginal}
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t.reprocessDocument}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Analysis */}
        <div className="space-y-6">
          {/* AI Summary */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-heading-4">{t.aiSummary}</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleEditSummary}>
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    rows={6}
                    className="w-full"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSummary}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-body leading-relaxed">{document.summary}</p>
              )}
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-heading-4">{t.actionItems}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {document.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent-teal rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-body">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-heading-4">{t.metadata}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Uploaded by</p>
                    <p className="font-medium">{document.uploadedBy}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p className="font-medium">{document.processedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Department</p>
                <Badge variant="outline">{document.department}</Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Classification</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{document.classification.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {(document.classification.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Document & Audit */}
        <div className="space-y-6">
          {/* Document Viewer */}
          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-heading-4">Document Preview</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  {t.viewFullText}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-surface rounded-lg p-4 h-96 overflow-y-auto">
                <div className="bg-card p-6 rounded border text-sm leading-relaxed whitespace-pre-line">
                  {document.extractedText}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-heading-4">{t.auditTrail}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.auditTrail.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {entry.action.includes('Upload') && <FileText className="h-4 w-4 text-primary" />}
                      {entry.action.includes('Processing') && <RefreshCw className="h-4 w-4 text-accent-teal" />}
                      {entry.action.includes('Reviewed') && <CheckCircle className="h-4 w-4 text-success" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{entry.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">by {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Comment */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-heading-4">{t.addComment}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Add your review comments..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentInspector;