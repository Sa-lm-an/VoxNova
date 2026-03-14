import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Award, Clock } from 'lucide-react';
import { useVoting } from '@/contexts/VotingContext';
import { POSITIONS } from '@/types/voting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Results = () => {
  const navigate = useNavigate();
  const { candidates, electionPhase, registeredStudents, votedUsers, offlineRecords, notaVotes } = useVoting();

  if (electionPhase !== 'results') {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
        <div className="text-center glass-card rounded-3xl p-12 max-w-md mx-4 animate-scale-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/20">
            <Clock className="h-10 w-10 text-accent-foreground animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Election Still Ongoing</h2>
          <p className="mt-3 text-muted-foreground">Results will be published here once the voting phase has concluded.</p>
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
        <div className="pt-4" />

        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-lg">
            <Trophy className="h-8 w-8 text-accent-foreground" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Election Results</h2>
          <p className="mt-2 text-muted-foreground">Final results across all positions</p>
        </div>

        {/* Results Tabs */}
        <Tabs defaultValue="Chairperson" className="mt-10">
          <TabsList className="grid w-full grid-cols-3 glass-card p-1.5 rounded-2xl h-auto max-w-lg mx-auto">
            {POSITIONS.map(pos => (
              <TabsTrigger
                key={pos}
                value={pos}
                className="py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all font-bold"
              >
                <span className="truncate">{pos}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {POSITIONS.map(pos => {
            const sorted = [...candidates.filter(c => c.position === pos)].sort((a, b) => b.votes - a.votes);

            if (pos === 'Department Representative') {
              const departments = [...new Set([
                ...candidates.filter(c => c.position === pos).map(c => c.department),
                ...Object.keys(notaVotes)
                  .filter(k => k.startsWith(`${pos}_`))
                  .map(k => k.replace(`${pos}_`, ''))
              ])];

              return (
                <TabsContent key={pos} value={pos}>
                  <div className="mt-8 space-y-12 max-w-2xl mx-auto">
                    {departments.map(dept => {
                      const deptCandidates = sorted.filter(c => c.department === dept);
                      const deptNotaKey = `${pos}_${dept}`;
                      const deptNotaCount = notaVotes[deptNotaKey] || 0;

                      if (deptCandidates.length === 0 && deptNotaCount === 0) return null;

                      return (
                        <div key={dept} className="space-y-4">
                          <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <h3 className="font-display text-xl font-bold text-foreground">
                              {dept}
                            </h3>
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase tracking-wider">Representative</span>
                          </div>
                          <div className="space-y-4">
                            {deptCandidates.map((candidate, index) => {
                              const isUnopposed = deptCandidates.length === 1;
                              return (
                                <div
                                  key={candidate.id}
                                  className={`flex items-center gap-4 glass-card rounded-2xl p-5 animate-slide-up transition-all hover:shadow-elevated ${index === 0 ? 'ring-2 ring-accent/50' : ''}`}
                                  style={{ animationDelay: `${index * 80}ms` }}
                                >
                                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${index === 0
                                    ? 'gradient-primary text-primary-foreground shadow-glow'
                                    : index === 1
                                      ? 'bg-muted-foreground/20 text-foreground'
                                      : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0 ml-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-foreground truncate">{candidate.name}</p>
                                      {index === 0 && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold">
                                          <Trophy className="h-3 w-3" /> {isUnopposed ? 'Unopposed' : 'Winner'}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{candidate.party || 'Independent'}</p>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-right pl-4 border-l border-border/30">
                                      <p className="font-display text-2xl font-bold text-foreground">{candidate.votes}</p>
                                      <p className="text-xs text-muted-foreground">Total Votes</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <div className="flex items-center gap-4 glass-card rounded-2xl p-5 animate-slide-up border border-destructive/20 bg-destructive/5">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-bold text-lg">✗</div>
                              <div className="flex-1 min-w-0 ml-2">
                                <p className="font-semibold text-foreground">None Of The Above (NOTA)</p>
                                <p className="text-sm text-muted-foreground">Result for {dept}</p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right pl-4 border-l border-border/30">
                                  <p className="font-display text-2xl font-bold text-destructive">{deptNotaCount}</p>
                                  <p className="text-xs text-muted-foreground">Total Votes</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            }

            return (
              <TabsContent key={pos} value={pos}>
                <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                  {sorted.map((candidate, index) => {
                    const isUnopposed = sorted.length === 1;

                    return (
                      <div
                        key={candidate.id}
                        className={`flex items-center gap-4 glass-card rounded-2xl p-5 animate-slide-up transition-all hover:shadow-elevated ${index === 0 ? 'ring-2 ring-accent/50' : ''}`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${index === 0
                          ? 'gradient-primary text-primary-foreground shadow-glow'
                          : index === 1
                            ? 'bg-muted-foreground/20 text-foreground'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0 ml-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground truncate">{candidate.name}</p>
                            {index === 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-bold">
                                <Trophy className="h-3 w-3" /> {isUnopposed ? 'Unopposed' : 'Winner'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {candidate.department} {candidate.party ? `• ${candidate.party}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right pl-4 border-l border-border/30">
                            <p className="font-display text-2xl font-bold text-foreground">{candidate.votes}</p>
                            <p className="text-xs text-muted-foreground">Total Votes</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-4 glass-card rounded-2xl p-5 animate-slide-up border border-destructive/20 bg-destructive/5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-bold text-lg">✗</div>
                    <div className="flex-1 min-w-0 ml-2">
                      <p className="font-semibold text-foreground">None Of The Above (NOTA)</p>
                      <p className="text-sm text-muted-foreground">Rejected all candidates</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right pl-4 border-l border-border/30">
                        <p className="font-display text-2xl font-bold text-destructive">{notaVotes[pos] || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Votes</p>
                      </div>
                    </div>
                  </div>

                  {sorted.length === 0 && !notaVotes[pos] && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <p className="text-muted-foreground">No data available for this position.</p>
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
