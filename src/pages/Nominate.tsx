import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, FileText, User, Building, Image, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Position, POSITIONS } from '@/types/voting';

const Nominate = () => {
  const navigate = useNavigate();
  const { addNomination, currentUser, electionPhase } = useVoting();
  const [position, setPosition] = useState<Position | ''>('');
  const [party, setParty] = useState('');
  const [applicationForm, setApplicationForm] = useState<{ url: string; name: string } | null>(null);
  const [marklist, setMarklist] = useState<{ url: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (electionPhase !== 'nomination') {
      toast({ title: 'Nominations Closed', description: 'The nomination phase is currently not active.', variant: 'destructive' });
      navigate('/');
      return;
    }
    if (!currentUser) {
      toast({ title: 'Authentication Required', description: 'Please login to submit a nomination', variant: 'destructive' });
      navigate('/user-login');
    }
  }, [currentUser, navigate, electionPhase]);

  if (!currentUser) return null;

  if (!currentUser) return null;

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<{ url: string; name: string } | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter({ url: reader.result as string, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!position || !party || !applicationForm || !marklist) {
      toast({ title: 'Missing Fields', description: 'Please fill all required fields and upload all documents.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    addNomination({
      studentId: currentUser.studentId,
      name: currentUser.name,
      position: position as Position,
      department: currentUser.department,
      party,
      applicationFormUrl: applicationForm.url,
      applicationFormName: applicationForm.name,
      marklistUrl: marklist.url,
      marklistName: marklist.name,
    });

    toast({ title: 'Nomination Submitted!', description: 'Your nomination is pending admin approval.' });
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate(-1 as any)} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group">
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back
        </button>

        <div className="mx-auto mt-8 max-w-lg">
          <div className="glass-card rounded-3xl p-8 animate-scale-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-success shadow-lg">
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Apply for Nomination</h2>
              <p className="mt-2 text-muted-foreground">Submit your candidacy for the election</p>
            </div>

            <div className="space-y-6">
              {/* Readonly Logged-in info */}
              <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{currentUser.name}</span>
                  <span className="text-muted-foreground">({currentUser.studentId})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{currentUser.department}</span>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Position *
                </Label>
                <Select value={position} onValueChange={v => setPosition(v as Position)}>
                  <SelectTrigger className="rounded-xl bg-background/50 backdrop-blur-sm border-border/50">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Party */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Flag className="h-4 w-4 text-muted-foreground" /> Party / Alliance *
                </Label>
                <Input placeholder="e.g., Students United Front" value={party} onChange={e => setParty(e.target.value)} className="rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors" />
              </div>

              {/* Application Form */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Application Form (PDF/Image) *
                </Label>
                <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-dashed border-border/50 bg-background/30 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary hover:bg-primary/5">
                  <span className="truncate">{applicationForm ? applicationForm.name : 'Upload Application Form'}</span>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => handleDocumentUpload(e, setApplicationForm)} className="hidden" />
                </label>
              </div>

              {/* Marklist */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" /> Previous Semester Marklist *
                </Label>
                <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-dashed border-border/50 bg-background/30 px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary hover:bg-primary/5">
                  <span className="truncate">{marklist ? marklist.name : 'Upload Marklist'}</span>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => handleDocumentUpload(e, setMarklist)} className="hidden" />
                </label>
              </div>

              <Button onClick={handleSubmit} disabled={isSubmitting} variant="hero" size="xl" className="w-full mt-6">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <><Send className="mr-2 h-5 w-5" /> Submit Nomination</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nominate;
