import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, LogOut, Vote as VoteIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateCard } from '@/components/CandidateCard';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Position, POSITIONS } from '@/types/voting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Vote = () => {
  const navigate = useNavigate();
  const { candidates, currentUser, castVote, setCurrentUser, votingActive, offlineRecords } = useVoting();
  const [selectedVotes, setSelectedVotes] = useState<Partial<Record<Position, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  if (!currentUser) { navigate('/user-login'); return null; }

  const offlineRecord = offlineRecords.find(r => r.studentId === currentUser.studentId);
  const isMarkedOffline = offlineRecord?.markedOffline ?? false;

  if (!votingActive || isMarkedOffline) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
        <div className="text-center glass-card rounded-3xl p-10 max-w-md mx-4 animate-scale-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
            <VoteIcon className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {isMarkedOffline ? 'You Have Already Voted Offline' : 'Voting is Currently Closed'}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {isMarkedOffline ? 'Your vote has been recorded through offline voting.' : 'Please check back later or contact the administrator.'}
          </p>
          <Button onClick={() => navigate('/')} variant="hero" size="lg" className="mt-8">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleVoteConfirm = () => {
    const allSelected = POSITIONS.every(p => selectedVotes[p]);
    if (!allSelected) {
      toast({ title: 'Incomplete', description: 'Please select a candidate for each position.', variant: 'destructive' });
      setShowConfirm(false);
      return;
    }
    const success = castVote(selectedVotes as Record<Position, string>);
    if (success) {
      setHasVoted(true);
      toast({ title: 'Vote Cast Successfully!', description: 'Thank you for participating in the election.' });
    }
    setShowConfirm(false);
  };

  const handleLogout = () => { setCurrentUser(null); navigate('/'); };

  const allSelected = POSITIONS.every(p => selectedVotes[p]);

  if (hasVoted || currentUser.hasVoted) {
    return (
      <div className="min-h-screen gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 relative z-10">
          <div className="animate-scale-in text-center glass-card rounded-3xl p-12 max-w-md">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full gradient-success shadow-glow relative">
              <Check className="h-14 w-14 text-primary-foreground" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
              </div>
            </div>
            <h2 className="font-display text-4xl font-bold text-foreground">Thank You!</h2>
            <p className="mt-3 text-lg text-muted-foreground">Your votes have been recorded successfully.</p>
            <Button onClick={handleLogout} variant="glass" size="xl" className="mt-10 w-full">
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <VoteIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Cast Your Vote</h2>
          <p className="mt-2 text-muted-foreground">Select one candidate for each position</p>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Student ID: {currentUser.studentId}
          </div>
        </div>

        <Tabs defaultValue="President" className="mt-10">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1.5 rounded-2xl h-auto">
            {POSITIONS.map(pos => (
              <TabsTrigger 
                key={pos} 
                value={pos} 
                className="relative py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                {pos}
                {selectedVotes[pos] && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {POSITIONS.map(pos => {
            const positionCandidates = candidates.filter(c => c.position === pos);
            return (
              <TabsContent key={pos} value={pos}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {positionCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedVotes(prev => ({ ...prev, [pos]: candidate.id }))}
                      className="cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CandidateCard candidate={candidate} isSelected={selectedVotes[pos] === candidate.id} />
                    </div>
                  ))}
                  {positionCandidates.length === 0 && (
                    <div className="col-span-full glass-card rounded-2xl p-12 text-center">
                      <p className="text-muted-foreground">No candidates for this position yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Summary Bar */}
        <div className="fixed bottom-0 left-0 right-0 glass-dark p-5 animate-slide-up z-50">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {POSITIONS.map(pos => (
                    <div
                      key={pos}
                      className={`h-2 w-8 rounded-full transition-colors ${selectedVotes[pos] ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {Object.keys(selectedVotes).length} / {POSITIONS.length}
                </span>
              </div>
              <div className="hidden sm:flex gap-3">
                {POSITIONS.map(pos => (
                  <span key={pos} className={`text-xs ${selectedVotes[pos] ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {pos}: {selectedVotes[pos] ? candidates.find(c => c.id === selectedVotes[pos])?.name?.split(' ')[0] : '—'}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={() => setShowConfirm(true)} variant="hero" size="lg" disabled={!allSelected} className="shadow-glow">
              <Check className="mr-2 h-5 w-5" /> Confirm Votes
            </Button>
          </div>
        </div>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent className="glass-card border-0 rounded-3xl max-w-md">
            <AlertDialogHeader>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
                <VoteIcon className="h-7 w-7 text-primary-foreground" />
              </div>
              <AlertDialogTitle className="text-center text-xl">Confirm Your Votes</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 mt-4">
                  {POSITIONS.map(pos => (
                    <div key={pos} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <span className="text-sm font-medium text-muted-foreground">{pos}</span>
                      <span className="text-sm font-semibold text-foreground">{candidates.find(c => c.id === selectedVotes[pos])?.name}</span>
                    </div>
                  ))}
                  <p className="text-center text-sm text-muted-foreground pt-2">This action cannot be undone.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 sm:gap-3">
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleVoteConfirm} className="gradient-primary rounded-xl">
                Yes, Cast My Votes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Vote;
