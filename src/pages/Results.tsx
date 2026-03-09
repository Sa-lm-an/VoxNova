import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { useVoting } from '@/contexts/VotingContext';
import { POSITIONS } from '@/types/voting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Results = () => {
  const navigate = useNavigate();
  const { candidates, votingActive, registeredStudents, votedUsers, offlineRecords } = useVoting();

  // Check if all registered students have voted (online or offline)
  const allVoted = registeredStudents.every(s => {
    const record = offlineRecords.find(r => r.studentId === s.studentId);
    return votedUsers.includes(s.studentId) || record?.markedOffline;
  });

  if (votingActive && !allVoted) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Voting Still in Progress</h2>
          <p className="mt-2 text-muted-foreground">Results will be available after all votes have been cast.</p>
          <button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-8">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <div className="mt-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Election Results</h2>
          <p className="mt-2 text-muted-foreground">Final results across all positions</p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card p-6 shadow-card animate-scale-in">
            <Users className="h-8 w-8 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{votedUsers.length}</p>
            <p className="text-sm text-muted-foreground">Total Voters</p>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-card animate-scale-in">
            <Trophy className="h-8 w-8 text-accent" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{POSITIONS.length}</p>
            <p className="text-sm text-muted-foreground">Positions</p>
          </div>
        </div>

        <Tabs defaultValue="President" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            {POSITIONS.map(pos => <TabsTrigger key={pos} value={pos}>{pos}</TabsTrigger>)}
          </TabsList>

          {POSITIONS.map(pos => {
            const sorted = [...candidates.filter(c => c.position === pos)].sort((a, b) => b.votes - a.votes);

            return (
              <TabsContent key={pos} value={pos}>
                <div className="mt-6 space-y-4">
                  {sorted.map((candidate, index) => (
                    <div key={candidate.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${index === 0 ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{index + 1}</div>
                      <img src={candidate.image} alt={candidate.name} className="h-12 w-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{candidate.name}{index === 0 && <Trophy className="ml-2 inline h-4 w-4 text-accent" />}</p>
                            <p className="text-sm text-muted-foreground">{candidate.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{candidate.votes} votes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Results;
