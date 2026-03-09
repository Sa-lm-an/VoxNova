import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IdCardScanner } from '@/components/IdCardScanner';
import { OtpInput } from '@/components/OtpInput';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';

type Step = 'scan' | 'phone' | 'otp';

const UserLogin = () => {
  const navigate = useNavigate();
  const { setCurrentUser, votedUsers, isStudentRegistered, registeredStudents } = useVoting();
  const [step, setStep] = useState<Step>('scan');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleIdScan = (id: string) => {
    // Check if student is registered
    if (!isStudentRegistered(id)) {
      toast({
        title: 'Not Registered',
        description: 'Your student ID is not in the eligible voter list. Contact the admin.',
        variant: 'destructive',
      });
      return;
    }

    setStudentId(id);

    // Check if already voted
    if (votedUsers.includes(id)) {
      toast({
        title: 'Already Voted',
        description: 'You have already cast your vote in this election.',
        variant: 'destructive',
      });
      return;
    }

    setStep('phone');
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: 'OTP Sent',
      description: 'A verification code has been sent to your phone.',
    });
    setStep('otp');
  };

  const handleOtpComplete = (otp: string) => {
    if (otp.length === 6) {
      const student = registeredStudents.find(s => s.studentId === studentId);
      setCurrentUser({
        id: Date.now().toString(),
        studentId,
        name: student?.name || 'Student User',
        hasVoted: false,
        department: student?.department || 'General',
      });

      toast({
        title: 'Welcome!',
        description: 'You have been verified successfully.',
      });

      navigate('/vote');
    }
  };

  const stepIndex = ['scan', 'phone', 'otp'].indexOf(step);

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => {
            if (step === 'scan') navigate('/');
            else if (step === 'phone') setStep('scan');
            else if (step === 'otp') setStep('phone');
          }}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="mx-auto mt-8 max-w-md">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {['scan', 'phone', 'otp', 'choice'].map((s, i) => (
              <div
                key={s}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step === s
                    ? 'gradient-primary text-primary-foreground shadow-lg'
                    : i < stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-card p-8 shadow-elevated animate-scale-in">
            {step === 'scan' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Verify Your Identity
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Enter your student ID to continue
                  </p>
                </div>
                <IdCardScanner onScan={handleIdScan} />
              </div>
            )}

            {step === 'phone' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Phone Verification
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    We'll send a verification code
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-border bg-muted/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="border-0 bg-transparent text-lg"
                    />
                  </div>

                  <Button
                    onClick={handlePhoneSubmit}
                    disabled={phone.length < 10 || isLoading}
                    variant="hero"
                    size="lg"
                    className="w-full"
                  >
                    {isLoading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send OTP
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Enter OTP
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Code sent to ******{phone.slice(-4)}
                  </p>
                </div>

                <OtpInput onComplete={handleOtpComplete} />

                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive code?{' '}
                  <button
                    onClick={handlePhoneSubmit}
                    className="font-medium text-primary hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </div>
            )}

            {step === 'choice' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    What would you like to do?
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Choose an action to proceed
                  </p>
                </div>

                <div className="grid gap-4">
                  <Button
                    onClick={() => navigate('/vote')}
                    variant="hero"
                    size="lg"
                    className="w-full h-20 text-lg"
                  >
                    <Vote className="mr-3 h-6 w-6" />
                    Cast Your Vote
                  </Button>

                  <Button
                    onClick={() => navigate('/nominate')}
                    variant="glass"
                    size="lg"
                    className="w-full h-20 text-lg"
                  >
                    <FileText className="mr-3 h-6 w-6" />
                    Apply for Nomination
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
