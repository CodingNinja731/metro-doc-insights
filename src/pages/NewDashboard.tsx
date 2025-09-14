import React, { useState, useEffect } from 'react';
import { Search, Upload, FileText, Clock, CheckCircle, AlertTriangle, Download, Eye, Users, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  filename: string;
  department: string | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  uploaded_by: string;
  file_size: number | null;
  summary: string | null;
  storage_path: string;
}

interface DashboardStats {
  totalDocuments: number;
  documentsToday: number;
  pendingDocuments: number;
  completedDocuments: number;
  averageProcessingTime: string;
  successRate: number;
}

const Dashboard = () => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    documentsToday: 0,
    pendingDocuments: 0,
    completedDocuments: 0,
    averageProcessingTime: '0 min',
    successRate: 0
  });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Realtime subscription for document updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('document-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document update:', payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Set up realtime subscription for document updates
      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'documents'
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch documents based on user role
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentDocuments((documents || []) as Document[]);

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayDocs = (documents || []).filter(doc => 
        new Date(doc.created_at) >= today
      );
      
      const pendingDocs = (documents || []).filter(doc => 
        doc.status === 'queued' || doc.status === 'processing'
      );
      
      const completedDocs = (documents || []).filter(doc => 
        doc.status === 'completed'
      );

      const totalDocs = documents?.length || 0;
      const successRate = totalDocs > 0 
        ? Math.round((completedDocs.length / totalDocs) * 100) 
        : 0;

      setStats({
        totalDocuments: totalDocs,
        documentsToday: todayDocs.length,
        pendingDocuments: pendingDocs.length,
        completedDocuments: completedDocs.length,
        averageProcessingTime: '2.3 min',
        successRate
      });
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const kpiData = [
    {
      title: language === 'ml' ? 'ഇന്ന് പ്രോസസ്സ് ചെയ്ത ഡോക്യുമെന്റുകൾ' : 'Documents Today',
      value: stats.documentsToday.toString(),
      change: '+12%',
      icon: FileText
    },
    {
      title: language === 'ml' ? 'പെൻഡിംഗ് ഡോക്യുമെന്റുകൾ' : 'Pending Documents',
      value: stats.pendingDocuments.toString(),
      change: '-15%',
      icon: Clock
    },
    {
      title: language === 'ml' ? 'ശരാശരി പ്രോസസ്സിംഗ് സമയം' : 'Avg Processing Time',
      value: stats.averageProcessingTime,
      change: '-8%',
      icon: Activity
    },
    {
      title: language === 'ml' ? 'വിജയ നിരക്ക്' : 'Success Rate',
      value: `${stats.successRate}%`,
      change: '+2%',
      icon: TrendingUp
    }
  ];

  const handleViewDocument = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600);

      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getUrgencyBadge = (urgency: Document['urgency']) => {
    const urgencyMap = {
      low: { 
        variant: 'secondary' as const, 
        text: language === 'ml' ? 'കുറവ്' : 'Low' 
      },
      medium: { 
        variant: 'default' as const, 
        text: language === 'ml' ? 'ഇടത്തരം' : 'Medium' 
      },
      high: { 
        variant: 'destructive' as const, 
        text: language === 'ml' ? 'ഉയർന്ന' : 'High' 
      },
      critical: { 
        variant: 'destructive' as const, 
        text: language === 'ml' ? 'അടിയന്തിരം' : 'Critical' 
      }
    };
    
    return (
      <Badge variant={urgencyMap[urgency].variant}>
        {urgencyMap[urgency].text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ml' ? 'ഡാഷ്ബോർഡ്' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ml' ? 'പ്രമാണ പ്രോസസ്സിംഗ് ഓവർവ്യൂ' : 'Document processing overview'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={language === 'ml' ? 'ഡോക്യുമെന്റുകൾ തിരയുക...' : 'Search documents...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === 'ml' ? 'വകുപ്പ് തിരഞ്ഞെടുക്കുക' : 'Select Department'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ml' ? 'എല്ലാ വകുപ്പുകളും' : 'All Departments'}</SelectItem>
                <SelectItem value="finance">{language === 'ml' ? 'ധനകാര്യം' : 'Finance'}</SelectItem>
                <SelectItem value="hr">{language === 'ml' ? 'എച്ച്ആർ' : 'HR'}</SelectItem>
                <SelectItem value="operations">{language === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Operations'}</SelectItem>
                <SelectItem value="technical">{language === 'ml' ? 'സാങ്കേതികം' : 'Technical'}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => navigate('/upload')} className="bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4 mr-2" />
              {language === 'ml' ? 'അപ്‌ലോഡ്' : 'Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.change} {language === 'ml' ? 'കഴിഞ്ഞ മാസത്തിൽ നിന്ന്' : 'from last month'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ml' ? 'സമീപകാല ഡോക്യുമെന്റുകൾ' : 'Recent Documents'}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentDocuments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'ml' ? 'ഫയൽനാമം' : 'Filename'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'ml' ? 'വകുപ്പ്' : 'Department'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'ml' ? 'അടിയന്തിരത' : 'Urgency'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'ml' ? 'നില' : 'Status'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'ml' ? 'തീയതി' : 'Date'}
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          {language === 'ml' ? 'പ്രവർത്തനങ്ങൾ' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{doc.filename}</td>
                          <td className="py-3 px-4">
                            {doc.department ? (
                              <Badge variant="outline">{doc.department}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">{getUrgencyBadge(doc.urgency)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(doc.status)}
                              <span className="capitalize">{doc.status}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDocument(doc.id)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'ml' ? 'ഇതുവരെ ഡോക്യുമെന്റുകളൊന്നും അപ്‌ലോഡ് ചെയ്തിട്ടില്ല' : 'No documents uploaded yet'}
                  </p>
                  <Button onClick={() => navigate('/upload')} className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    {language === 'ml' ? 'ആദ്യ ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക' : 'Upload First Document'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Processing Pipeline & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ml' ? 'പ്രോസസ്സിംഗ് പൈപ്പ്‌ലൈൻ' : 'Processing Pipeline'}</CardTitle>
              <CardDescription>
                {language === 'ml' ? 'തൽസമയ പ്രോസസ്സിംഗ് അവസ്ഥ' : 'Real-time processing status'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {language === 'ml' ? 'ക്യൂവിൽ' : 'In Queue'}
                </span>
                <span className="font-semibold">{stats.pendingDocuments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {language === 'ml' ? 'പ്രോസസ്സിംഗ്' : 'Processing'}
                </span>
                <span className="font-semibold text-blue-500">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {language === 'ml' ? 'പൂർത്തിയായത്' : 'Completed'}
                </span>
                <span className="font-semibold text-green-500">{stats.completedDocuments}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ml' ? 'ദ്രുത പ്രവർത്തനങ്ങൾ' : 'Quick Actions'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate('/upload')} variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {language === 'ml' ? 'ഡോക്യുമെന്റ് അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Document'}
              </Button>
              <Button onClick={() => navigate('/search')} variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {language === 'ml' ? 'തിരയുക' : 'Search Documents'}
              </Button>
              {profile?.role === 'admin' && (
                <Button onClick={() => navigate('/admin')} variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  {language === 'ml' ? 'ഉപയോക്താക്കളെ മാനേജ് ചെയ്യുക' : 'Manage Users'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;