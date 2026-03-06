import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, Plus, Trash2, Users, Vote, BarChart3, Power, PowerOff, FileCheck, FileX, Eye, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Position, POSITIONS } from '@/types/voting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    isAdmin, setIsAdmin, votingActive, setVotingActive,
    nominations, updateNominationStatus,
    registeredStudents, addStudent, removeStudent,
  } = useVoting();

  const [newCandidate, setNewCandidate] = useState({ name: '', position: '' as Position | '', image: '', department: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ studentId: '', name: '', department: '' });
  const [activeTab, setActiveTab] = useState('candidates');

  if (!isAdmin) { navigate('/admin-login'); return null; }

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const handleAddCandidate = () => {
    if (!newCandidate.name || !newCandidate.department || !newCandidate.position) {
      toast({ title: 'Missing Fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    addCandidate({
      ...newCandidate,
      position: newCandidate.position as Position,
      image: newCandidate.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newCandidate.name}`,
    });
    toast({ title: 'Candidate Added', description: `${newCandidate.name} has been added.` });
    setNewCandidate({ name: '', position: '', image: '', department: '' });
    setDialogOpen(false);
  };

  const handleRemoveCandidate = (id: string, name: string) => {
    removeCandidate(id);
    toast({ title: 'Candidate Removed', description: `${name} has been removed.` });
  };

  const handleAddStudent = () => {
    if (!newStudent.studentId || !newStudent.name || !newStudent.department) {
      toast({ title: 'Missing Fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (registeredStudents.some(s => s.studentId === newStudent.studentId)) {
      toast({ title: 'Already Exists', description: 'This student ID is already registered.', variant: 'destructive' });
      return;
    }
    addStudent(newStudent);
    toast({ title: 'Student Added', description: `${newStudent.name} has been added to the voter list.` });
    setNewStudent({ studentId: '', name: '', department: '' });
    setStudentDialogOpen(false);
  };

  const handleRemoveStudent = (studentId: string, name: string) => {
    removeStudent(studentId);
    toast({ title: 'Student Removed', description: `${name} has been removed from the voter list.` });
  };

  const handleLogout = () => { setIsAdmin(false); navigate('/'); };

  const toggleVoting = () => {
    setVotingActive(!votingActive);
    toast({ title: votingActive ? 'Voting Stopped' : 'Voting Started', description: votingActive ? 'The election has been paused.' : 'Students can now cast their votes.' });
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
          <div className={`rounded-2xl p-5 shadow-card ${votingActive ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            {votingActive ? <Power className="h-6 w-6 text-primary" /> : <PowerOff className="h-6 w-6 text-destructive" />}
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{votingActive ? 'Active' : 'Paused'}</p>
            <p className="text-sm text-muted-foreground">Status</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button variant="hero" size="lg"><Plus className="mr-2 h-5 w-5" /> Add Candidate</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Candidate</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Candidate Name *" value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} />
                <Select value={newCandidate.position} onValueChange={v => setNewCandidate({ ...newCandidate, position: v as Position })}>
                  <SelectTrigger><SelectValue placeholder="Select Position *" /></SelectTrigger>
                  <SelectContent>{POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Department *" value={newCandidate.department} onChange={e => setNewCandidate({ ...newCandidate, department: e.target.value })} />
                <Input placeholder="Image URL (optional)" value={newCandidate.image} onChange={e => setNewCandidate({ ...newCandidate, image: e.target.value })} />
                <Button onClick={handleAddCandidate} variant="hero" className="w-full">Add Candidate</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={toggleVoting} variant={votingActive ? 'destructive' : 'default'} size="lg">
            {votingActive ? <><PowerOff className="mr-2 h-5 w-5" /> Stop Voting</> : <><Power className="mr-2 h-5 w-5" /> Start Voting</>}
          </Button>
          <Button onClick={() => navigate('/results')} variant="glass" size="lg"><BarChart3 className="mr-2 h-5 w-5" /> View Results</Button>
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
            {POSITIONS.map(position => {
              const positionCandidates = candidates.filter(c => c.position === position);
              return (
                <div key={position} className="mt-6">
                  <h3 className="mb-3 font-display text-lg font-semibold text-foreground">{position}</h3>
                  <div className="space-y-3">
                    {positionCandidates.map(candidate => (
                      <div key={candidate.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
                        <img src={candidate.image} alt={candidate.name} className="h-16 w-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.department}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-5 w-5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Candidate?</AlertDialogTitle>
                              <AlertDialogDescription>Remove {candidate.name}? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveCandidate(candidate.id, candidate.name)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                    {positionCandidates.length === 0 && (
                      <p className="text-sm text-muted-foreground py-4">No candidates for {position} yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="students">
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">Only registered students can vote in the election.</p>
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
                      <Button onClick={handleAddStudent} variant="hero" className="w-full">Add Student</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-2xl bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Vote Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registeredStudents.map(student => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium text-foreground">{student.studentId}</TableCell>
                        <TableCell className="text-foreground">{student.name}</TableCell>
                        <TableCell className="text-muted-foreground">{student.department}</TableCell>
                        <TableCell>
                          {votedUsers.includes(student.studentId) ? (
                            <Badge variant="default">Voted</Badge>
                          ) : (
                            <Badge variant="secondary">Not Voted</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                                <AlertDialogDescription>Remove {student.name} from the voter list? They will no longer be able to vote.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveStudent(student.studentId, student.name)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {registeredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No students registered yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nominations">
            <div className="mt-4 space-y-4">
              {nominations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No nominations submitted yet.</p>
              ) : (
                nominations.map(nom => (
                  <div key={nom.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card">
                    <img src={nom.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nom.name}`} alt={nom.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{nom.name}</p>
                        <Badge variant={nom.status === 'approved' ? 'default' : nom.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {nom.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{nom.position} • {nom.department}</p>
                      <p className="text-xs text-muted-foreground">ID: {nom.studentId} • Submitted: {new Date(nom.submittedAt).toLocaleDateString()}</p>
                    </div>
                    {nom.documentName && (
                      <a href={nom.documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Eye className="h-3 w-3" /> {nom.documentName}
                      </a>
                    )}
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
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
