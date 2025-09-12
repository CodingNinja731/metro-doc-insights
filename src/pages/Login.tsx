import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Train, FileText, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      if (formData.username && formData.password) {
        toast({
          title: "Login Successful",
          description: "Welcome to IntelliDoc Platform",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Please enter valid credentials",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
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

        {/* Login Card */}
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
                {t.welcomeToIntelliDoc}
              </CardTitle>
              <CardDescription className="text-caption mt-2">
                {t.kmrlDocumentPlatform}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t.username}
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.password}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                    }
                  />
                  <Label htmlFor="remember" className="text-sm">
                    {t.rememberMe}
                  </Label>
                </div>

                <Button variant="link" className="p-0 h-auto text-sm">
                  {t.forgotPassword}
                </Button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full btn-kmrl-primary"
                disabled={isLoading}
              >
                <Shield className="mr-2 h-4 w-4" />
                {isLoading ? 'Signing In...' : t.signIn}
              </Button>
            </form>

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

export default Login;