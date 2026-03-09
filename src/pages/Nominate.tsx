import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Position, POSITIONS } from '@/types/voting';

const Nominate = () => {
  const navigate = useNavigate();
  const { currentUser, addNomination } = useVoting();
  const [name, setName] = useState(currentUser?.name || '');
  const [position, setPosition] = useState<Position | ''>('');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [image, setImage] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nomination doesn't require login - students can apply directly

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 5MB.', variant: 'destructive' });
        return;
      }
      setDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setDocumentUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !position || !department || !documentUrl) {
      toast({ title: 'Missing Fields', description: 'Please fill all fields and upload a document.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    addNomination({
      studentId: currentUser.studentId,
      name,
      position: position as Position,
      department,
      image: image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      documentUrl,
      documentName,
    });

    toast({ title: 'Nomination Submitted!', description: 'Your nomination is pending admin approval.' });
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/vote')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-5 w-5" /> Back to Voting
        </button>

        <div className="mx-auto mt-8 max-w-lg">
          <div className="rounded-3xl bg-card p-8 shadow-elevated animate-scale-in">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                <FileText className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Apply for Nomination</h2>
              <p className="mt-2 text-muted-foreground">Submit your candidacy for the election</p>
            </div>

            <div className="space-y-5">
              <div>
                <Label>Full Name *</Label>
                <Input placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Position *</Label>
                <Select value={position} onValueChange={v => setPosition(v as Position)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Department *</Label>
                <Input placeholder="e.g., Computer Science" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Your Photo (optional)</Label>
                <div className="mt-1 flex items-center gap-4">
                  {image && <img src={image} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />}
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <Upload className="h-4 w-4" /> Upload Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <Label>Supporting Document * (PDF, image)</Label>
                <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 text-sm transition-colors hover:border-primary">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className={documentName ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                    {documentName || 'Click to upload document'}
                  </span>
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <Button onClick={handleSubmit} disabled={isSubmitting} variant="hero" size="lg" className="w-full">
                {isSubmitting ? 'Submitting...' : <><Send className="mr-2 h-5 w-5" /> Submit Nomination</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nominate;
