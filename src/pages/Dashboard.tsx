import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  department: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'error';
  uploadedAt: Date;
  processedAt?: Date;
  summary?: string;
}

const Dashboard = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock data
  const kpiData = {
    todayProcessed: 47,
    pending: 23,
    avgProcessingTime: '3.2 min',
    successRate: '98.5%'
  };

  const recentDocuments: Document[] = [
    {
      id: '1',
      filename: 'Train_Maintenance_Report_Q4.pdf',
      department: 'Operations',
      urgency: 'high',
      status: 'completed',
      uploadedAt: new Date('2024-01-15T10:30:00'),
      processedAt: new Date('2024-01-15T10:33:00'),
      summary: 'Quarterly maintenance analysis showing 99.2% uptime with 3 critical repairs completed.'
    },
    {
      id: '2',
      filename: 'Passenger_Feedback_Analysis.docx',
      department: 'Customer Service',
      urgency: 'medium',
      status: 'processing',
      uploadedAt: new Date('2024-01-15T09:45:00'),
    },
    {
      id: '3',
      filename: 'Safety_Audit_Report_Jan2024.pdf',
      department: 'Safety',
      urgency: 'high',
      status: 'pending',
      uploadedAt: new Date('2024-01-15T08:20:00'),
    },
    {
      id: '4',
      filename: 'Financial_Statement_Dec2023.xlsx',
      department: 'Finance',
      urgency: 'low',
      status: 'completed',
      uploadedAt: new Date('2024-01-14T16:15:00'),
      processedAt: new Date('2024-01-14T16:22:00'),
      summary: 'Monthly financial overview indicating 15% revenue growth with operational efficiency improvements.'
    }
  ];

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-warning animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getUrgencyBadge = (urgency: Document['urgency']) => {
    const variants = {
      high: 'status-error',
      medium: 'status-warning', 
      low: 'default'
    };
    return <Badge className={variants[urgency]}>{t[urgency]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-heading-3 text-primary font-bold">IntelliDoc</h1>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success">
                KMRL Operations
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button className="btn-kmrl-accent">
                <Upload className="mr-2 h-4 w-4" />
                {t.upload}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.documentsProcessedToday}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary">{kpiData.todayProcessed}</div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <p className="text-xs text-success mt-2">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.pendingDocuments}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-warning">{kpiData.pending}</div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.averageProcessingTime}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-accent-teal">{kpiData.avgProcessingTime}</div>
                <RefreshCw className="h-8 w-8 text-accent-teal" />
              </div>
              <p className="text-xs text-success mt-2">-30s improvement</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-success">{kpiData.successRate}</div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-xs text-success mt-2">High accuracy maintained</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Documents */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-heading-4">{t.recentDocuments}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Date Range
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-hover transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h4 className="font-medium text-foreground">{doc.filename}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-muted-foreground">{doc.department}</span>
                              {getUrgencyBadge(doc.urgency)}
                              <span className="text-xs text-muted-foreground">
                                {doc.uploadedAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Pipeline */}
          <div>
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-heading-4">{t.processingPipeline}</CardTitle>
                <CardDescription>Real-time processing status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Queue</span>
                    <span className="font-medium">12 documents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing</span>
                    <span className="font-medium text-warning">3 documents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed Today</span>
                    <span className="font-medium text-success">47 documents</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">72% completion rate today</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-elevated mt-6">
              <CardHeader>
                <CardTitle className="text-heading-4">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Document
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="mr-2 h-4 w-4" />
                  Advanced Search
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;