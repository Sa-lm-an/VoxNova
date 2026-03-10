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
  const { offlineRecords, markOfflineVote, unmarkOfflineVote, isController, setIsController, votedUsers } = useVoting();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'status'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ studentId: string; studentName: string; action: 'mark' | 'unmark' } | null>(null);

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
              {filteredRecords.map((record, index) => (
                <TableRow key={record.studentId}>
                  <TableCell className="text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {index + 1}
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No students found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
    </div>
  );
};

export default ControllerDashboard;
