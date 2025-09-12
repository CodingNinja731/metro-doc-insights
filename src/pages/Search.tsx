import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search as SearchIcon,
  Filter,
  Calendar,
  FileText,
  Tag,
  Clock,
  Eye,
  Download,
  SlidersHorizontal
} from 'lucide-react';

interface SearchResult {
  id: string;
  filename: string;
  department: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'completed' | 'processing' | 'pending';
  uploadedAt: Date;
  summary: string;
  snippet: string;
  tags: string[];
  relevanceScore: number;
}

const Search = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: 'all',
    urgency: 'all',
    status: 'all',
    dateRange: 'all',
    tags: [] as string[],
  });

  // Mock search results
  const searchResults: SearchResult[] = [
    {
      id: '1',
      filename: 'Train_Maintenance_Report_Q4.pdf',
      department: 'Operations',
      urgency: 'high',
      status: 'completed',
      uploadedAt: new Date('2024-01-15T10:30:00'),
      summary: 'Quarterly maintenance analysis showing 99.2% uptime with 3 critical repairs completed.',
      snippet: 'During this period, we achieved 99.2% uptime across all operational lines. Three critical repairs were successfully completed without service disruption...',
      tags: ['maintenance', 'operations', 'quarterly-report'],
      relevanceScore: 0.95
    },
    {
      id: '2',
      filename: 'Passenger_Feedback_Analysis.docx',
      department: 'Customer Service',
      urgency: 'medium',
      status: 'completed',
      uploadedAt: new Date('2024-01-14T14:20:00'),
      summary: 'Monthly passenger satisfaction analysis with improvement recommendations.',
      snippet: 'Customer satisfaction ratings increased by 8% compared to previous month. Key improvement areas identified include platform cleanliness and announcement clarity...',
      tags: ['customer-service', 'feedback', 'satisfaction'],
      relevanceScore: 0.87
    },
    {
      id: '3',
      filename: 'Safety_Audit_Report_Jan2024.pdf',
      department: 'Safety',
      urgency: 'high',
      status: 'completed',
      uploadedAt: new Date('2024-01-13T09:15:00'),
      summary: 'Comprehensive safety audit results with compliance status and action items.',
      snippet: 'All safety protocols are in compliance with national standards. Minor recommendations include updating emergency procedures and staff training schedules...',
      tags: ['safety', 'audit', 'compliance'],
      relevanceScore: 0.82
    },
    {
      id: '4',
      filename: 'Financial_Statement_Dec2023.xlsx',
      department: 'Finance',
      urgency: 'low',
      status: 'completed',
      uploadedAt: new Date('2024-01-12T16:45:00'),
      summary: 'Monthly financial overview indicating 15% revenue growth with operational efficiency improvements.',
      snippet: 'Revenue increased by 15% compared to same period last year. Operational costs reduced by 8% through efficiency improvements in maintenance scheduling...',
      tags: ['finance', 'revenue', 'monthly-report'],
      relevanceScore: 0.76
    }
  ];

  const departments = ['Operations', 'Customer Service', 'Safety', 'Finance', 'Engineering', 'Administration'];
  const availableTags = ['maintenance', 'operations', 'safety', 'finance', 'customer-service', 'audit', 'compliance', 'quarterly-report', 'monthly-report'];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'status-error';
      case 'medium': return 'status-warning';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '🔄';
      case 'pending': return '⏳';
      default: return '📄';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger search API call
    console.log('Searching for:', searchQuery, 'with filters:', filters);
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-2 font-bold text-primary mb-2">
          Document Search
        </h1>
        <p className="text-muted-foreground">
          Search through all processed documents using AI-powered semantic search
        </p>
      </div>

      {/* Search Bar */}
      <Card className="card-elevated mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch}>
            <div className="flex space-x-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search documents, summaries, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-lg h-12"
                />
              </div>
              <Button type="submit" className="btn-kmrl-primary h-12 px-8">
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="card-elevated mb-6">
          <CardHeader>
            <CardTitle className="text-heading-4">Advanced Filters</CardTitle>
            <CardDescription>Refine your search with specific criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Department Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Department</label>
                <Select value={filters.department} onValueChange={value => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Urgency</label>
                <Select value={filters.urgency} onValueChange={value => setFilters(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
                <Select value={filters.dateRange} onValueChange={value => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label htmlFor={tag} className="text-sm cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Found {searchResults.length} documents
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {searchResults.map((result) => (
              <Card key={result.id} className="card-elevated hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                          {result.filename}
                        </h3>
                        <span className="text-lg">{getStatusIcon(result.status)}</span>
                        <Badge className={getUrgencyColor(result.urgency)}>
                          {result.urgency}
                        </Badge>
                      </div>

                      <p className="text-body text-muted-foreground mb-3 leading-relaxed">
                        {result.snippet}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {result.department}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {result.uploadedAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.round(result.relevanceScore * 100)}% match
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;