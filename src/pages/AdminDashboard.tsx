import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, LogOut, Trash2, Users, Vote, BarChart3, Power, PowerOff, FileCheck, FileX, Eye, UserPlus, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { POSITIONS } from '@/types/voting';
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
    isAdmin, setIsAdmin, votingActive, setVotingActive,
    nominations, updateNominationStatus,
    registeredStudents, addStudent, addStudentsBulk, removeStudent,
  } = useVoting();

  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ studentId: '', name: '', department: '', phone: '' });
  const [activeTab, setActiveTab] = useState('candidates');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

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
        toast({ title: 'No Data Found', description: 'CSV must have columns: StudentID, Name, Department', variant: 'destructive' });
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
            <p className="mt-4 mb-4 text-sm text-muted-foreground">Candidates are added automatically when nominations are approved.</p>
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

              <div className="rounded-2xl bg-card shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
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
                    {registeredStudents.map(student => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium text-foreground">{student.studentId}</TableCell>
                        <TableCell className="text-foreground">{student.name}</TableCell>
                        <TableCell className="text-muted-foreground">{student.department}</TableCell>
                        <TableCell className="text-muted-foreground">{student.phone}</TableCell>
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
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No students registered yet.</TableCell>
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
                  <div key={nom.id} className="rounded-2xl bg-card p-5 shadow-card space-y-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={nom.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nom.name}`}
                        alt={nom.name}
                        className="h-16 w-16 rounded-xl object-cover cursor-pointer ring-2 ring-border/30 hover:ring-primary/50 transition-all"
                        onClick={() => setViewingImage(nom.image)}
                      />
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
                      {nom.photoName && (
                        <button onClick={() => setViewingImage(nom.photoUrl)} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                          <Eye className="h-3 w-3" /> Photo Document
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
