import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, LogOut, Vote as VoteIcon, Sparkles, Trophy } from 'lucide-react';
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
  const { candidates, currentUser, castVote, setCurrentUser, electionPhase, offlineRecords } = useVoting();
  const [selectedVotes, setSelectedVotes] = useState<Partial<Record<Position, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  if (!currentUser) { navigate('/user-login'); return null; }

  const offlineRecord = offlineRecords.find(r => r.studentId === currentUser.studentId);
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
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group">
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
          </button>
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
              const categoryPositions = POSITION_CATEGORIES[category];
              const categoryVotes = categoryPositions.filter(p => selectedVotes[p]);
              const isComplete = categoryVotes.length === categoryPositions.length;

              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="relative py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                >
                  <span className="hidden sm:inline">{category}</span>
                  <span className="sm:hidden">{category.substring(0, 3)}</span>
                  {isComplete && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs shadow-sm">
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

                // Department filter for Department Rep
                if (pos === 'Department Representative') {
                  positionCandidates = positionCandidates.filter(c => c.department.toLowerCase() === currentUser.department.toLowerCase());
                }

                const notaId = `nota-${pos}`;
                const isUnopposed = positionCandidates.length === 1;

                // Auto-select unopposed candidate
                if (isUnopposed && !selectedVotes[pos]) {
                  setSelectedVotes(prev => ({ ...prev, [pos]: positionCandidates[0].id }));
                }

                return (
                  <div key={pos} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                        {pos}
                        {selectedVotes[pos] && <Check className="h-4 w-4 text-green-500" />}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {positionCandidates.length} Candidate{positionCandidates.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {isUnopposed ? (
                      /* Unopposed position - show info card, no voting */
                      <div className="rounded-2xl border-2 border-yellow-400/40 bg-yellow-50/30 dark:bg-yellow-500/5 p-6 flex items-center gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/20 shrink-0">
                          <Trophy className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-display text-lg font-bold text-foreground">{positionCandidates[0].name}</p>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-700 text-xs font-semibold uppercase tracking-wide">
                              <Trophy className="h-3 w-3" /> Wins Unopposed
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{positionCandidates[0].department}</p>
                          {positionCandidates[0].party && (
                            <p className="text-sm font-medium text-[#38a09e] mt-1">🏳 {positionCandidates[0].party}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">This candidate is running unopposed and wins automatically. No voting required.</p>
                        </div>
                      </div>
                    ) : (
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

                        {/* NOTA Option */}
                        <div
                          onClick={() => setSelectedVotes(prev => ({ ...prev, [pos]: notaId }))}
                          className="cursor-pointer animate-slide-up"
                          style={{ animationDelay: `${positionCandidates.length * 80}ms` }}
                        >
                          <div className={`group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated flex items-center p-4 gap-4 ${selectedVotes[pos] === notaId ? 'ring-2 ring-destructive shadow-[0_0_20px_rgba(239,68,68,0.2)] bg-destructive/5' : ''
                            }`}>
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
                              <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10">
                                <span className="text-destructive text-sm font-bold">✓</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {positionCandidates.length === 0 && (
                          <div className="col-span-full glass-card border-dashed border-2 rounded-2xl p-8 text-center bg-background/30">
                            <p className="text-muted-foreground">No candidates approved for this position {pos === 'Department Representative' ? `in ${currentUser.department}` : ''}.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          ))}
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
                      <span className="text-sm font-semibold text-foreground">
                        {selectedVotes[pos]?.startsWith('nota-')
                          ? 'None Of The Above'
                          : candidates.find(c => c.id === selectedVotes[pos])?.name}
                      </span>
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
