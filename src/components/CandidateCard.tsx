import { Candidate } from '@/types/voting';
import { Check, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
  onVote?: () => void;
  hasVoted?: boolean;
  showVotes?: boolean;
  isSelected?: boolean;
}

export function CandidateCard({
  candidate,
  onVote,
  hasVoted,
  showVotes,
  isSelected,
}: CandidateCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated animate-scale-in flex items-center p-4 gap-4',
        isSelected && 'ring-2 ring-primary shadow-glow bg-primary/5'
      )}
    >
      {/* Text info */}
      <div className="flex-1 min-w-0">
        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-1">
          {candidate.department}
        </span>
        <h3 className="font-display text-base font-semibold text-foreground truncate">{candidate.name}</h3>
        <p className="text-xs text-muted-foreground">{candidate.position}</p>
        {candidate.party && (
          <p className="text-sm font-medium text-[#38a09e] mt-1">🏳 {candidate.party}</p>
        )}

        {showVotes && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-primary transition-all duration-500"
                style={{ width: `${Math.min(candidate.votes * 2, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-primary">{candidate.votes} votes</span>
          </div>
        )}
      </div>

      {/* Selected badge */}
      {isSelected && (
        <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
          <Check className="h-4 w-4 text-primary" />
        </div>
      )}

      {onVote && !hasVoted && (
        <button
          onClick={onVote}
          className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Vote className="h-4 w-4" />
          Vote
        </button>
      )}
    </div>
  );
}
