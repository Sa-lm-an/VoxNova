import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Send, FileText, User, Building, Image, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import { Position, POSITIONS } from '@/types/voting';

const Nominate = () => {
  const navigate = useNavigate();
  const { addNomination } = useVoting();
  const [name, setName] = useState('');
  const [position, setPosition] = useState<Position | ''>('');
  const [department, setDepartment] = useState('');
  const [image, setImage] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentId, setStudentId] = useState('');

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
    if (!studentId || !name || !position || !department || !image || !documentUrl) {
      toast({ title: 'Missing Fields', description: 'Please fill all fields, upload your photo and supporting document.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    addNomination({
      studentId,
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
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group">
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Back to Home
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

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-muted-foreground" /> Student ID *
                </Label>
                <Input 
                  placeholder="Enter your student ID" 
                  value={studentId} 
                  onChange={e => setStudentId(e.target.value)} 
                  className="rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-muted-foreground" /> Full Name *
                </Label>
                <Input 
                  placeholder="Enter your full name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
                />
              </div>

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

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Building className="h-4 w-4 text-muted-foreground" /> Department *
                </Label>
                <Input 
                  placeholder="e.g., Computer Science" 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)} 
                  className="rounded-xl bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Image className="h-4 w-4 text-muted-foreground" /> Your Photo *
                </Label>
                <div className="flex items-center gap-4">
                  {image && (
                    <div className="relative">
                      <img src={image} alt="Preview" className="h-16 w-16 rounded-xl object-cover ring-2 ring-primary/30" />
                    </div>
                  )}
                  <label className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 bg-background/30 px-4 py-4 text-sm text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary">
                    <Upload className="h-5 w-5" /> 
                    <span>{image ? 'Change Photo' : 'Upload Photo'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileUp className="h-4 w-4 text-muted-foreground" /> Supporting Document * (PDF, image)
                </Label>
                <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-border/50 bg-background/30 p-5 text-sm transition-all hover:border-primary hover:bg-primary/5 group">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${documentName ? 'bg-green-500/20' : 'bg-muted'}`}>
                    <FileUp className={`h-6 w-6 ${documentName ? 'text-green-600' : 'text-muted-foreground group-hover:text-primary'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={documentName ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                      {documentName || 'Click to upload document'}
                    </p>
                    {!documentName && <p className="text-xs text-muted-foreground mt-1">Max 5MB</p>}
                  </div>
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                variant="hero" 
                size="xl" 
                className="w-full mt-6"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" /> Submit Nomination
                  </>
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
