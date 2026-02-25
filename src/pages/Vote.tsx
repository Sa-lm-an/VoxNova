import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, LogOut, FileText } from 'lucide-react';
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
  const { candidates, currentUser, castVote, setCurrentUser, votingActive } = useVoting();
  const [selectedVotes, setSelectedVotes] = useState<Partial<Record<Position, string>>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  if (!currentUser) { navigate('/user-login'); return null; }

  if (!votingActive) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Voting is Currently Closed</h2>
          <p className="mt-2 text-muted-foreground">Please check back later or contact the administrator.</p>
          <Button onClick={() => navigate('/')} variant="hero" className="mt-6">Go Home</Button>
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
      <div className="min-h-screen gradient-hero">
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
          <div className="animate-scale-in text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full gradient-success shadow-lg">
              <Check className="h-12 w-12 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Thank You!</h2>
            <p className="mt-2 text-lg text-muted-foreground">Your votes have been recorded successfully.</p>
            <div className="mt-8 flex flex-col gap-4">
              <Button onClick={() => navigate('/results')} variant="hero" size="lg">View Results</Button>
              <Button onClick={handleLogout} variant="glass" size="lg"><LogOut className="mr-2 h-5 w-5" />Logout</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/nominate')} variant="glass" size="sm">
              <FileText className="mr-2 h-4 w-4" /> Apply for Nomination
            </Button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-destructive">
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Cast Your Vote</h2>
          <p className="mt-2 text-muted-foreground">Select one candidate for each position</p>
          <p className="mt-1 text-sm text-primary font-medium">Student ID: {currentUser.studentId}</p>
        </div>

        <Tabs defaultValue="President" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            {POSITIONS.map(pos => (
              <TabsTrigger key={pos} value={pos} className="relative">
                {pos}
                {selectedVotes[pos] && (
                  <Check className="ml-1 inline h-4 w-4 text-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {POSITIONS.map(pos => {
            const positionCandidates = candidates.filter(c => c.position === pos);
            return (
              <TabsContent key={pos} value={pos}>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                  {positionCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedVotes(prev => ({ ...prev, [pos]: candidate.id }))}
                      className="cursor-pointer"
                    >
                      <CandidateCard candidate={candidate} isSelected={selectedVotes[pos] === candidate.id} />
                    </div>
                  ))}
                  {positionCandidates.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-8">No candidates for this position yet.</p>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Summary Bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-lg animate-slide-up">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Selected: {Object.keys(selectedVotes).length} / {POSITIONS.length} positions
              </p>
              <div className="flex gap-4 mt-1">
                {POSITIONS.map(pos => (
                  <span key={pos} className={`text-xs ${selectedVotes[pos] ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {pos}: {selectedVotes[pos] ? candidates.find(c => c.id === selectedVotes[pos])?.name : '—'}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={() => setShowConfirm(true)} variant="hero" size="lg" disabled={!allSelected}>
              <Check className="mr-2 h-5 w-5" /> Confirm All Votes
            </Button>
          </div>
        </div>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Your Votes</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to vote for:
                <ul className="mt-2 space-y-1">
                  {POSITIONS.map(pos => (
                    <li key={pos}><strong>{pos}:</strong> {candidates.find(c => c.id === selectedVotes[pos])?.name}</li>
                  ))}
                </ul>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleVoteConfirm}>Yes, Cast My Votes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Vote;
