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
  votes: number;
  online_votes: number;
  offline_votes: number;
  department: string;
  party: string;
}

export interface User {
  id: string;
  student_id: string;
  name: string;
  hasVoted: boolean;
  department: string;
  phone?: string;
}

export interface Nomination {
  id: string;
  student_id: string;
  name: string;
  position: Position;
  department: string;
  party: string;
  application_form_url?: string;
  application_form_name?: string;
  marklist_url?: string;
  marklist_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}


export interface RegisteredStudent {
  student_id: string;
  name: string;
  department: string;
  phone: string;
}


export interface OfflineVoteRecord {
  student_id: string;
  studentName: string;
  department: string;
  phone: string;
  votedOnline: boolean;
  markedOffline: boolean;
  markedAt?: string;
  markedBy?: string;
}

export type ElectionPhase = 'nomination' | 'voting' | 'results';
