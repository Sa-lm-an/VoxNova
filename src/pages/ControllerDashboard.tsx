import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Search, Filter, CheckCircle2, Circle, Globe, Users, ArrowUpDown, AlertTriangle } from 'lucide-react';
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
  const { offlineRecords, markOfflineVote, unmarkOfflineVote, isController, setIsController, votedUsers, candidates, addOfflineVotesForCandidate } = useVoting();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ studentId: string; studentName: string; action: 'mark' | 'unmark' } | null>(null);
  const [offlineInput, setOfflineInput] = useState<Record<string, string>>({});
  const [submittedCandidates, setSubmittedCandidates] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [activePosition, setActivePosition] = useState<string>('');
  // Offline vote confirmation
  const [offlineConfirm, setOfflineConfirm] = useState<{ id: string; name: string; count: number; isNota?: boolean } | null>(null);
  const PAGE_SIZE = 10;

  const departments = useMemo(() => [...new Set(offlineRecords.map(r => r.department))], [offlineRecords]);

  const filteredRecords = useMemo(() => {
    let records = offlineRecords.map(r => ({
      ...r,
      votedOnline: r.votedOnline || votedUsers.includes(r.studentId),
    }));

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r => r.studentName.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q));
    }
    if (deptFilter !== 'all') records = records.filter(r => r.department === deptFilter);
    if (statusFilter === 'online') records = records.filter(r => r.votedOnline);
    else if (statusFilter === 'offline') records = records.filter(r => r.markedOffline);
    else if (statusFilter === 'pending') records = records.filter(r => !r.votedOnline && !r.markedOffline);

    records.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.studentName.localeCompare(b.studentName);
      else if (sortBy === 'department') cmp = a.department.localeCompare(b.department);
      else {
        const statusRank = (r: typeof a) => r.votedOnline ? 0 : r.markedOffline ? 1 : 2;
        cmp = statusRank(a) - statusRank(b);
      }
      return sortAsc ? cmp : -cmp;
    });

    return records;
  }, [offlineRecords, votedUsers, search, deptFilter, statusFilter, sortBy, sortAsc]);

  const stats = useMemo(() => {
    const all = offlineRecords.map(r => ({ ...r, votedOnline: r.votedOnline || votedUsers.includes(r.studentId) }));
    return {
      total: all.length,
      online: all.filter(r => r.votedOnline).length,
      offline: all.filter(r => r.markedOffline).length,
      pending: all.filter(r => !r.votedOnline && !r.markedOffline).length,
    };
  }, [offlineRecords, votedUsers]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pagedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Group candidates by position
  const candidatesByPosition = useMemo(() => {
    return candidates.reduce<Record<string, typeof candidates>>((acc, c) => {
      if (!acc[c.position]) acc[c.position] = [];
      acc[c.position].push(c);
      return acc;
    }, {});
  }, [candidates]);

  const positionKeys = Object.keys(candidatesByPosition);
  // Set default active position once positions are known
  const resolvedActive = activePosition && positionKeys.includes(activePosition) ? activePosition : positionKeys[0] || '';

  if (!isController) { navigate('/controller-login'); return null; }

  const handleToggle = (studentId: string, studentName: string, currentlyMarked: boolean, votedOnline: boolean) => {
    if (votedOnline) {
      toast({ title: 'Cannot Mark', description: 'This student has already voted online.', variant: 'destructive' });
      return;
    }
    setConfirmAction({ studentId, studentName, action: currentlyMarked ? 'unmark' : 'mark' });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.action === 'mark') {
      markOfflineVote(confirmAction.studentId, 'Controller');
      toast({ title: 'Marked', description: `${confirmAction.studentName} marked as voted offline.` });
    } else {
      unmarkOfflineVote(confirmAction.studentId);
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
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" /> Home
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-destructive">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>

        <div className="mt-8">
          <h2 className="font-display text-3xl font-bold text-foreground">Controller Dashboard</h2>
          <p className="mt-2 text-muted-foreground">Track and mark offline votes</p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <Users className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <Globe className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.online}</p>
            <p className="text-sm text-muted-foreground">Voted Online</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{stats.offline}</p>
            <p className="text-sm text-muted-foreground">Voted Offline</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
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
        <div className="mt-6 rounded-2xl bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
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
                <TableRow key={record.studentId}>
                  <TableCell className="text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{record.studentName}</p>
                      <p className="text-xs text-muted-foreground">{record.studentId}</p>
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
                        onClick={() => handleToggle(record.studentId, record.studentName, record.markedOffline, record.votedOnline)}
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

        {/* Offline Ballot Votes — Tabbed by Position */}
        <div className="mt-10">
          <h3 className="font-display text-xl font-bold text-foreground mb-1">Offline Ballot Votes</h3>
          <p className="text-sm text-muted-foreground mb-5">Enter offline ballot votes per candidate. Switch between position categories using the tabs below.</p>

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
                      <img src={candidate.image} alt={candidate.name} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.department}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Online votes so far: <span className="font-bold text-primary">{candidate.votes}</span></div>
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

              {/* NOTA Card */}
              {(() => {
                const notaId = `nota-offline-${resolvedActive}`;
                const submitted = submittedCandidates.has(notaId);
                return (
                  <div className="rounded-2xl bg-card shadow-card p-5 flex flex-col gap-3 border-2 border-dashed border-muted-foreground/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30 text-xl">✗</div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">NOTA</p>
                        <p className="text-xs text-destructive font-medium">None Of The Above</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Offline NOTA ballots for <span className="font-semibold">{resolvedActive}</span></div>
                    {submitted ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground bg-accent/20 rounded-xl px-4 py-2">
                        <CheckCircle2 className="h-4 w-4" /> NOTA submitted!
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="No. of NOTA votes"
                          value={offlineInput[notaId] || ''}
                          onChange={(e) => setOfflineInput(prev => ({ ...prev, [notaId]: e.target.value }))}
                          className="flex-1 text-sm"
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
                            setOfflineConfirm({ id: notaId, name: `NOTA (${resolvedActive})`, count, isNota: true });
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                );
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
              onClick={() => {
                if (!offlineConfirm) return;
                if (!offlineConfirm.isNota) {
                  addOfflineVotesForCandidate(offlineConfirm.id, offlineConfirm.count);
                }
                setSubmittedCandidates(prev => new Set([...prev, offlineConfirm.id]));
                toast({ title: 'Votes Recorded', description: `${offlineConfirm.count} offline vote(s) recorded for ${offlineConfirm.name}.` });
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
