import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate, User, Nomination, OfflineVoteRecord, Position, POSITIONS, RegisteredStudent, ElectionPhase } from '@/types/voting';

interface VotingContextType {
  candidates: Candidate[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votes'>) => void;
  removeCandidate: (id: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  votedUsers: string[];
  castVote: (votes: Record<Position, string>) => boolean;
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
  markOfflineVote: (studentId: string, controllerName: string) => void;
  unmarkOfflineVote: (studentId: string) => void;
  addOfflineVotesForCandidate: (candidateId: string, count: number) => void;
  registeredStudents: RegisteredStudent[];
  addStudent: (student: RegisteredStudent) => void;
  addStudentsBulk: (students: RegisteredStudent[]) => { added: number; skipped: number };
  removeStudent: (studentId: string) => void;
  isStudentRegistered: (studentId: string) => boolean;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

const initialCandidates: Candidate[] = [
  // Chairperson (2)
  { id: '1', name: 'Arjun Das', position: 'Chairperson', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun', votes: 120, department: 'cs', party: 'SFI' },
  { id: '2', name: 'Mohammed Ali', position: 'Chairperson', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali', votes: 98, department: 'bba', party: 'MSF' },
  // Vice Chairperson (2)
  { id: '3', name: 'Fathima KS', position: 'Vice Chairperson', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fathima', votes: 115, department: 'bcom', party: 'Independent' },
  { id: '4', name: 'Rahul PS', position: 'Vice Chairperson', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', votes: 102, department: 'cs', party: 'SFI' },
  // Secretary (1 - Unopposed)
  { id: '5', name: 'Sneha Thomas', position: 'Secretary', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', votes: 0, department: 'bba', party: 'Independent' },
  // Department Representative (2 - CS specifically for testing)
  { id: '6', name: 'Karthik R', position: 'Department Representative', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik', votes: 45, department: 'cs', party: 'MSF' },
  { id: '7', name: 'Meera M', position: 'Department Representative', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera', votes: 52, department: 'cs', party: 'SFI' },
  // General Captain (2)
  { id: '8', name: 'Vishnu V', position: 'General Captain', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vishnu', votes: 88, department: 'bba', party: 'Independent' },
  { id: '9', name: 'Abdurahman', position: 'General Captain', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abdu', votes: 110, department: 'bcom', party: 'MSF' },
  // Fine Arts Secretary (2)
  { id: '10', name: 'Anjali C', position: 'Fine Arts Secretary', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali', votes: 95, department: 'cs', party: 'SFI' },
  { id: '11', name: 'Diya K', position: 'Fine Arts Secretary', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diya', votes: 105, department: 'bba', party: 'MSF' },
];

const initialStudents: RegisteredStudent[] = [
  { studentId: 'STU001', name: 'fabin', department: 'cs', phone: '9876543210' },
  { studentId: 'STU002', name: 'salman', department: 'bba', phone: '9876543211' },
  { studentId: 'STU003', name: 'rena', department: 'bcom', phone: '9876543212' },
  { studentId: 'STU004', name: 'shahana', department: 'cs', phone: '9876543213' },
  { studentId: 'STU005', name: 'shamil', department: 'bba', phone: '9876543214' },
  { studentId: 'STU006', name: 'dayyan', department: 'bcom', phone: '9876543215' },
  { studentId: 'STU007', name: 'ramees', department: 'cs', phone: '9876543216' },
  { studentId: 'STU008', name: 'shinana', department: 'bba', phone: '9876543217' },
  { studentId: 'STU009', name: 'hiba', department: 'bcom', phone: '9876543218' },
  { studentId: 'STU010', name: 'hunaif', department: 'cs', phone: '9876543219' },
];

const initialOfflineRecords: OfflineVoteRecord[] = initialStudents.map(s => ({
  studentId: s.studentId,
  studentName: s.name,
  department: s.department,
  phone: s.phone,
  votedOnline: false,
  markedOffline: false,
}));

export function VotingProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [votedUsers, setVotedUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isController, setIsController] = useState(false);
  const [electionPhase, setElectionPhase] = useState<ElectionPhase>('nomination');
  const [controllerCredentials, setControllerCredentials] = useState<{ id: string; pass: string } | null>(null);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [offlineRecords, setOfflineRecords] = useState<OfflineVoteRecord[]>(initialOfflineRecords);
  const [registeredStudents, setRegisteredStudents] = useState<RegisteredStudent[]>(initialStudents);

  const addCandidate = (candidate: Omit<Candidate, 'id' | 'votes'>) => {
    const newCandidate: Candidate = { ...candidate, id: Date.now().toString(), votes: 0 };
    setCandidates(prev => [...prev, newCandidate]);
  };

  const removeCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const castVote = (votes: Record<Position, string>): boolean => {
    if (!currentUser || votedUsers.includes(currentUser.studentId)) return false;
    // Prevent online vote if already marked offline
    const record = offlineRecords.find(r => r.studentId === currentUser.studentId);
    if (record?.markedOffline) return false;
    setCandidates(prev =>
      prev.map(c => {
        const votedId = votes[c.position];
        return votedId === c.id ? { ...c, votes: c.votes + 1 } : c;
      })
    );
    setVotedUsers(prev => [...prev, currentUser.studentId]);
    setCurrentUser({ ...currentUser, hasVoted: true });

    setOfflineRecords(prev =>
      prev.map(r =>
        r.studentId === currentUser.studentId ? { ...r, votedOnline: true } : r
      )
    );

    return true;
  };

  const addNomination = (nomination: Omit<Nomination, 'id' | 'status' | 'submittedAt'>) => {
    const newNomination: Nomination = {
      ...nomination,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setNominations(prev => [...prev, newNomination]);
  };

  const updateNominationStatus = (id: string, status: 'approved' | 'rejected') => {
    setNominations(prev => prev.map(n => (n.id === id ? { ...n, status } : n)));
    if (status === 'approved') {
      const nom = nominations.find(n => n.id === id);
      if (nom) {
        addCandidate({
          name: nom.name,
          position: nom.position,
          image: nom.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nom.name}`,
          department: nom.department,
        });
      }
    }
  };

  const markOfflineVote = (studentId: string, controllerName: string) => {
    // Prevent offline mark if already voted online
    const record = offlineRecords.find(r => r.studentId === studentId);
    if (record?.votedOnline || votedUsers.includes(studentId)) return;
    setOfflineRecords(prev =>
      prev.map(r =>
        r.studentId === studentId
          ? { ...r, markedOffline: true, markedAt: new Date().toISOString(), markedBy: controllerName }
          : r
      )
    );
  };

  const unmarkOfflineVote = (studentId: string) => {
    setOfflineRecords(prev =>
      prev.map(r =>
        r.studentId === studentId
          ? { ...r, markedOffline: false, markedAt: undefined, markedBy: undefined }
          : r
      )
    );
  };

  const addOfflineVotesForCandidate = (candidateId: string, count: number) => {
    if (count <= 0) return;
    setCandidates(prev =>
      prev.map(c => c.id === candidateId ? { ...c, votes: c.votes + count } : c)
    );
  };

  const addStudent = (student: RegisteredStudent) => {
    setRegisteredStudents(prev => [...prev, student]);
    setOfflineRecords(prev => [...prev, {
      studentId: student.studentId,
      studentName: student.name,
      department: student.department,
      phone: student.phone,
      votedOnline: false,
      markedOffline: false,
    }]);
  };

  const addStudentsBulk = (students: RegisteredStudent[]): { added: number; skipped: number } => {
    let added = 0;
    let skipped = 0;
    const newStudents: RegisteredStudent[] = [];
    const newRecords: OfflineVoteRecord[] = [];

    for (const s of students) {
      if (registeredStudents.some(rs => rs.studentId === s.studentId) || newStudents.some(ns => ns.studentId === s.studentId)) {
        skipped++;
      } else {
        added++;
        newStudents.push(s);
        newRecords.push({ studentId: s.studentId, studentName: s.name, department: s.department, phone: s.phone, votedOnline: false, markedOffline: false });
      }
    }

    if (newStudents.length > 0) {
      setRegisteredStudents(prev => [...prev, ...newStudents]);
      setOfflineRecords(prev => [...prev, ...newRecords]);
    }
    return { added, skipped };
  };

  const removeStudent = (studentId: string) => {
    setRegisteredStudents(prev => prev.filter(s => s.studentId !== studentId));
    setOfflineRecords(prev => prev.filter(r => r.studentId !== studentId));
  };

  const isStudentRegistered = (studentId: string) => {
    return registeredStudents.some(s => s.studentId === studentId);
  };

  return (
    <VotingContext.Provider
      value={{
        candidates, addCandidate, removeCandidate,
        currentUser, setCurrentUser, votedUsers, castVote,
        isAdmin, setIsAdmin, isController, setIsController,
        electionPhase, setElectionPhase, controllerCredentials, setControllerCredentials,
        nominations, addNomination, updateNominationStatus,
        offlineRecords, markOfflineVote, unmarkOfflineVote, addOfflineVotesForCandidate,
        registeredStudents, addStudent, addStudentsBulk, removeStudent, isStudentRegistered,
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
