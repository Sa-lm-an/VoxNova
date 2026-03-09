import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Award, Clock } from 'lucide-react';
import { useVoting } from '@/contexts/VotingContext';
import { POSITIONS } from '@/types/voting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

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
      <div className="flex min-h-screen items-center justify-center gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
        <div className="text-center glass-card rounded-3xl p-12 max-w-md mx-4 animate-scale-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/20">
            <Clock className="h-10 w-10 text-accent-foreground animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Voting Still in Progress</h2>
          <p className="mt-3 text-muted-foreground">Results will be available after all votes have been cast.</p>
          <Button onClick={() => navigate('/')} variant="hero" size="lg" className="mt-8">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group">
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
        </button>

        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg">
            <Trophy className="h-8 w-8 text-accent-foreground" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Election Results</h2>
          <p className="mt-2 text-muted-foreground">Final results across all positions</p>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-5 max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-6 text-center animate-scale-in">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{votedUsers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Voters</p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center animate-scale-in" style={{ animationDelay: '100ms' }}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
              <Award className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{POSITIONS.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Positions</p>
          </div>
        </div>

        <Tabs defaultValue="President" className="mt-10">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1.5 rounded-2xl h-auto max-w-lg mx-auto">
            {POSITIONS.map(pos => (
              <TabsTrigger 
                key={pos} 
                value={pos}
                className="py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                {pos}
              </TabsTrigger>
            ))}
          </TabsList>

          {POSITIONS.map(pos => {
            const sorted = [...candidates.filter(c => c.position === pos)].sort((a, b) => b.votes - a.votes);

            return (
              <TabsContent key={pos} value={pos}>
                <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                  {sorted.map((candidate, index) => (
                    <div 
                      key={candidate.id} 
                      className={`flex items-center gap-4 glass-card rounded-2xl p-5 animate-slide-up transition-all hover:shadow-elevated ${index === 0 ? 'ring-2 ring-accent/50' : ''}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${
                        index === 0 
                          ? 'gradient-primary text-primary-foreground shadow-glow' 
                          : index === 1
                          ? 'bg-muted-foreground/20 text-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <img 
                        src={candidate.image} 
                        alt={candidate.name} 
                        className={`h-14 w-14 rounded-xl object-cover ring-2 ${index === 0 ? 'ring-accent' : 'ring-border'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">{candidate.name}</p>
                          {index === 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium">
                              <Trophy className="h-3 w-3" /> Winner
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{candidate.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-primary">{candidate.votes}</p>
                        <p className="text-xs text-muted-foreground">votes</p>
                      </div>
                    </div>
                  ))}
                  {sorted.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <p className="text-muted-foreground">No candidates for this position.</p>
                    </div>
                  )}
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
