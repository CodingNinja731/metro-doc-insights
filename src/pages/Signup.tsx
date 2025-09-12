import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Globe, Train, FileText, UserPlus } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    if (!error) {
      navigate('/login');
    }
    
    setIsLoading(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ml' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'മലയാളം' : 'English'}
          </Button>
        </div>

        {/* Signup Card */}
        <Card className="card-elevated fade-in">
          <CardHeader className="text-center space-y-4">
            {/* KMRL Logo & Branding */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Train className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="w-12 h-12 bg-accent-teal rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent-teal-foreground" />
              </div>
            </div>
            
            <div>
              <CardTitle className="text-heading-2 text-primary">
                Create Account
              </CardTitle>
              <CardDescription className="text-caption mt-2">
                Join the IntelliDoc Platform
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full"
                  required
                />
                {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full btn-kmrl-primary"
                disabled={isLoading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {language === 'en' 
                  ? 'Secure connection established. Your data is protected.'
                  : 'സുരക്ഷിത കണക്ഷൻ സ്ഥാപിച്ചു. നിങ്ങളുടെ ഡാറ്റ സുരക്ഷിതമാണ്.'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © 2024 Kochi Metro Rail Limited. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;