import { useNavigate } from 'react-router-dom';
import { Shield, User, Building2 } from 'lucide-react';

const loginOptions = [
  {
    title: 'Student',
    description: 'Vote in elections or apply for nomination',
    icon: User,
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
    icon: Building2,
    path: '/controller-login',
    gradient: 'bg-gradient-to-br from-[#112250] to-[#1E4AA8]',
    shadow: 'shadow-md shadow-blue-500/10',
  },
];

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="pt-4" />

        <div className="mx-auto mt-12 max-w-md text-center">
          <h2 className="font-display text-3xl font-bold text-foreground animate-slide-up -translate-y-0.5">
            Select Your Role
          </h2>
          <p className="mt-2 text-muted-foreground animate-slide-up -translate-y-0.5">
            Choose how you'd like to sign in
          </p>

          <div className="mt-10 flex flex-col gap-4 animate-slide-up">
            {loginOptions.map((opt) => (
              <button
                key={opt.title}
                onClick={() => navigate(opt.path)}
                className="group flex items-center gap-5 rounded-2xl bg-card p-5 shadow-card border border-border/40 text-left transition-all hover:shadow-elevated hover:-translate-y-0.5 active:scale-[0.98] -translate-y-0.5"
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
