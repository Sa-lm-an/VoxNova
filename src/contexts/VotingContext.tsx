import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate, User, Nomination, OfflineVoteRecord, Position, POSITIONS, RegisteredStudent } from '@/types/voting';

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
  votingActive: boolean;
  setVotingActive: (value: boolean) => void;
  nominations: Nomination[];
  addNomination: (nomination: Omit<Nomination, 'id' | 'status' | 'submittedAt'>) => void;
  updateNominationStatus: (id: string, status: 'approved' | 'rejected') => void;
  offlineRecords: OfflineVoteRecord[];
  markOfflineVote: (studentId: string, controllerName: string) => void;
  unmarkOfflineVote: (studentId: string) => void;
  registeredStudents: RegisteredStudent[];
  addStudent: (student: RegisteredStudent) => void;
  removeStudent: (studentId: string) => void;
  isStudentRegistered: (studentId: string) => boolean;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

const initialCandidates: Candidate[] = [
  { id: '1', name: 'Sarah Johnson', position: 'President', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', votes: 45, department: 'Computer Science' },
  { id: '2', name: 'Michael Chen', position: 'President', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', votes: 38, department: 'Engineering' },
  { id: '3', name: 'Emily Davis', position: 'Vice President', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', votes: 52, department: 'Business' },
  { id: '4', name: 'James Wilson', position: 'Vice President', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', votes: 30, department: 'Arts' },
  { id: '5', name: 'Priya Sharma', position: 'Secretary', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', votes: 41, department: 'Science' },
  { id: '6', name: 'David Kim', position: 'Secretary', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', votes: 35, department: 'Law' },
];

const initialStudents: RegisteredStudent[] = [
  { studentId: 'STU001', name: 'Aarav Patel', department: 'Computer Science' },
  { studentId: 'STU002', name: 'Meera Nair', department: 'Engineering' },
  { studentId: 'STU003', name: 'Rahul Gupta', department: 'Business' },
  { studentId: 'STU004', name: 'Ananya Singh', department: 'Arts' },
  { studentId: 'STU005', name: 'Karthik Iyer', department: 'Science' },
  { studentId: 'STU006', name: 'Sneha Reddy', department: 'Law' },
  { studentId: 'STU007', name: 'Arjun Kumar', department: 'Computer Science' },
  { studentId: 'STU008', name: 'Divya Menon', department: 'Engineering' },
];

const initialOfflineRecords: OfflineVoteRecord[] = initialStudents.map(s => ({
  studentId: s.studentId,
  studentName: s.name,
  department: s.department,
  votedOnline: false,
  markedOffline: false,
}));

export function VotingProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [votedUsers, setVotedUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isController, setIsController] = useState(false);
  const [votingActive, setVotingActive] = useState(true);
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

  const addStudent = (student: RegisteredStudent) => {
    setRegisteredStudents(prev => [...prev, student]);
    // Also add to offline records
    setOfflineRecords(prev => [...prev, {
      studentId: student.studentId,
      studentName: student.name,
      department: student.department,
      votedOnline: false,
      markedOffline: false,
    }]);
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
        votingActive, setVotingActive,
        nominations, addNomination, updateNominationStatus,
        offlineRecords, markOfflineVote, unmarkOfflineVote,
        registeredStudents, addStudent, removeStudent, isStudentRegistered,
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
