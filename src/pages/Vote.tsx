import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Vote as VoteIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateCard } from '@/components/CandidateCard';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Position, POSITIONS, POSITION_CATEGORIES } from '@/types/voting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Vote = () => {
  const navigate = useNavigate();
  const { candidates, currentUser, castVote, setCurrentUser, electionPhase, offlineRecords, isLoading } = useVoting();

  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate('/user-login');
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#112250]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E0C58F] border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) return null;
  const [selectedVotes, setSelectedVotes] = useState<Partial<Record<Position, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Auto-select unopposed candidates and NOTA for empty positions
  useEffect(() => {
    if (!candidates.length || !currentUser) return;

    const autoSelected: Partial<Record<Position, string>> = { ...selectedVotes };
    let changed = false;

    POSITIONS.forEach(pos => {
      if (!selectedVotes[pos]) {
        let positionCandidates = candidates.filter(c => c.position === pos);
        if (pos === 'Department Representative') {
          positionCandidates = positionCandidates.filter(c => c.department.toLowerCase() === currentUser.department.toLowerCase());
        }

        if (positionCandidates.length === 1) {
          autoSelected[pos] = positionCandidates[0].id;
          changed = true;
        } else if (positionCandidates.length === 0) {
          const notaId = pos === 'Department Representative'
            ? `nota-${pos}-${currentUser.department}`
            : `nota-${pos}`;
          autoSelected[pos] = notaId;
          changed = true;
        }
      }
    });

    if (changed) {
      setSelectedVotes(autoSelected);
    }
  }, [candidates, currentUser]);

  if (!currentUser) { navigate('/user-login'); return null; }

  const offlineRecord = offlineRecords.find(r => r.student_id === currentUser.student_id);
  const isMarkedOffline = offlineRecord?.markedOffline ?? false;

  if (electionPhase !== 'voting' || isMarkedOffline) {
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

  const handleVoteConfirm = async () => {
    const allSelected = POSITIONS.every(p => selectedVotes[p]);
    if (!allSelected) {
      toast({ title: 'Incomplete', description: 'Please select a candidate for each position.', variant: 'destructive' });
      setShowConfirm(false);
      return;
    }
    const success = await castVote(selectedVotes as Record<Position, string>);
    if (success) {
      setHasVoted(true);
      toast({ title: 'Vote Cast Successfully!', description: 'Thank you for participating in the election.' });
    }
    setShowConfirm(false);
  };

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
            <Button onClick={() => navigate('/')} variant="glass" size="xl" className="mt-10 w-full">
              Go Home
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
          {/* Back button removed as requested */}
        </div>

        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <VoteIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Cast Your Vote</h2>
          <p className="mt-2 text-muted-foreground">Select one candidate for each position</p>
        </div>

        <Tabs defaultValue="General" className="mt-10">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1.5 rounded-2xl h-auto mb-6">
            {Object.keys(POSITION_CATEGORIES).map(category => {
              const positionsInCategory = POSITION_CATEGORIES[category];
              const visiblePositions = positionsInCategory.filter(pos => {
                let filtered = candidates.filter(c => c.position === pos);
                if (pos === 'Department Representative') {
                  filtered = filtered.filter(c => c.department.toLowerCase() === currentUser.department.toLowerCase());
                }
                return filtered.length > 1;
              });

              if (visiblePositions.length === 0) return null;

              const isComplete = positionsInCategory.every(p => selectedVotes[p]);

              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="relative py-3 rounded-xl data-[state=active]:bg-[#112250] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold"
                >
                  <span className="hidden sm:inline">{category}</span>
                  <span className="sm:hidden">{category.substring(0, 3)}</span>
                  {selectedVotes[visiblePositions[0]] && ( // Very simple check if some progress is made in this tab
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E0C58F] text-[#112250] text-xs shadow-sm border-2 border-white font-black">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(POSITION_CATEGORIES).map(([category, positionsInCategory]) => (
            <TabsContent key={category} value={category} className="space-y-12">
              {positionsInCategory.map(pos => {
                let positionCandidates = candidates.filter(c => c.position === pos);
                if (pos === 'Department Representative') {
                  positionCandidates = positionCandidates.filter(c => c.department.toLowerCase() === currentUser.department.toLowerCase());
                }

                const notaId = pos === 'Department Representative'
                  ? `nota-${pos}-${currentUser.department}`
                  : `nota-${pos}`;
                if (positionCandidates.length <= 1) return null;

                return (
                  <div key={pos} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                        {pos}
                        {selectedVotes[pos] && <Check className="h-4 w-4 text-green-500" />}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {positionCandidates.length} Candidates
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {positionCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedVotes(prev => ({ ...prev, [pos]: candidate.id }))}
                          className="cursor-pointer animate-slide-up"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <CandidateCard candidate={candidate} isSelected={selectedVotes[pos] === candidate.id} />
                        </div>
                      ))}

                      <div
                        onClick={() => setSelectedVotes(prev => ({ ...prev, [pos]: notaId }))}
                        className="cursor-pointer animate-slide-up"
                        style={{ animationDelay: `${positionCandidates.length * 80}ms` }}
                      >
                        <div className={`group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated flex items-center p-4 gap-4 border border-border/40 ${selectedVotes[pos] === notaId ? 'ring-2 ring-destructive/50 shadow-[0_0_20px_rgba(239,68,68,0.1)] bg-destructive/5 border-destructive/30' : ''}`}>
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                              <span className="text-xl font-bold text-muted-foreground">✗</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive mb-1">NOTA</span>
                            <h3 className="font-display text-base font-semibold text-foreground">None Of The Above</h3>
                            <p className="text-xs text-muted-foreground shrink-0 leading-tight">Choose this if you reject all candidates</p>
                          </div>
                          {selectedVotes[pos] === notaId && (
                            <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-destructive">
                              <Check className="h-4 w-4 text-white stroke-[3px]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>

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
              </div>
              <div className="hidden sm:flex gap-3">
                {POSITIONS.map(pos => {
                  let positionCandidates = candidates.filter(c => c.position === pos);
                  if (pos === 'Department Representative') {
                    positionCandidates = positionCandidates.filter(c => c.department.toLowerCase() === currentUser.department.toLowerCase());
                  }
                  if (positionCandidates.length <= 1) return null;
                  return (
                    <span key={pos} className={`text-xs ${selectedVotes[pos] ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {pos}: {selectedVotes[pos] ? (selectedVotes[pos]?.startsWith('nota') ? 'NOTA' : candidates.find(c => c.id === selectedVotes[pos])?.name?.split(' ')[0]) : '—'}
                    </span>
                  );
                })}
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
                  {POSITIONS.map(pos => {
                    let positionCandidates = candidates.filter(c => c.position === pos);
                    if (pos === 'Department Representative') {
                      positionCandidates = positionCandidates.filter(c => c.department.toLowerCase() === currentUser.department.toLowerCase());
                    }
                    if (positionCandidates.length <= 1) return null;

                    return (
                      <div key={pos} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <span className="text-sm font-medium text-muted-foreground">{pos}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {selectedVotes[pos]?.startsWith('nota-')
                            ? 'None Of The Above'
                            : candidates.find(c => c.id === selectedVotes[pos])?.name}
                        </span>
                      </div>
                    );
                  })}
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
