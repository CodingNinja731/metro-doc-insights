import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Server, 
  Database,
  HardDrive,
  Cpu,
  Shield,
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'reviewer' | 'processor' | 'viewer';
  department: string;
  lastActive: Date;
  status: 'active' | 'inactive';
  documentsProcessed: number;
}

interface SystemMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  description: string;
  icon: React.ComponentType<any>;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

const Admin = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'settings'>('overview');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Mock system metrics
  const systemMetrics: SystemMetric[] = [
    {
      name: 'System Uptime',
      value: '99.8%',
      status: 'good',
      description: 'Last 30 days',
      icon: Server
    },
    {
      name: 'Processing Queue',
      value: '23',
      status: 'warning',
      description: 'Documents pending',
      icon: Database
    },
    {
      name: 'Storage Usage',
      value: '67%',
      status: 'good',
      description: '2.1TB / 3.2TB',
      icon: HardDrive
    },
    {
      name: 'AI Processing',
      value: '12ms',
      status: 'good',
      description: 'Average response time',
      icon: Cpu
    }
  ];

  // Mock users data
  const users: User[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@kmrl.gov.in',
      role: 'admin',
      department: 'IT Administration',
      lastActive: new Date('2024-01-15T14:30:00'),
      status: 'active',
      documentsProcessed: 0
    },
    {
      id: '2',
      name: 'Priya Menon',
      email: 'priya.menon@kmrl.gov.in',
      role: 'reviewer',
      department: 'Operations',
      lastActive: new Date('2024-01-15T11:45:00'),
      status: 'active',
      documentsProcessed: 156
    },
    {
      id: '3',
      name: 'Arjun Nair',
      email: 'arjun.nair@kmrl.gov.in',
      role: 'processor',
      department: 'Customer Service',
      lastActive: new Date('2024-01-14T16:20:00'),
      status: 'active',
      documentsProcessed: 89
    },
    {
      id: '4',
      name: 'Lakshmi Pillai',
      email: 'lakshmi.pillai@kmrl.gov.in',
      role: 'viewer',
      department: 'Finance',
      lastActive: new Date('2024-01-13T09:15:00'),
      status: 'inactive',
      documentsProcessed: 23
    }
  ];

  // Mock audit logs
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date('2024-01-15T14:30:00'),
      user: 'Rajesh Kumar',
      action: 'User Login',
      details: 'Successful admin login',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date('2024-01-15T14:25:00'),
      user: 'Priya Menon',
      action: 'Document Processed',
      details: 'Maintenance_Report_Q4.pdf processed successfully',
      ipAddress: '192.168.1.102',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date('2024-01-15T14:20:00'),
      user: 'System',
      action: 'Security Alert',
      details: 'Multiple failed login attempts from 203.0.113.45',
      ipAddress: '203.0.113.45',
      status: 'warning'
    },
    {
      id: '4',
      timestamp: new Date('2024-01-15T14:15:00'),
      user: 'Arjun Nair',
      action: 'Document Upload',
      details: 'Customer_Feedback_Jan2024.docx uploaded',
      ipAddress: '192.168.1.103',
      status: 'success'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'success':
      case 'active':
        return 'status-success';
      case 'warning':
        return 'status-warning';
      case 'error':
      case 'inactive':
        return 'status-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'reviewer': return 'bg-warning text-warning-foreground';
      case 'processor': return 'bg-primary text-primary-foreground';
      case 'viewer': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-heading-2 font-bold text-primary">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">System administration and user management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Shield className="h-3 w-3 mr-1" />
            System Secure
          </Badge>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'logs', label: 'Audit Logs', icon: Shield },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemMetrics.map((metric) => (
              <Card key={metric.name} className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                      <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                    </div>
                    <div className={`p-3 rounded-full ${getStatusColor(metric.status)} bg-opacity-20`}>
                      <metric.icon className={`h-6 w-6 ${
                        metric.status === 'good' ? 'text-success' :
                        metric.status === 'warning' ? 'text-warning' :
                        'text-destructive'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-heading-4">Processing Activity</CardTitle>
                <CardDescription>Real-time document processing statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Today's Processed</span>
                    <span className="font-semibold text-success">47 documents</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Currently Processing</span>
                    <span className="font-semibold text-warning">3 documents</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Queue</span>
                    <span className="font-semibold text-muted-foreground">23 documents</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-semibold text-success">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-heading-4">Active Users</CardTitle>
                <CardDescription>Currently logged in users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.filter(u => u.status === 'active').map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading-3 font-semibold text-primary">User Management</h2>
              <p className="text-muted-foreground">Manage user accounts and permissions</p>
            </div>
            <Button className="btn-kmrl-primary">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="processor">Processor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="card-elevated">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Documents Processed</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.documentsProcessed}</TableCell>
                      <TableCell>{user.lastActive.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Audit Logs Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading-3 font-semibold text-primary">Audit Logs</h2>
              <p className="text-muted-foreground">System activity and security events</p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>

          {/* Audit Logs Table */}
          <Card className="card-elevated">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {log.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-heading-3 font-semibold text-primary">System Settings</h2>
            <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-heading-4">Processing Settings</CardTitle>
                <CardDescription>AI processing and queue configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Max Queue Size</label>
                  <Input type="number" defaultValue="50" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Processing Timeout (minutes)</label>
                  <Input type="number" defaultValue="10" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">AI Model Version</label>
                  <Select defaultValue="v2.1">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v2.1">GPT-4 v2.1 (Current)</SelectItem>
                      <SelectItem value="v2.0">GPT-4 v2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-heading-4">Security Settings</CardTitle>
                <CardDescription>Authentication and access control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Session Timeout (hours)</label>
                  <Input type="number" defaultValue="8" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Max Failed Login Attempts</label>
                  <Input type="number" defaultValue="5" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Password Policy</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basic (8+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (12+ chars, mixed case)</SelectItem>
                      <SelectItem value="high">High (16+ chars, symbols required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;