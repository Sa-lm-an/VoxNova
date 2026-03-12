import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setIsAdmin } = useVoting();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both username and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo credentials
    if (username === 'admin' && password === 'admin123') {
      setIsAdmin(true);
      toast({
        title: 'Welcome Admin',
        description: 'You have logged in successfully.',
      });
      navigate('/admin');
    } else {
      toast({
        title: 'Invalid Credentials',
        description: 'Please check your username and password.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1 as any)}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="mx-auto mt-16 max-w-md">
          <div className="rounded-3xl bg-card p-8 shadow-elevated animate-scale-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                <Lock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Admin Login
              </h2>
              <p className="mt-2 text-muted-foreground">
                Access the election management panel
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-muted/50 p-4 transition-all focus-within:border-primary focus-within:bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-0 bg-transparent text-lg focus-visible:ring-0"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-muted/50 p-4 transition-all focus-within:border-primary focus-within:bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-0 bg-transparent text-lg focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-xl bg-muted/50 p-4">
              <p className="text-center text-sm text-muted-foreground">
                <strong>Demo:</strong> username: <code className="text-primary">admin</code> / password: <code className="text-primary">admin123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
