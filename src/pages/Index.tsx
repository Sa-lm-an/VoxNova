import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Vote, FileText, BarChart3, Sparkles } from 'lucide-react';
import heroImg from '@/assets/hero-voting.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center gap-3 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-glow animate-pulse-soft">
          <Vote className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">CampusVote</h1>
          <p className="text-xs text-muted-foreground">Secure E-Voting Platform</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center pb-16 relative z-10">
        {/* Hero Image with glow effect */}
        <div className="w-full max-w-md mb-8 animate-slide-up relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src={heroImg}
            alt="Campus election illustration"
            className="w-full h-auto rounded-3xl shadow-elevated relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute -top-3 -right-3 z-20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent shadow-lg animate-float">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center animate-slide-up leading-tight">
          Your Voice,{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Your Vote
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
          </span>
        </h2>
        <p className="mt-4 text-muted-foreground text-center max-w-md text-lg animate-slide-up">
          Secure, transparent elections for your campus community.
        </p>

        {/* 3 Main Action Cards */}
        <div className="mt-12 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-up">
          <button
            onClick={() => navigate('/login')}
            className="group relative flex flex-col items-center gap-4 rounded-3xl glass-card p-7 transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Vote className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold text-foreground">Login</span>
            <span className="text-xs text-muted-foreground text-center leading-relaxed">Cast your vote or manage elections</span>
          </button>

          <button
            onClick={() => navigate('/nominate')}
            className="group relative flex flex-col items-center gap-4 rounded-3xl glass-card p-7 transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl gradient-success shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <FileText className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-bold text-foreground">Nomination</span>
            <span className="text-xs text-muted-foreground text-center leading-relaxed">Apply as a candidate for elections</span>
          </button>

          <button
            onClick={() => navigate('/results')}
            className="group relative flex flex-col items-center gap-4 rounded-3xl glass-card p-7 transition-all duration-300 hover:shadow-elevated hover:-translate-y-2 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <BarChart3 className="h-8 w-8 text-accent-foreground" />
            </div>
            <span className="font-display text-base font-bold text-foreground">Results</span>
            <span className="text-xs text-muted-foreground text-center leading-relaxed">View election results</span>
          </button>
        </div>
      </main>

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default Index;
