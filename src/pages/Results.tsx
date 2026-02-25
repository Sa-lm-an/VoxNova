import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, TrendingUp } from 'lucide-react';
import { useVoting } from '@/contexts/VotingContext';
import { POSITIONS, Position } from '@/types/voting';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

const Results = () => {
  const navigate = useNavigate();
  const { candidates, votedUsers } = useVoting();

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="min-h-screen gradient-hero pb-8">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        <div className="mt-8 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Election Results</h2>
          <p className="mt-2 text-muted-foreground">Live voting statistics across all positions</p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-card p-6 shadow-card animate-scale-in">
            <Users className="h-8 w-8 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{votedUsers.length}</p>
            <p className="text-sm text-muted-foreground">Total Voters</p>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-card animate-scale-in">
            <TrendingUp className="h-8 w-8 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalVotes}</p>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </div>
          <div className="col-span-2 md:col-span-1 rounded-2xl bg-card p-6 shadow-card animate-scale-in">
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
            const positionCandidates = candidates.filter(c => c.position === pos);
            const posVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0);
            const sorted = [...positionCandidates].sort((a, b) => b.votes - a.votes);
            const chartData = positionCandidates.map(c => ({ name: c.name, value: c.votes }));

            return (
              <TabsContent key={pos} value={pos}>
                {/* Chart */}
                <div className="mt-4 rounded-3xl bg-card p-6 shadow-elevated animate-slide-up">
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">{pos} - Vote Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                          {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rankings */}
                <div className="mt-6 space-y-4">
                  {sorted.map((candidate, index) => {
                    const percentage = posVotes > 0 ? (candidate.votes / posVotes) * 100 : 0;
                    return (
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
                              <p className="font-bold text-primary">{candidate.votes}</p>
                              <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
