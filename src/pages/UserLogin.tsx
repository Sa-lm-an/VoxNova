import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Phone, Send, ShieldCheck, Fingerprint, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IdCardScanner } from '@/components/IdCardScanner';
import { OtpInput } from '@/components/OtpInput';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';

type Step = 'scan' | 'phone' | 'otp';

const UserLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser, votedUsers, isStudentRegistered, registeredStudents } = useVoting();
  const [step, setStep] = useState<Step>('scan');
  const redirectTo = searchParams.get('redirect') === 'nominate' ? '/nominate' : '/vote';
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleIdScan = (id: string) => {
    if (!isStudentRegistered(id)) {
      toast({
        title: 'Not Registered',
        description: 'Your student ID is not in the eligible voter list. Contact the admin.',
        variant: 'destructive',
      });
      return;
    }

    setStudentId(id);

    if (votedUsers.includes(id) && redirectTo !== '/nominate') {
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

      navigate(redirectTo);
    }
  };

  const stepIndex = ['scan', 'phone', 'otp'].indexOf(step);
  const stepIcons = [Fingerprint, Phone, KeyRound];
  const stepLabels = ['Verify ID', 'Phone', 'OTP'];

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <button
          onClick={() => {
            if (step === 'scan') navigate(-1 as any);
            else if (step === 'phone') setStep('scan');
            else if (step === 'otp') setStep('phone');
          }}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div className="mx-auto mt-8 max-w-md">
          {/* Progress Steps */}
          <div className="mb-10 flex items-center justify-center gap-3">
            {stepLabels.map((label, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300 ${step === ['scan', 'phone', 'otp'][i]
                        ? 'gradient-primary text-primary-foreground shadow-glow scale-110'
                        : i < stepIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'glass-card text-muted-foreground'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-medium ${step === ['scan', 'phone', 'otp'][i] ? 'text-primary' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`w-12 h-0.5 rounded-full mb-6 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl glass-card p-8 animate-scale-in">
            {step === 'scan' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                    <ShieldCheck className="h-8 w-8 text-primary-foreground" />
                  </div>
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
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                    <Phone className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Phone Verification
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    We'll send a verification code
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm p-4 transition-all focus-within:border-primary focus-within:shadow-glow">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="border-0 bg-transparent text-lg focus-visible:ring-0"
                    />
                  </div>

                  <Button
                    onClick={handlePhoneSubmit}
                    disabled={phone.length < 10 || isLoading}
                    variant="hero"
                    size="xl"
                    className="w-full"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Sending...
                      </span>
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
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
                    <KeyRound className="h-8 w-8 text-primary-foreground" />
                  </div>
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
                    className="font-semibold text-primary hover:underline transition-colors"
                  >
                    Resend
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
