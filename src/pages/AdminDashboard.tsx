import { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Trash2, Users, Vote, Power, PowerOff, FileCheck, FileX, Eye, UserPlus, Upload, ShieldCheck, Key, RefreshCw, Search, Filter, ArrowUpDown, FileText
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { POSITIONS, POSITION_CATEGORIES } from '@/types/voting';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    candidates, addCandidate, removeCandidate, votedUsers,
    isAdmin, setIsAdmin, electionPhase, setElectionPhase,
    controllerCredentials, setControllerCredentials,
    nominations, updateNominationStatus,
    registeredStudents, addStudent, addStudentsBulk, removeStudent, isLoading,
  } = useVoting();

  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ student_id: '', name: '', department: '', phone: '' });
  const [activeTab, setActiveTab] = useState('candidates');
  const [activeCandidateCategory, setActiveCandidateCategory] = useState<string | null>('General');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'student_id' | 'department'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const departments = useMemo(() => [...new Set(registeredStudents.map(r => r.department))], [registeredStudents]);

  const filteredStudents = useMemo(() => {
    let records = [...registeredStudents];

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r => r.name.toLowerCase().includes(q) || r.student_id.toLowerCase().includes(q));
    }
    if (deptFilter !== 'all') records = records.filter(r => r.department === deptFilter);

    records.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'student_id') cmp = a.student_id.localeCompare(b.student_id);
      else if (sortBy === 'department') cmp = a.department.localeCompare(b.department);
      return sortAsc ? cmp : -cmp;
    });

    return records;
  }, [registeredStudents, search, deptFilter, sortBy, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      navigate('/admin-login');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#112250]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E0C58F] border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleRemoveCandidate = async (id: string, name: string) => {
    await removeCandidate(id);
    toast({ title: 'Candidate Removed', description: `${name} has been removed.` });
  };

  const handleAddStudent = async () => {
    if (!newStudent.student_id || !newStudent.name || !newStudent.department || !newStudent.phone) {
      toast({ title: 'Missing Fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (registeredStudents.some(s => s.student_id === newStudent.student_id)) {
      toast({ title: 'Already Exists', description: 'This student ID is already registered.', variant: 'destructive' });
      return;
    }
    await addStudent(newStudent);
    toast({ title: 'Student Added', description: `${newStudent.name} has been added to the voter list.` });
    setNewStudent({ student_id: '', name: '', department: '', phone: '' });
    setStudentDialogOpen(false);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());

      // Skip header if it looks like one
      const startIndex = lines[0]?.toLowerCase().includes('student_id') || lines[0]?.toLowerCase().includes('name') ? 1 : 0;

      const students = [];
      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 4 && cols[0] && cols[1] && cols[2] && cols[3]) {
          students.push({ student_id: cols[0], name: cols[1], department: cols[2], phone: cols[3] });
        }
      }

      if (students.length === 0) {
        toast({ title: 'No Data Found', description: 'CSV must have columns: StudentID, Name, Department, Phone', variant: 'destructive' });
        return;
      }

      const { added, skipped } = await addStudentsBulk(students);
      toast({
        title: 'CSV Import Complete',
        description: `${added} students added${skipped > 0 ? `, ${skipped} duplicates skipped` : ''}.`,
      });
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleRemoveStudent = async (studentId: string, name: string) => {
    await removeStudent(studentId);
    toast({ title: 'Student Removed', description: `${name} has been removed from the voter list.` });
  };

  const handleLogout = () => { setIsAdmin(false); navigate('/'); };

  const generateControllerCredentials = () => {
    const id = 'CTRL-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const pass = Math.random().toString(36).substring(2, 8) + '!@';
    setControllerCredentials({ id, pass });
    toast({ title: 'Credentials Generated', description: 'Controller ID and Password created successfully.' });
  };

  const handleNomination = async (id: string, status: 'approved' | 'rejected') => {
    await updateNominationStatus(id, status);
    toast({ title: status === 'approved' ? 'Nomination Approved' : 'Nomination Rejected', description: status === 'approved' ? 'Candidate has been added to the election.' : 'Nomination has been rejected.' });
  };

  const pendingNominations = nominations.filter(n => n.status === 'pending');

  return (
    <div className="min-h-screen gradient-hero pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <span className="font-medium">Admin Panel</span>
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
          <h2 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="mt-2 text-muted-foreground">Manage candidates, students, nominations & elections</p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-card p-5 shadow-card"><Users className="h-6 w-6 text-primary" /><p className="mt-2 font-display text-2xl font-bold text-foreground">{candidates.length}</p><p className="text-sm text-muted-foreground">Candidates</p></div>
          <div className="rounded-2xl bg-card p-5 shadow-card"><UserPlus className="h-6 w-6 text-primary" /><p className="mt-2 font-display text-2xl font-bold text-foreground">{registeredStudents.length}</p><p className="text-sm text-muted-foreground">Registered Students</p></div>
          <div className="rounded-2xl bg-card p-5 shadow-card"><Vote className="h-6 w-6 text-primary" /><p className="mt-2 font-display text-2xl font-bold text-foreground">{votedUsers.length}</p><p className="text-sm text-muted-foreground">Voters</p></div>
          <div className="rounded-2xl bg-primary/10 p-5 shadow-card">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold text-foreground capitalize">{electionPhase}</p>
            <p className="text-sm text-muted-foreground">Current Phase</p>
          </div>
        </div>

        {/* Phase Controls & Controller Auth */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/50">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Power className="h-5 w-5 text-primary" /> Election Phase Control</h3>
            <p className="text-sm text-muted-foreground mb-6">Changing the phase automatically restricts access to other areas of the system.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setElectionPhase('nomination')}
                variant={electionPhase === 'nomination' ? 'default' : 'outline'}
                className={`flex-1 h-12 rounded-xl font-bold transition-all ${electionPhase === 'nomination' ? 'shadow-glow bg-[#112250] text-[#E0C58F] border-2 border-[#E0C58F]' : 'hover:border-[#1E4AA8]/50 text-muted-foreground'}`}
              >
                1. Nomination
              </Button>
              <Button
                onClick={async () => {
                  const csCandidates = candidates.filter(c => c.department.toLowerCase() === 'computer science' || c.department.toUpperCase() === 'CS');
                  const bbaCandidates = candidates.filter(c => c.department.toUpperCase() === 'BBA');
                  const bcomCandidates = candidates.filter(c => c.department.toUpperCase() === 'BCOM');

                  const missingCS = 2 - csCandidates.length;
                  const missingBBA = 1 - bbaCandidates.length;
                  const missingBCom = 2 - bcomCandidates.length;

                  if (missingCS > 0 || missingBBA > 0 || missingBCom > 0) {
                    if (missingCS > 0) {
                      for (let i = 1; i <= missingCS; i++) {
                        await addCandidate({
                          name: `CS Candidate ${csCandidates.length + i}`,
                          position: 'Department Representative',
                          department: 'CS',
                          party: 'Independent',
                          online_votes: 0,
                          offline_votes: 0
                        });
                      }
                    }
                    if (missingBBA > 0) {
                      for (let i = 1; i <= missingBBA; i++) {
                        await addCandidate({
                          name: `BBA Candidate ${bbaCandidates.length + i}`,
                          position: 'Department Representative',
                          department: 'BBA',
                          party: 'Independent',
                          online_votes: 0,
                          offline_votes: 0
                        });
                      }
                    }
                    if (missingBCom > 0) {
                      for (let i = 1; i <= missingBCom; i++) {
                        await addCandidate({
                          name: `BCom Candidate ${bcomCandidates.length + i}`,
                          position: 'Department Representative',
                          department: 'BCOM',
                          party: 'Independent',
                          online_votes: 0,
                          offline_votes: 0
                        });
                      }
                    }
                    toast({
                      title: 'Candidates Added',
                      description: 'Missing candidates were added automatically to meet department quotas.'
                    });
                  }

                  await setElectionPhase('voting');
                }}
                variant={electionPhase === 'voting' ? 'default' : 'outline'}
                className={`flex-1 h-12 rounded-xl font-bold transition-all ${electionPhase === 'voting' ? 'shadow-glow bg-[#112250] text-[#E0C58F] border-2 border-[#E0C58F]' : 'hover:border-[#1E4AA8]/50 text-muted-foreground'}`}
              >
                2. Voting
              </Button>
              <Button
                onClick={() => setElectionPhase('results')}
                variant={electionPhase === 'results' ? 'default' : 'outline'}
                className={`flex-1 h-12 rounded-xl font-bold transition-all ${electionPhase === 'results' ? 'shadow-glow bg-[#E0C58F] text-[#112250] border-2 border-[#112250]' : 'hover:border-[#1E4AA8]/50 text-muted-foreground'}`}
              >
                3. Results
              </Button>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/50">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> Controller Access</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate credentials for the offline election controllers. Share these securely.</p>
            <div className="flex-1">
              {controllerCredentials ? (
                <div className="bg-muted/30 border border-border/40 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-muted/50">
                  <div className="min-w-0 flex-1 flex gap-6">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Controller ID</p>
                      <p className="font-mono text-sm text-foreground font-bold tracking-tight">{controllerCredentials.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Password</p>
                      <p className="font-mono text-sm text-foreground font-bold tracking-tight">{controllerCredentials.pass}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={generateControllerCredentials} title="Regenerate" className="shrink-0 h-10 w-10 hover:bg-primary/10 hover:text-primary rounded-xl transition-all active:rotate-180 duration-500">
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button onClick={generateControllerCredentials} variant="hero" className="w-full h-full min-h-[100px] shadow-glow-sm text-lg font-bold">
                  Generate Controller Credentials
                  <Key className="ml-3 h-5 w-5 animate-pulse" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="students">
              Students
              <Badge variant="secondary" className="ml-2 text-xs">{registeredStudents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="nominations" className="relative">
              Nominations
              {pendingNominations.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">{pendingNominations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <p className="mt-4 mb-4 text-sm text-muted-foreground">Candidates are added automatically when nominations are approved.</p>
            {Object.entries(POSITION_CATEGORIES).map(([category, categoryPositions]) => {
              const isOpen = activeCandidateCategory === category;
              const totalInCategory = candidates.filter(c => categoryPositions.includes(c.position)).length;
              return (
                <div key={category} className="mb-4 rounded-2xl border border-border/40 overflow-hidden">
                  {/* Accordion Header */}
                  <button
                    onClick={() => setActiveCandidateCategory(isOpen ? null : category)}
                    className={`w-full flex items-center justify-between px-6 py-4 transition-all ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted/50 text-foreground'}`}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-xl font-bold">{category} Council</h2>
                      <Badge variant={isOpen ? 'secondary' : 'secondary'} className={`text-xs ${isOpen ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                        {totalInCategory} candidates
                      </Badge>
                    </div>
                    <span className={`text-xl font-bold transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="p-4 space-y-8 border-t border-border/30 bg-card/50">
                      {categoryPositions.map(position => {
                        const positionCandidates = candidates.filter(c => c.position === position);
                        return (
                          <div key={position} className="mt-2">
                            <h3 className="mb-3 font-display text-lg font-semibold text-foreground border-b border-border/30 pb-2">{position}</h3>
                            <div className="space-y-3">
                              {positionCandidates.map(candidate => (
                                <div key={candidate.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card hover:shadow-elevated transition-shadow">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground truncate">{candidate.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground">{candidate.department}</span>
                                      {candidate.party && (
                                        <>
                                          <span className="text-muted-foreground/30">•</span>
                                          <span className="text-xs font-bold text-[#1E4AA8]">🏳 {candidate.party}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-5 w-5" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Candidate?</AlertDialogTitle>
                                        <AlertDialogDescription>Remove {candidate.name} from the {position} election? This cannot be undone.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleRemoveCandidate(candidate.id, candidate.name)}>Remove</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              ))}
                              {positionCandidates.length === 0 && (
                                <div className="bg-muted/30 rounded-xl p-4 text-center border border-dashed border-border/50">
                                  <p className="text-sm text-muted-foreground">No candidates for {position} yet.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="students">
            <div className="mt-4">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <p className="text-muted-foreground">Only registered students can vote in the election.</p>
                <div className="flex gap-2">
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvImport}
                  />
                  <Button variant="glass" size="sm" onClick={() => csvInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Import CSV
                  </Button>
                  <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="hero" size="sm"><UserPlus className="mr-2 h-4 w-4" /> Add Student</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Student to Voter List</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Input placeholder="Student ID *" value={newStudent.student_id} onChange={e => setNewStudent({ ...newStudent, student_id: e.target.value })} />
                        <Input placeholder="Full Name *" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                        <Input placeholder="Department *" value={newStudent.department} onChange={e => setNewStudent({ ...newStudent, department: e.target.value })} />
                        <Input placeholder="Phone Number *" value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} />
                        <Button onClick={handleAddStudent} variant="hero" className="w-full">Add Student</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="rounded-xl bg-card/60 border border-border/40 p-4 mb-4">
                <p className="text-xs text-muted-foreground">
                  <strong>CSV Format:</strong> StudentID, Name, Department, Phone (one per row). Header row is optional.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Example: <code className="bg-muted px-1 rounded">STU009,John Doe,Computer Science,9876543210</code>
                </p>
              </div>

              {/* Filtering & Sorting Controls */}
              <div className="mb-6 grid gap-4 rounded-xl bg-card/50 p-4 md:grid-cols-4 border border-border/40">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    className="pl-9 bg-background"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  />
                </div>

                <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="bg-background">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="bg-background flex-1">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="student_id">ID</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="bg-background shrink-0" onClick={() => setSortAsc(!sortAsc)} title={sortAsc ? 'Ascending' : 'Descending'}>
                    <ArrowUpDown className={`h-4 w-4 transition-transform ${sortAsc ? '' : 'rotate-180'}`} />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-card shadow-card overflow-hidden border border-border/40">
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  <Table className="relative">
                    <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10 shadow-sm">
                      <TableRow>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Vote Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedStudents.map(student => (
                        <TableRow key={student.student_id} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-foreground">{student.student_id}</TableCell>
                          <TableCell className="text-foreground">{student.name}</TableCell>
                          <TableCell className="text-muted-foreground">{student.department}</TableCell>
                          <TableCell className="text-muted-foreground">{student.phone}</TableCell>
                          <TableCell>
                            {votedUsers.includes(student.student_id) ? (
                              <Badge variant="default" className="bg-primary/90">Voted</Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground">Not Voted</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                                  <AlertDialogDescription>Remove {student.name} from the voter list? They will no longer be able to vote.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleRemoveStudent(student.student_id, student.name)}>Remove</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {pagedStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students found matching your criteria.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between px-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Showing <span className="font-medium text-foreground">{(currentPage - 1) * PAGE_SIZE + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * PAGE_SIZE, filteredStudents.length)}</span> of <span className="font-medium text-foreground">{filteredStudents.length}</span> students
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <div className="flex items-center justify-center min-w-[32px] text-sm font-medium">
                      {currentPage} / {totalPages}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="nominations">
            <div className="mt-4 space-y-4">
              {nominations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No nominations submitted yet.</p>
              ) : (
                nominations.map(nomination => (
                  <div key={nomination.id} className="rounded-2xl bg-card p-5 shadow-card space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl border border-primary/20 shrink-0">
                        {nomination.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{nomination.name}</p>
                          <Badge variant={nomination.status === 'approved' ? 'default' : nomination.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {nomination.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{nomination.position} • {nomination.department}</p>
                        {nomination.party && (
                          <p className="text-sm font-bold text-[#1E4AA8] mt-0.5">🏳 {nomination.party}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">ID: {nomination.student_id} • Submitted: {new Date(nomination.submitted_at).toLocaleDateString()}</p>
                      </div>
                      {nomination.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button variant="hero" size="sm" onClick={() => handleNomination(nomination.id, 'approved')}>
                            <FileCheck className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleNomination(nomination.id, 'rejected')}>
                            <FileX className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                      {nomination.application_form_url && (
                        <a
                          href={nomination.application_form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <FileText className="h-3 w-3" /> Application Form
                        </a>
                      )}
                      {nomination.marklist_url && (
                        <a
                          href={nomination.marklist_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <FileText className="h-3 w-3" /> Marklist
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enlarged Image/Document Viewer */}
      <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-2">
          <DialogHeader><DialogTitle>Document Preview</DialogTitle></DialogHeader>
          {viewingImage && (
            viewingImage.startsWith('data:application/pdf') ? (
              <iframe src={viewingImage} className="w-full h-[75vh] rounded-lg" title="Document" />
            ) : (
              <img src={viewingImage} alt="Enlarged preview" className="w-full h-auto max-h-[75vh] object-contain rounded-lg" />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
