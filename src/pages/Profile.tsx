import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings, Save } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    department: profile?.department || '',
    role: profile?.role || 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await updateProfile(formData);
    setIsLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-1 font-semibold text-primary">Profile Settings</h1>
            <p className="text-body text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {profile?.full_name ? getInitials(profile.full_name) : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{profile?.full_name || 'User'}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-accent-teal/10 text-accent-teal rounded-full">
                    {profile?.role === 'admin' ? 'Administrator' : 'User'}
                  </span>
                  {profile?.department && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {profile.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact administrator if needed.
                </p>
              </div>

              {/* Role (Read-only for non-admins) */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  disabled={profile?.role !== 'admin'}
                >
                  <SelectTrigger className={profile?.role !== 'admin' ? 'bg-muted' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {profile?.role !== 'admin' && (
                  <p className="text-xs text-muted-foreground">
                    Role can only be changed by administrators.
                  </p>
                )}
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                className="w-full btn-kmrl-primary"
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Account Created</p>
                <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Last Sign In</p>
                <p>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">User ID</p>
                <p className="font-mono text-xs">{user?.id?.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Email Verified</p>
                <p>{user?.email_confirmed_at ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;