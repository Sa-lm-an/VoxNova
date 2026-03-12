export type Position = 'Chairperson' | 'Vice Chairperson' | 'Secretary' | 'Department Representative' | 'General Captain' | 'Fine Arts Secretary';

export const POSITIONS: Position[] = ['Chairperson', 'Vice Chairperson', 'Secretary', 'Department Representative', 'General Captain', 'Fine Arts Secretary'];

export const POSITION_CATEGORIES: Record<string, Position[]> = {
  'General': ['Chairperson', 'Vice Chairperson', 'Secretary'],
  'Department': ['Department Representative'],
  'Other': ['General Captain', 'Fine Arts Secretary']
};

export interface Candidate {
  id: string;
  name: string;
  position: Position;
  image?: string; // Made optional per user request
  votes: number;
  department: string;
  party: string;
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
  party: string;
  image?: string; // Made optional
  applicationFormUrl?: string;
  applicationFormName?: string;
  marklistUrl?: string;
  marklistName?: string;
  photoUrl?: string; // Made optional
  photoName?: string; // Made optional
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}


export interface RegisteredStudent {
  studentId: string;
  name: string;
  department: string;
  phone: string;
}


export interface OfflineVoteRecord {
  studentId: string;
  studentName: string;
  department: string;
  phone: string;
  votedOnline: boolean;
  markedOffline: boolean;
  markedAt?: string;
  markedBy?: string;
}

export type ElectionPhase = 'nomination' | 'voting' | 'results';
