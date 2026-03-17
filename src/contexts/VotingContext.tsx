import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Candidate, User, Nomination, OfflineVoteRecord, Position, POSITIONS, RegisteredStudent, ElectionPhase } from '@/types/voting';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface VotingContextType {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votes'>) => void;
  removeCandidate: (id: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  votedUsers: string[];
  castVote: (votes: Record<Position, string>) => Promise<boolean>;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isController: boolean;
  setIsController: (value: boolean) => void;
  electionPhase: ElectionPhase;
  setElectionPhase: (phase: ElectionPhase) => void;
  controllerCredentials: { id: string; pass: string } | null;
  setControllerCredentials: (creds: { id: string; pass: string } | null) => void;
  nominations: Nomination[];
  addNomination: (nomination: Omit<Nomination, 'id' | 'status' | 'submittedAt'>) => void;
  updateNominationStatus: (id: string, status: 'approved' | 'rejected') => void;
  offlineRecords: OfflineVoteRecord[];
  markOfflineVote: (student_id: string, controllerName: string) => void;
  unmarkOfflineVote: (student_id: string) => void;
  addOfflineVotesForCandidate: (candidateId: string, count: number) => void;
  registeredStudents: RegisteredStudent[];
  addStudent: (student: RegisteredStudent) => void;
  addStudentsBulk: (students: RegisteredStudent[]) => Promise<{ added: number; skipped: number }>;
  removeStudent: (student_id: string) => void;
  isStudentRegistered: (student_id: string) => boolean;
  isLoading: boolean;
  notaVotes: Record<string, number>;
  addOfflineNota: (position: string, count: number, department?: string) => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('voxnova_user') : null;
    return saved ? JSON.parse(saved) : null;
  });
  const [votedUsers, setVotedUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('voxnova_admin') === 'true' : false));
  const [isController, setIsController] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('voxnova_controller') === 'true' : false));
  const [electionPhase, setElectionPhase] = useState<ElectionPhase>('nomination');
  const [controllerCredentials, setControllerCredentials] = useState<{ id: string; pass: string } | null>(null);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [offlineRecords, setOfflineRecords] = useState<OfflineVoteRecord[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notaVotes, setNotaVotes] = useState<Record<string, number>>({});

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch candidates
        const { data: candidatesData } = await supabase.from('candidates').select('*');
        if (candidatesData) {
          setCandidates(candidatesData.map(c => ({
            id: c.id,
            name: c.name,
            position: c.position as Position,
            online_votes: c.online_votes || 0,
            offline_votes: c.offline_votes || 0,
            votes: c.votes || 0,
            department: c.department,
            party: c.party || ''
          })));
        }

        // Fetch nominations
        const { data: nominationsData } = await supabase.from('nominations').select('*');
        if (nominationsData) {
          setNominations(nominationsData.map(n => ({
            id: n.id,
            student_id: n.student_id,
            name: n.name,
            position: n.position as Position,
            department: n.department,
            party: n.party || '',
            application_form_url: n.application_form_url || '',
            marklist_url: n.marklist_url || '',
            status: n.status as any,
            submitted_at: n.submitted_at
          })));
        }

        // Fetch registered students
        const { data: studentsData } = await supabase.from('registered_students').select('*');
        if (studentsData) {
          setRegisteredStudents(studentsData.map(s => ({
            student_id: s.student_id,
            name: s.name,
            department: s.department,
            phone: s.phone
          })));
        }

        // Fetch voted users
        const { data: votedData } = await supabase.from('voted_users').select('student_id');
        if (votedData) setVotedUsers(votedData.map(v => v.student_id));

        // Fetch offline records
        const { data: offlineData } = await supabase.from('offline_records').select('*');
        if (offlineData) {
          setOfflineRecords(offlineData.map(o => ({
            student_id: o.student_id,
            votedOnline: o.voted_online,
            markedOffline: o.marked_offline,
            markedAt: o.marked_at,
            markedBy: o.marked_by,
            studentName: studentsData?.find(s => s.student_id === o.student_id)?.name || '',
            department: studentsData?.find(s => s.student_id === o.student_id)?.department || '',
            phone: studentsData?.find(s => s.student_id === o.student_id)?.phone || ''
          })));
        }

        // Fetch election phase
        const { data: configData } = await supabase.from('election_config').select('*');
        if (configData) {
          const phase = configData.find(c => c.key === 'election_phase')?.value as ElectionPhase;
          if (phase) setElectionPhase(phase);

          const nota: Record<string, number> = {};
          configData.filter(c => c.key.startsWith('nota_')).forEach(c => {
            const pos = c.key.replace('nota_', '');
            nota[pos] = parseInt(c.value, 10) || 0;
          });
          setNotaVotes(nota);
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up Real-time Subscriptions
    const candidatesSub = supabase.channel('candidates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const c = payload.new;
          setCandidates(prev => [...prev, {
            id: c.id, name: c.name, position: c.position as any,
            online_votes: c.online_votes || 0,
            offline_votes: c.offline_votes || 0,
            votes: c.votes || 0, department: c.department, party: c.party
          }]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new;
          setCandidates(prev => prev.map(c => c.id === updated.id ? {
            ...c, votes: updated.votes,
            online_votes: updated.online_votes,
            offline_votes: updated.offline_votes,
            name: updated.name, position: updated.position,
            department: updated.department, party: updated.party
          } : c));
        } else if (payload.eventType === 'DELETE') {
          setCandidates(prev => prev.filter(c => c.id !== payload.old.id));
        }
      }).subscribe();

    const nominationsSub = supabase.channel('nominations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nominations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const n = payload.new;
          setNominations(prev => [...prev, {
            id: n.id, student_id: n.student_id, name: n.name, position: n.position,
            department: n.department, party: n.party,
            application_form_url: n.application_form_url, marklist_url: n.marklist_url,
            status: n.status, submitted_at: n.submitted_at
          }]);
        } else if (payload.eventType === 'UPDATE') {
          const n = payload.new;
          setNominations(prev => prev.map(item => item.id === n.id ? {
            ...item, status: n.status, application_form_url: n.application_form_url, marklist_url: n.marklist_url
          } : item));
        }
      }).subscribe();

    const phaseSub = supabase.channel('config_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'election_config', filter: 'key=eq.election_phase' }, (payload) => {
        setElectionPhase(payload.new.value as ElectionPhase);
      }).subscribe();

    // Initial loading of controller creds
    const savedControllerCreds = localStorage.getItem('voxnova_controller_creds');
    if (savedControllerCreds) {
      try {
        setControllerCredentials(JSON.parse(savedControllerCreds));
      } catch (e) {
        console.error('Failed to parse controller creds', e);
      }
    }

    return () => {
      supabase.removeChannel(candidatesSub);
      supabase.removeChannel(nominationsSub);
      supabase.removeChannel(phaseSub);
    };
  }, []);

  const addCandidate = async (candidate: Omit<Candidate, 'id' | 'votes'>) => {
    try {
      const { data, error } = await supabase.from('candidates').insert([{
        name: candidate.name,
        position: candidate.position,
        department: candidate.department,
        party: candidate.party,
        votes: 0
      }]).select();
      if (error) throw error;
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast({ title: 'Error', description: 'Failed to add candidate.', variant: 'destructive' });
    }
  };

  const removeCandidate = async (id: string) => {
    try {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast({ title: 'Error', description: 'Failed to remove candidate.', variant: 'destructive' });
    }
  };

  const castVote = async (votes: Record<Position, string>): Promise<boolean> => {
    if (!currentUser || votedUsers.includes(currentUser.student_id)) return false;

    // Prevent online vote if already marked offline
    const { data: record, error: recordError } = await supabase
      .from('offline_records')
      .select('marked_offline')
      .eq('student_id', currentUser.student_id)
      .single();

    if (recordError || record?.marked_offline) return false;

    try {
      // 1. Mark as voted online
      const { error: votedError } = await supabase.from('voted_users').insert([{ student_id: currentUser.student_id }]);
      if (votedError) throw votedError;

      // 2. Update offline_records
      await supabase.from('offline_records').update({ voted_online: true }).eq('student_id', currentUser.student_id);

      // 3. Increment votes for each selected candidate or NOTA
      for (const pos in votes) {
        const voteId = votes[pos as Position];
        if (voteId.startsWith('nota-')) {
          // Format: nota-Position-Department (if position is Dept Rep)
          const parts = voteId.split('-');
          const position = parts[1];
          const dept = parts[2];

          const notaKey = dept ? `${position}_${dept}` : position;
          const currentCount = notaVotes[notaKey] || 0;
          const newCount = currentCount + 1;

          await supabase.from('election_config').upsert({
            key: `nota_${notaKey}`,
            value: newCount.toString()
          });

          setNotaVotes(prev => ({ ...prev, [notaKey]: newCount }));
        } else {
          const candidateId = voteId;
          const currentCandidate = candidates.find(c => c.id === candidateId);
          if (currentCandidate) {
            await supabase.from('candidates').update({
              online_votes: (currentCandidate.online_votes || 0) + 1,
              votes: (currentCandidate.votes || 0) + 1
            }).eq('id', candidateId);
          }
        }
      }

      setVotedUsers(prev => [...prev, currentUser.student_id]);
      const updatedUser = { ...currentUser, hasVoted: true };
      setCurrentUser(updatedUser);
      localStorage.setItem('voxnova_user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({ title: 'Error', description: 'Failed to cast vote.', variant: 'destructive' });
      return false;
    }
  };

  const addNomination = async (nomination: Omit<Nomination, 'id' | 'status' | 'submitted_at'>) => {
    try {
      const { error } = await supabase.from('nominations').insert([{
        student_id: nomination.student_id,
        name: nomination.name,
        position: nomination.position,
        department: nomination.department,
        party: nomination.party,
        application_form_url: nomination.application_form_url,
        marklist_url: nomination.marklist_url,
        status: 'pending'
      }]);
      if (error) throw error;
      // Removed toast as per user request to avoid "pop up"
    } catch (error) {
      console.error('Error adding nomination:', error);
      toast({ title: 'Error', description: 'Failed to submit nomination.', variant: 'destructive' });
    }
  };

  const updateNominationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase.from('nominations').update({ status }).eq('id', id);
      if (error) throw error;

      if (status === 'approved') {
        const nom = nominations.find(n => n.id === id);
        if (nom) {
          await addCandidate({
            name: nom.name,
            position: nom.position,
            department: nom.department,
            party: nom.party,
            online_votes: 0,
            offline_votes: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error updating nomination:', error);
    }
  };

  const markOfflineVote = async (studentId: string, controllerName: string) => {
    try {
      // Prevent offline mark if already voted online
      const { data: record, error: recordError } = await supabase
        .from('offline_records')
        .select('voted_online')
        .eq('student_id', studentId)
        .single();

      if (recordError || record?.voted_online) return;

      const { error } = await supabase.from('offline_records').update({
        marked_offline: true,
        marked_at: new Date().toISOString(),
        marked_by: controllerName
      }).eq('student_id', studentId);

      if (error) throw error;

      setOfflineRecords(prev => prev.map(r => r.student_id === studentId ? {
        ...r, markedOffline: true, markedAt: new Date().toISOString(), markedBy: controllerName
      } : r));
    } catch (error) {
      console.error('Error marking offline vote:', error);
    }
  };

  const unmarkOfflineVote = async (studentId: string) => {
    try {
      const { error } = await supabase.from('offline_records').update({
        marked_offline: false,
        marked_at: null,
        marked_by: null
      }).eq('student_id', studentId);

      if (error) throw error;

      setOfflineRecords(prev => prev.map(r => r.student_id === studentId ? {
        ...r, markedOffline: false, markedAt: undefined, markedBy: undefined
      } : r));
    } catch (error) {
      console.error('Error unmarking offline vote:', error);
    }
  };

  const addOfflineVotesForCandidate = async (candidateId: string, count: number) => {
    if (count <= 0) return;
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate) {
        const { error } = await supabase.from('candidates').update({
          offline_votes: (candidate.offline_votes || 0) + count,
          votes: (candidate.votes || 0) + count
        }).eq('id', candidateId);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding offline votes:', error);
    }
  };

  const addOfflineNota = async (position: string, count: number, department?: string) => {
    if (count <= 0) return;
    try {
      const notaKey = department ? `${position}_${department}` : position;
      const currentCount = notaVotes[notaKey] || 0;
      const newCount = currentCount + count;

      const { error } = await supabase.from('election_config').upsert({
        key: `nota_${notaKey}`,
        value: newCount.toString()
      });

      if (error) throw error;
      setNotaVotes(prev => ({ ...prev, [notaKey]: newCount }));
    } catch (error) {
      console.error('Error adding offline NOTA:', error);
    }
  };

  const addStudent = async (student: RegisteredStudent) => {
    try {
      const { error: stuError } = await supabase.from('registered_students').insert([student]);
      if (stuError) throw stuError;

      const { error: offError } = await supabase.from('offline_records').insert([{
        student_id: student.student_id,
        voted_online: false,
        marked_offline: false
      }]);
      if (offError) throw offError;

      setRegisteredStudents(prev => [...prev, student]);
      setOfflineRecords(prev => [...prev, {
        student_id: student.student_id,
        studentName: student.name,
        department: student.department,
        phone: student.phone,
        votedOnline: false,
        markedOffline: false,
      }]);
    } catch (error) {
      console.error('Error adding student:', error);
      toast({ title: 'Error', description: 'Failed to add student. ID might already exist.', variant: 'destructive' });
    }
  };

  const addStudentsBulk = async (students: RegisteredStudent[]): Promise<{ added: number; skipped: number }> => {
    let added = 0;
    let skipped = 0;
    const newStudents: RegisteredStudent[] = [];
    const newOffline: any[] = [];

    for (const s of students) {
      if (registeredStudents.some(rs => rs.student_id === s.student_id)) {
        skipped++;
      } else {
        newStudents.push(s);
        newOffline.push({ student_id: s.student_id, voted_online: false, marked_offline: false });
        added++;
      }
    }

    if (newStudents.length > 0) {
      try {
        await supabase.from('registered_students').insert(newStudents);
        await supabase.from('offline_records').insert(newOffline);
        setRegisteredStudents(prev => [...prev, ...newStudents]);
        // Update local offline records with basic info
        setOfflineRecords(prev => [...prev, ...newStudents.map(s => ({
          student_id: s.student_id,
          studentName: s.name,
          department: s.department,
          phone: s.phone,
          votedOnline: false,
          markedOffline: false
        }))]);
      } catch (error) {
        console.error('Error in bulk add:', error);
      }
    }
    return { added, skipped };
  };

  const removeStudent = async (studentId: string) => {
    try {
      await supabase.from('offline_records').delete().eq('student_id', studentId);
      const { error } = await supabase.from('registered_students').delete().eq('student_id', studentId);
      if (error) throw error;
      setRegisteredStudents(prev => prev.filter(s => s.student_id !== studentId));
      setOfflineRecords(prev => prev.filter(r => r.student_id !== studentId));
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const isStudentRegistered = (student_id: string) => {
    return registeredStudents.some(s => s.student_id === student_id);
  };

  const handleSetElectionPhase = async (phase: ElectionPhase) => {
    try {
      if (electionPhase === 'results' && phase !== 'results') {
        console.log('🔄 Starting ultra-robust election reset...');

        // 1. Reset Candidates
        const { error: candError } = await supabase
          .from('candidates')
          .update({ votes: 0, online_votes: 0, offline_votes: 0 })
          .not('id', 'is', null);
          
        if (candError) {
          console.warn('⚠️ Bulk candidate reset failed, trying individual reset fallback...', candError);
          // Fallback: Fetch all IDs and update one by one
          const { data: candIds } = await supabase.from('candidates').select('id');
          if (candIds) {
            for (const { id } of candIds) {
              await supabase.from('candidates').update({ votes: 0, online_votes: 0, offline_votes: 0 }).eq('id', id);
            }
          } else {
            throw new Error('Candidate reset totally failed: Could not even fetch IDs');
          }
        }

        // 2. Clear Voted Users
        const { error: voteError } = await supabase
          .from('voted_users')
          .delete()
          .not('student_id', 'is', null);
          
        if (voteError) {
          console.error('❌ Failed to clear voted users:', voteError);
          toast({ 
            title: 'Voter List Reset Failed', 
            description: voteError.message, 
            variant: 'destructive' 
          });
          throw new Error('Database error: Voter reset failed');
        }

        // 3. Reset Offline Records
        const { error: offlineError } = await supabase
          .from('offline_records')
          .update({
            voted_online: false,
            marked_offline: false,
            marked_at: null,
            marked_by: null
          })
          .not('student_id', 'is', null);
          
        if (offlineError) {
          console.error('❌ Failed to reset offline records:', offlineError);
          toast({ 
            title: 'Offline Records Reset Failed', 
            description: offlineError.message, 
            variant: 'destructive' 
          });
          throw new Error('Database error: Offline records reset failed');
        }

        // 4. Reset NOTA counts in election_config
        try {
          const { error: notaError } = await supabase
            .from('election_config')
            .update({ value: '0' })
            .like('key', 'nota_%');
            
          if (notaError) console.error('⚠️ Failed to reset NOTA keys:', notaError);
        } catch (e) {
          console.warn('⚠️ Manual NOTA reset failed, skipping...', e);
        }

        // 5. Update local state
        setCandidates(prev => prev.map(c => ({ ...c, votes: 0, online_votes: 0, offline_votes: 0 })));
        setVotedUsers([]);
        setNotaVotes({});
        setOfflineRecords(prev => prev.map(r => ({
          ...r,
          votedOnline: false,
          markedOffline: false,
          markedAt: undefined,
          markedBy: undefined
        })));

        if (currentUser) {
          const updatedUser = { ...currentUser, hasVoted: false };
          setCurrentUser(updatedUser);
          localStorage.setItem('voxnova_user', JSON.stringify(updatedUser));
        }

        console.log('✅ Robust election reset complete.');
      }

      // Finally update the phase
      const { error: phaseError } = await supabase
        .from('election_config')
        .upsert({ key: 'election_phase', value: phase });

      if (phaseError) throw phaseError;

      setElectionPhase(phase);
      toast({
        title: 'Phase Updated',
        description: `Election is now in ${phase.charAt(0).toUpperCase() + phase.slice(1)} Phase.`
      });
    } catch (error: any) {
      console.error('🚨 Phase transition error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Check connection or database permissions.',
        variant: 'destructive'
      });
    }
  };

  return (
    <VotingContext.Provider
      value={{
        candidates, addCandidate, removeCandidate,
        currentUser,
        setCurrentUser: (user) => {
          setCurrentUser(user);
          if (user) localStorage.setItem('voxnova_user', JSON.stringify(user));
          else localStorage.removeItem('voxnova_user');
        },
        votedUsers, castVote,
        isAdmin,
        setIsAdmin: (val) => {
          setIsAdmin(val);
          localStorage.setItem('voxnova_admin', val.toString());
        },
        isController,
        setIsController: (val) => {
          setIsController(val);
          localStorage.setItem('voxnova_controller', val.toString());
        },
        electionPhase, setElectionPhase: handleSetElectionPhase,
        controllerCredentials,
        setControllerCredentials: (creds) => {
          setControllerCredentials(creds);
          if (creds) localStorage.setItem('voxnova_controller_creds', JSON.stringify(creds));
          else localStorage.removeItem('voxnova_controller_creds');
        },
        nominations, addNomination, updateNominationStatus,
        offlineRecords, markOfflineVote, unmarkOfflineVote, addOfflineVotesForCandidate, addOfflineNota,
        registeredStudents, addStudent, addStudentsBulk, removeStudent, isStudentRegistered,
        isLoading, notaVotes
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) throw new Error('useVoting must be used within a VotingProvider');
  return context;
}
