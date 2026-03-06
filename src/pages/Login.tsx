import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Vote, Shield, ClipboardCheck } from 'lucide-react';

const loginOptions = [
  {
    title: 'Student',
    description: 'Vote in elections or apply for nomination',
    icon: Vote,
    path: '/user-login',
    gradient: 'gradient-primary',
    shadow: 'shadow-glow',
  },
  {
    title: 'Admin',
    description: 'Manage candidates, students & elections',
    icon: Shield,
    path: '/admin-login',
    gradient: 'gradient-success',
    shadow: 'shadow-md',
  },
  {
    title: 'Controller',
    description: 'Handle offline voting & verification',
    icon: ClipboardCheck,
    path: '/controller-login',
    gradient: 'bg-accent',
    shadow: 'shadow-md',
  },
];

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="mx-auto mt-12 max-w-md text-center">
          <h2 className="font-display text-3xl font-bold text-foreground animate-slide-up">
            Select Your Role
          </h2>
          <p className="mt-2 text-muted-foreground animate-slide-up">
            Choose how you'd like to sign in
          </p>

          <div className="mt-10 flex flex-col gap-4 animate-slide-up">
            {loginOptions.map((opt) => (
              <button
                key={opt.title}
                onClick={() => navigate(opt.path)}
                className="group flex items-center gap-5 rounded-2xl bg-card p-5 shadow-card border border-border/40 text-left transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${opt.gradient} ${opt.shadow} transition-transform group-hover:scale-110`}>
                  <opt.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{opt.title}</h3>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
