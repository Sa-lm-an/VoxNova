import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Filter, CheckCircle2, Circle, Globe, Users, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ControllerDashboard = () => {
  const navigate = useNavigate();
  const { offlineRecords, markOfflineVote, unmarkOfflineVote, isController, setIsController, votedUsers, candidates, addOfflineVotesForCandidate, addOfflineNota, isLoading } = useVoting();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ student_id: string; studentName: string; action: 'mark' | 'unmark' } | null>(null);
  const [offlineInput, setOfflineInput] = useState<Record<string, string>>({});
  const [submittedCandidates, setSubmittedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [activePosition, setActivePosition] = useState<string>('');
  // Offline vote confirmation
  const [offlineConfirm, setOfflineConfirm] = useState<{ id: string; name: string; count: number; isNota?: boolean } | null>(null);
  const PAGE_SIZE = 10;

  const departments = useMemo(() => {
    if (!offlineRecords.length) return [];
    return [...new Set(offlineRecords.map(r => r.department))];
  }, [offlineRecords]);

  const filteredRecords = useMemo(() => {
    const isVoted = new Set(votedUsers);
    let records = offlineRecords.map(r => ({
      ...r,
      votedOnline: r.votedOnline || isVoted.has(r.student_id),
    }));

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r => 
        r.studentName.toLowerCase().includes(q) || 
        r.student_id.toLowerCase().includes(q)
      );
    }
    
    if (deptFilter !== 'all') records = records.filter(r => r.department === deptFilter);
    if (statusFilter === 'online') records = records.filter(r => r.votedOnline);
    else if (statusFilter === 'offline') records = records.filter(r => r.markedOffline);
    else if (statusFilter === 'pending') records = records.filter(r => !r.votedOnline && !r.markedOffline);

    records.sort((a, b) => {
      if (sortBy === 'name') return sortAsc ? a.studentName.localeCompare(b.studentName) : b.studentName.localeCompare(a.studentName);
      if (sortBy === 'department') return sortAsc ? a.department.localeCompare(b.department) : b.department.localeCompare(a.department);
      
      const statusRank = (r: typeof a) => r.votedOnline ? 0 : r.markedOffline ? 1 : 2;
      return sortAsc ? statusRank(a) - statusRank(b) : statusRank(b) - statusRank(a);
    });

    return records;
  }, [offlineRecords, votedUsers, search, deptFilter, statusFilter, sortBy, sortAsc]);

  const stats = useMemo(() => {
    const isVoted = new Set(votedUsers);
    let online = 0;
    let offline = 0;
    let pending = 0;

    offlineRecords.forEach(r => {
      if (r.votedOnline || isVoted.has(r.student_id)) online++;
      else if (r.markedOffline) offline++;
      else pending++;
    });

    return {
      total: offlineRecords.length,
      online,
      offline,
      pending,
    };
  }, [offlineRecords, votedUsers]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pagedRecords = useMemo(() => 
    filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredRecords, currentPage]
  );

  // Group candidates by position
  const candidatesByPosition = useMemo(() => {
    const grouped: Record<string, typeof candidates> = {};
    candidates.forEach(c => {
      if (!grouped[c.position]) grouped[c.position] = [];
      grouped[c.position].push(c);
    });
    return grouped;
  }, [candidates]);

  const positionKeys = Object.keys(candidatesByPosition);
  // Set default active position once positions are known
  const resolvedActive = activePosition && positionKeys.includes(activePosition) ? activePosition : positionKeys[0] || '';

  const totalMarkedOffline = useMemo(() => {
    return offlineRecords.filter(r => r.markedOffline).length;
  }, [offlineRecords]);

  const totalOnlineVoters = useMemo(() => {
    return votedUsers.length;
  }, [votedUsers]);

  const quotaInfo = useMemo(() => {
    if (!resolvedActive) return { used: 0, remaining: 0 };
    
    // 1. Calculate offline votes for candidates in this position
    const candidateOfflineVotes = (candidatesByPosition[resolvedActive] || [])
      .reduce((sum, c) => sum + (c.offline_votes || 0), 0);
    
    // 2. Calculate offline NOTA for this position
    // We derive it by: TotalNOTA (from DB) - OnlineNOTA
    const getOfflineNotaForTarget = (target?: string) => {
      const notaKey = target ? `${resolvedActive}_${target}` : resolvedActive;
      const totalNota = useVoting().notaVotes[notaKey] || 0;
      
      // Online NOTA in this target = (Total Online Voters in target) - (Total Candidate Online Votes in target)
      let onlineVotersInTarget = totalOnlineVoters;
      let candidateOnlineVotesInTarget = (candidatesByPosition[resolvedActive] || [])
        .reduce((sum, c) => sum + (c.online_votes || 0), 0);
        
      if (resolvedActive === 'Department Representative' && target) {
        onlineVotersInTarget = offlineRecords.filter(r => r.votedOnline && r.department === target).length;
        candidateOnlineVotesInTarget = (candidatesByPosition[resolvedActive] || [])
          .filter(c => c.department === target)
          .reduce((sum, c) => sum + (c.online_votes || 0), 0);
      }
      
      const onlineNota = Math.max(0, onlineVotersInTarget - candidateOnlineVotesInTarget);
      return Math.max(0, totalNota - onlineNota);
    };

    let totalOfflineLocked = candidateOfflineVotes;
    if (resolvedActive === 'Department Representative') {
      departments.forEach(d => { totalOfflineLocked += getOfflineNotaForTarget(d); });
    } else {
      totalOfflineLocked += getOfflineNotaForTarget();
    }

    return {
      used: totalOfflineLocked,
      remaining: Math.max(0, totalMarkedOffline - totalOfflineLocked)
    };
  }, [resolvedActive, candidatesByPosition, totalOnlineVoters, totalMarkedOffline, departments, offlineRecords]);

  useEffect(() => {
    if (!isController && !isLoading) {
      navigate('/controller-login');
    }
  }, [isController, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#112250]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E0C58F] border-t-transparent" />
      </div>
    );
  }

  if (!isController) return null;

  const handleToggle = (student_id: string, studentName: string, currentlyMarked: boolean, votedOnline: boolean) => {
    if (votedOnline) {
      toast({ title: 'Cannot Mark', description: 'This student has already voted online.', variant: 'destructive' });
      return;
    }
    setConfirmAction({ student_id, studentName, action: currentlyMarked ? 'unmark' : 'mark' });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.action === 'mark') {
      await markOfflineVote(confirmAction.student_id, 'Controller');
      toast({ title: 'Marked', description: `${confirmAction.studentName} marked as voted offline.` });
    } else {
      await unmarkOfflineVote(confirmAction.student_id);
      toast({ title: 'Unmarked', description: `Offline vote marking removed for ${confirmAction.studentName}.` });
    }
    setConfirmAction(null);
  };

  const handleLogout = () => { setIsController(false); navigate('/'); };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortAsc(!sortAsc);
    else { setSortBy(field); setSortAsc(true); }
  };

  return (
    <div className="min-h-screen gradient-hero pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <span className="font-medium">Controller Panel</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground transition-all hover:text-destructive group"
          >
            <span className="font-medium">Logout</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/0 transition-all group-hover:bg-destructive/10 group-hover:translate-x-1">
              <LogOut className="h-5 w-5" />
            </div>
          </button>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-3xl font-bold text-foreground">Controller Dashboard</h2>
          <p className="mt-2 text-muted-foreground">Track and mark offline votes</p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-5 shadow-card border border-white/20">
            <Users className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-5 shadow-card border border-white/20">
            <Globe className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.online}</p>
            <p className="text-sm text-muted-foreground">Voted Online</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-5 shadow-card border border-white/20">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.offline}</p>
            <p className="text-sm text-muted-foreground">Voted Offline</p>
          </div>
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-5 shadow-card border border-white/20">
            <Circle className="h-6 w-6 text-muted-foreground" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Not Voted</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px]"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Voted Online</SelectItem>
              <SelectItem value="offline">Voted Offline</SelectItem>
              <SelectItem value="pending">Not Voted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl bg-card/80 backdrop-blur-sm shadow-card overflow-hidden border border-border/40">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table className="relative">
              <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[60px] text-center">No.</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                    Student <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('department')}>
                    Department <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                    Status <ArrowUpDown className="inline h-3 w-3 ml-1" />
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRecords.map((record, index) => (
                  <TableRow key={record.student_id}>
                    <TableCell className="text-center">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.studentName}</p>
                        <p className="text-xs text-muted-foreground">{record.student_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{record.department}</TableCell>
                    <TableCell className="text-muted-foreground">{record.phone}</TableCell>
                    <TableCell>
                      {record.votedOnline ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <Globe className="h-3 w-3" /> Online
                        </span>
                      ) : record.markedOffline ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
                          <CheckCircle2 className="h-3 w-3" /> Offline
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          <Circle className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {record.votedOnline ? (
                        <span className="text-xs text-muted-foreground">Online voter</span>
                      ) : (
                        <Button
                          variant={record.markedOffline ? 'destructive' : 'hero'}
                          size="sm"
                          onClick={() => handleToggle(record.student_id, record.studentName, record.markedOffline, record.votedOnline)}
                        >
                          {record.markedOffline ? 'Unmark' : 'Mark Voted'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} students
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === currentPage ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                >
                  {p}
                </button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</Button>
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-1">Offline Ballot Votes</h3>
              <p className="text-sm text-muted-foreground">Enter offline ballot votes per candidate. Switch between positions using the tabs.</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl px-5 py-3 flex items-center gap-6 shadow-sm">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Marked Offline</p>
                <p className="text-xl font-bold text-foreground">{totalMarkedOffline}</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Available Ballots</p>
                <p className={`text-xl font-bold ${quotaInfo.remaining > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {quotaInfo.remaining}
                </p>
              </div>
            </div>
          </div>

          {/* Position Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {positionKeys.map(pos => (
              <button
                key={pos}
                onClick={() => setActivePosition(pos)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${resolvedActive === pos
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/70'
                  }`}
              >
                {pos}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${resolvedActive === pos ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background text-muted-foreground'
                  }`}>
                  {candidatesByPosition[pos]?.length}
                </span>
              </button>
            ))}
          </div>

          {/* Active Position Candidates + NOTA */}
          {resolvedActive && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(candidatesByPosition[resolvedActive] || []).map((candidate) => {
                const submitted = submittedCandidates.has(candidate.id);
                return (
                  <div key={candidate.id} className="rounded-2xl bg-card shadow-card p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.department}</p>
                      </div>
                    </div>
                    {submitted ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground bg-accent/20 rounded-xl px-4 py-2">
                        <CheckCircle2 className="h-4 w-4" /> Offline votes submitted!
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="No. of offline votes"
                          value={offlineInput[candidate.id] || ''}
                          onChange={(e) => setOfflineInput(prev => ({ ...prev, [candidate.id]: e.target.value }))}
                          className="flex-1 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="hero"
                          onClick={() => {
                            const count = parseInt(offlineInput[candidate.id] || '0', 10);
                            if (!count || count <= 0) {
                              toast({ title: 'Invalid Count', description: 'Enter a valid number greater than 0.', variant: 'destructive' });
                              return;
                            }
                            if (count > quotaInfo.remaining) {
                              toast({ title: 'Quota Exceeded', description: `You only have ${quotaInfo.remaining} ballots remaining for this position.`, variant: 'destructive' });
                              return;
                            }
                            setOfflineConfirm({ id: candidate.id, name: candidate.name, count });
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* NOTA Section */}
              {(() => {
                const isDeptRep = resolvedActive === 'Department Representative';
                const targets = isDeptRep ? departments : ['Global'];

                return targets.map(target => {
                  const notaId = isDeptRep ? `nota-offline-${resolvedActive}-${target}` : `nota-offline-${resolvedActive}`;
                  const submitted = submittedCandidates.has(notaId);
                  const displayName = isDeptRep ? `NOTA (${target})` : 'NOTA';

                  return (
                    <div key={notaId} className="rounded-2xl bg-card shadow-card p-5 flex flex-col gap-3 border-2 border-dashed border-muted-foreground/20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30 text-xl font-bold text-muted-foreground">✗</div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{displayName}</p>
                          <p className="text-xs text-destructive font-medium">None Of The Above</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex-1">
                        Offline NOTA ballots for {isDeptRep ? <span className="font-semibold text-primary">{target}</span> : <span className="font-semibold">{resolvedActive}</span>}
                      </div>
                      {submitted ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground bg-accent/20 rounded-xl px-4 py-2">
                          <CheckCircle2 className="h-4 w-4" /> Submitted!
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            placeholder="Count"
                            value={offlineInput[notaId] || ''}
                            onChange={(e) => setOfflineInput(prev => ({ ...prev, [notaId]: e.target.value }))}
                            className="flex-1 text-sm h-9"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const count = parseInt(offlineInput[notaId] || '0', 10);
                              if (!count || count <= 0) {
                                toast({ title: 'Invalid Count', description: 'Enter a valid number greater than 0.', variant: 'destructive' });
                                return;
                              }
                              setOfflineConfirm({
                                id: notaId,
                                name: isDeptRep ? `NOTA - ${target}` : `NOTA (${resolvedActive})`,
                                count,
                                isNota: true
                              });
                            }}
                            disabled={quotaInfo.remaining === 0}
                            className="h-9 px-3"
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-center">
              {confirmAction?.action === 'mark' ? 'Confirm Offline Vote' : 'Remove Offline Mark'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {confirmAction?.action === 'mark'
                ? `Are you sure you want to mark "${confirmAction?.studentName}" as voted offline? This action records their vote.`
                : `Are you sure you want to remove the offline vote mark for "${confirmAction?.studentName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="rounded-xl">
              {confirmAction?.action === 'mark' ? 'Yes, Mark Voted' : 'Yes, Unmark'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Offline Vote Submission Confirmation */}
      <AlertDialog open={!!offlineConfirm} onOpenChange={(open) => !open && setOfflineConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${offlineConfirm?.isNota ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <AlertTriangle className={`h-6 w-6 ${offlineConfirm?.isNota ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <AlertDialogTitle className="text-center">
              Confirm Offline Vote Entry
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You are about to record <strong>{offlineConfirm?.count}</strong> offline ballot vote(s) for <strong>{offlineConfirm?.name}</strong>. This will update the vote count immediately. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl"
              onClick={async () => {
                if (!offlineConfirm) return;
                if (!offlineConfirm.isNota) {
                  await addOfflineVotesForCandidate(offlineConfirm.id, offlineConfirm.count);
                } else {
                  // Extract correct notaKey (handle Dept Rep)
                  let notaKey = offlineConfirm.id.replace('nota-offline-', ''); // e.g., Chairperson or Department Representative-CS
                  let dept: string | undefined = undefined;
                  
                  if (notaKey.includes('Department Representative-')) {
                    dept = notaKey.split('-').pop();
                    notaKey = 'Department Representative';
                  }
                  
                  await addOfflineNota(notaKey, offlineConfirm.count, dept);
                }
                setSubmittedCandidates(prev => new Set([...prev, offlineConfirm.id]));
                setOfflineInput(prev => ({ ...prev, [offlineConfirm.id]: '' }));
                setOfflineConfirm(null);
              }}
            >
              Yes, Record Votes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ControllerDashboard;
