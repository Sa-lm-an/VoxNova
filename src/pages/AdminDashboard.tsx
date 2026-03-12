import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, Trash2, Users, Vote, Power, PowerOff, FileCheck, FileX, Eye, UserPlus, Upload, ShieldCheck, Key, RefreshCw, Search, Filter, ArrowUpDown
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
    candidates, removeCandidate, votedUsers,
    isAdmin, setIsAdmin, electionPhase, setElectionPhase,
    controllerCredentials, setControllerCredentials,
    nominations, updateNominationStatus,
    registeredStudents, addStudent, addStudentsBulk, removeStudent,
  } = useVoting();

  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ studentId: '', name: '', department: '', phone: '' });
  const [activeTab, setActiveTab] = useState('candidates');
  const [activeCandidateCategory, setActiveCandidateCategory] = useState<string | null>('General');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Pagination & Filtering
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'studentId' | 'department'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const departments = useMemo(() => [...new Set(registeredStudents.map(r => r.department))], [registeredStudents]);

  const filteredStudents = useMemo(() => {
    let records = [...registeredStudents];

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(r => r.name.toLowerCase().includes(q) || r.studentId.toLowerCase().includes(q));
    }
    if (deptFilter !== 'all') records = records.filter(r => r.department === deptFilter);

    records.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'studentId') cmp = a.studentId.localeCompare(b.studentId);
      else if (sortBy === 'department') cmp = a.department.localeCompare(b.department);
      return sortAsc ? cmp : -cmp;
    });

    return records;
  }, [registeredStudents, search, deptFilter, sortBy, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const pagedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!isAdmin) { navigate('/admin-login'); return null; }

  const handleRemoveCandidate = (id: string, name: string) => {
    removeCandidate(id);
    toast({ title: 'Candidate Removed', description: `${name} has been removed.` });
  };

  const handleAddStudent = () => {
    if (!newStudent.studentId || !newStudent.name || !newStudent.department || !newStudent.phone) {
      toast({ title: 'Missing Fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (registeredStudents.some(s => s.studentId === newStudent.studentId)) {
      toast({ title: 'Already Exists', description: 'This student ID is already registered.', variant: 'destructive' });
      return;
    }
    addStudent(newStudent);
    toast({ title: 'Student Added', description: `${newStudent.name} has been added to the voter list.` });
    setNewStudent({ studentId: '', name: '', department: '', phone: '' });
    setStudentDialogOpen(false);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());

      // Skip header if it looks like one
      const startIndex = lines[0]?.toLowerCase().includes('studentid') || lines[0]?.toLowerCase().includes('student_id') || lines[0]?.toLowerCase().includes('name') ? 1 : 0;

      const students = [];
      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 4 && cols[0] && cols[1] && cols[2] && cols[3]) {
          students.push({ studentId: cols[0], name: cols[1], department: cols[2], phone: cols[3] });
        }
      }

      if (students.length === 0) {
        toast({ title: 'No Data Found', description: 'CSV must have columns: StudentID, Name, Department, Phone', variant: 'destructive' });
        return;
      }

      const { added, skipped } = addStudentsBulk(students);
      toast({
        title: 'CSV Import Complete',
        description: `${added} students added${skipped > 0 ? `, ${skipped} duplicates skipped` : ''}.`,
      });
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleRemoveStudent = (studentId: string, name: string) => {
    removeStudent(studentId);
    toast({ title: 'Student Removed', description: `${name} has been removed from the voter list.` });
  };

  const handleLogout = () => { setIsAdmin(false); navigate('/'); };

  const generateControllerCredentials = () => {
    const id = 'CTRL-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const pass = Math.random().toString(36).substring(2, 8) + '!@';
    setControllerCredentials({ id, pass });
    toast({ title: 'Credentials Generated', description: 'Controller ID and Password created successfully.' });
  };

  const handleNomination = (id: string, status: 'approved' | 'rejected') => {
    updateNominationStatus(id, status);
    toast({ title: status === 'approved' ? 'Nomination Approved' : 'Nomination Rejected', description: status === 'approved' ? 'Candidate has been added to the election.' : 'Nomination has been rejected.' });
  };

  const pendingNominations = nominations.filter(n => n.status === 'pending');

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
              <Button onClick={() => { setElectionPhase('nomination'); toast({ title: 'Phase Updated', description: 'System is now in Nomination Phase.' }); }} variant={electionPhase === 'nomination' ? 'default' : 'outline'} className="flex-1">
                1. Nomination
              </Button>
              <Button onClick={() => { setElectionPhase('voting'); toast({ title: 'Phase Updated', description: 'System is now in Voting Phase.' }); }} variant={electionPhase === 'voting' ? 'default' : 'outline'} className="flex-1">
                2. Voting
              </Button>
              <Button onClick={() => { setElectionPhase('results'); toast({ title: 'Phase Updated', description: 'System is now in Results Phase.' }); }} variant={electionPhase === 'results' ? 'default' : 'outline'} className="flex-1">
                3. Results
              </Button>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card border border-border/50">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> Controller Access</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate credentials for the offline election controllers. Share these securely.</p>
            {controllerCredentials ? (
              <div className="bg-muted/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Controller ID</p>
                  <p className="font-mono text-foreground font-semibold mb-2">{controllerCredentials.id}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Password</p>
                  <p className="font-mono text-foreground font-semibold">{controllerCredentials.pass}</p>
                </div>
                <Button variant="outline" size="icon" onClick={generateControllerCredentials} title="Regenerate">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={generateControllerCredentials} variant="hero" className="w-full h-full min-h-[88px]">
                Generate Controller Credentials
              </Button>
            )}
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
                                          <span className="text-xs font-medium text-[#38a09e]">🏳 {candidate.party}</span>
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
                        <Input placeholder="Student ID *" value={newStudent.studentId} onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })} />
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
                      <SelectItem value="studentId">ID</SelectItem>
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
                        <TableRow key={student.studentId} className="hover:bg-muted/30">
                          <TableCell className="font-medium text-foreground">{student.studentId}</TableCell>
                          <TableCell className="text-foreground">{student.name}</TableCell>
                          <TableCell className="text-muted-foreground">{student.department}</TableCell>
                          <TableCell className="text-muted-foreground">{student.phone}</TableCell>
                          <TableCell>
                            {votedUsers.includes(student.studentId) ? (
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
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleRemoveStudent(student.studentId, student.name)}>Remove</AlertDialogAction>
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
                nominations.map(nom => (
                  <div key={nom.id} className="rounded-2xl bg-card p-5 shadow-card space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl border border-primary/20 shrink-0">
                        {nom.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{nom.name}</p>
                          <Badge variant={nom.status === 'approved' ? 'default' : nom.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {nom.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{nom.position} • {nom.department}</p>
                        {nom.party && (
                          <p className="text-sm font-medium text-[#38a09e] mt-0.5">🏳 {nom.party}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">ID: {nom.studentId} • Submitted: {new Date(nom.submittedAt).toLocaleDateString()}</p>
                      </div>
                      {nom.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button variant="hero" size="sm" onClick={() => handleNomination(nom.id, 'approved')}>
                            <FileCheck className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleNomination(nom.id, 'rejected')}>
                            <FileX className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    {/* Documents section */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                      {nom.applicationFormName && (
                        <button onClick={() => setViewingImage(nom.applicationFormUrl)} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                          <Eye className="h-3 w-3" /> Application Form
                        </button>
                      )}
                      {nom.marklistName && (
                        <button onClick={() => setViewingImage(nom.marklistUrl)} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                          <Eye className="h-3 w-3" /> Marklist
                        </button>
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
