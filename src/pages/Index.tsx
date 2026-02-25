import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Vote, Users, BarChart3, ClipboardCheck } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg">
              <Vote className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">CampusVote</h1>
              <p className="text-xs text-muted-foreground">Secure E-Voting</p>
            </div>
          </div>
        </header>

        <main className="mt-16 flex flex-col items-center text-center">
          <div className="animate-float mb-8">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-full blur-3xl opacity-20" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full gradient-primary shadow-glow">
                <Vote className="h-16 w-16 text-primary-foreground" />
              </div>
            </div>
          </div>

          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl animate-slide-up">
            Your Voice,
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Your Vote
            </span>
          </h2>

          <p className="mt-4 max-w-md text-lg text-muted-foreground animate-slide-up">
            Secure, transparent, and easy-to-use electronic voting for your college elections.
          </p>

          {/* Feature Cards */}
          <div className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-4 animate-slide-up">
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <Shield className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-medium text-foreground">Secure</p>
            </div>
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <Users className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-medium text-foreground">One Vote</p>
            </div>
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <BarChart3 className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-medium text-foreground">Live Results</p>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="mt-12 flex w-full max-w-sm flex-col gap-4 animate-slide-up">
            <Button onClick={() => navigate('/user-login')} variant="hero" size="xl" className="w-full">
              <Vote className="mr-2 h-5 w-5" />
              Student Login
            </Button>

            <Button onClick={() => navigate('/admin-login')} variant="glass" size="lg" className="w-full">
              <Shield className="mr-2 h-5 w-5" />
              Admin Login
            </Button>

            <Button onClick={() => navigate('/controller-login')} variant="glass" size="lg" className="w-full">
              <ClipboardCheck className="mr-2 h-5 w-5" />
              Controller Login
            </Button>
          </div>

          {/* View Results Link */}
          <button
            onClick={() => navigate('/results')}
            className="mt-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <BarChart3 className="h-4 w-4" />
            View Live Results
          </button>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
