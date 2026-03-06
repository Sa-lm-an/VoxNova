import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Vote, FileText, BarChart3 } from 'lucide-react';
import heroImg from '@/assets/hero-voting.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-lg">
          <Vote className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">CampusVote</h1>
          <p className="text-[11px] text-muted-foreground">Secure E-Voting Platform</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center pb-12">
        {/* Hero Image */}
        <div className="w-full max-w-md mb-6 animate-slide-up">
          <img
            src={heroImg}
            alt="Campus election illustration"
            className="w-full h-auto rounded-3xl shadow-elevated"
          />
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center animate-slide-up">
          Your Voice,{' '}
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Your Vote
          </span>
        </h2>
        <p className="mt-2 text-muted-foreground text-center max-w-sm animate-slide-up">
          Secure, transparent elections for your campus.
        </p>

        {/* 3 Main Action Cards */}
        <div className="mt-10 w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <button
            onClick={() => navigate('/login')}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-card border border-border/40 transition-all hover:shadow-elevated hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-glow transition-transform group-hover:scale-110">
              <Vote className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">Login</span>
            <span className="text-xs text-muted-foreground text-center">Cast your vote or manage elections</span>
          </button>

          <button
            onClick={() => navigate('/user-login?action=nominate')}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-card border border-border/40 transition-all hover:shadow-elevated hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-success shadow-md transition-transform group-hover:scale-110">
              <FileText className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">Nomination</span>
            <span className="text-xs text-muted-foreground text-center">Apply as a candidate for elections</span>
          </button>

          <button
            onClick={() => navigate('/results')}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-card border border-border/40 transition-all hover:shadow-elevated hover:-translate-y-1 active:scale-[0.98]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent shadow-md transition-transform group-hover:scale-110">
              <BarChart3 className="h-7 w-7 text-accent-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">Results</span>
            <span className="text-xs text-muted-foreground text-center">View live election results</span>
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
