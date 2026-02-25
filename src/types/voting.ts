export type Position = 'President' | 'Vice President' | 'Secretary';

export const POSITIONS: Position[] = ['President', 'Vice President', 'Secretary'];

export interface Candidate {
  id: string;
  name: string;
  position: Position;
  image: string;
  votes: number;
  department: string;
}

export interface User {
  id: string;
  studentId: string;
  name: string;
  hasVoted: boolean;
  department: string;
  phone?: string;
}

export interface Nomination {
  id: string;
  studentId: string;
  name: string;
  position: Position;
  department: string;
  image: string;
  documentUrl: string;
  documentName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface OfflineVoteRecord {
  studentId: string;
  studentName: string;
  department: string;
  votedOnline: boolean;
  markedOffline: boolean;
  markedAt?: string;
  markedBy?: string;
}

export interface VotingState {
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
}
