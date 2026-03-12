import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useVoting } from '@/contexts/VotingContext';
import { toast } from '@/hooks/use-toast';
import heroImg from '@/assets/hero-voting.png';
import logoImg from '@/assets/logo2.png';

const LogoSVG = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center mix-blend-multiply bg-transparent ${className}`}>
    <img
      src={logoImg}
      alt="VoxNova 3D Logo Icon"
      className="w-[180%] h-[180%] max-w-none object-contain pointer-events-none"
    />
  </div>
);

export { LogoSVG };

const Index = () => {
  const navigate = useNavigate();
  const { electionPhase, currentUser, setCurrentUser } = useVoting();

  useEffect(() => {
    if (currentUser) {
      setCurrentUser(null);
    }
  }, [currentUser, setCurrentUser]);

  return (
    <div className="font-sans overflow-x-hidden bg-[#fdfdfd] selection:bg-[#329894]/20">

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pb-0">
        {/* Subtle background radial glow */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#d4eeeb]/40 blur-3xl pointer-events-none z-0" />
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#b8e0de]/30 blur-3xl pointer-events-none z-0" />

        <div className="container mx-auto px-6 pt-6 pb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 max-w-7xl">

          {/* Left: Logo + Text */}
          <div className="flex-[0.9] flex flex-col items-center md:items-start text-center md:text-left">
            {/* Logo */}
            <div className="mb-2 animate-slide-up">
              <div className="w-44 h-44 md:w-[200px] md:h-[200px]">
                <LogoSVG className="w-full h-full" />
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-[2.2rem] md:text-5xl font-extrabold text-[#193248] leading-[1.1] mb-3 tracking-[-0.02em]">
                Your Voice, <span className="text-[#38a09e]">Your Vote</span>
              </h1>
              <p className="text-[16px] md:text-[18px] leading-relaxed text-[#75848d] max-w-[380px] mx-auto md:mx-0">
                Secure, transparent elections for your campus community.
              </p>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="flex-[1.1] w-full animate-slide-up mix-blend-multiply" style={{ animationDelay: '0.2s' }}>
            <div className="w-full flex items-center justify-center">
              <img
                src={heroImg}
                alt="Students voting on campus"
                className="w-full max-h-[380px] object-contain mix-blend-multiply"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
        </div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="relative z-20 pb-16 pt-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-6 max-w-[850px] mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>

              {/* Cast Your Vote */}
              <button
                onClick={() => {
                  if (electionPhase !== 'voting') {
                    toast({ title: 'Voting Closed', description: 'The voting phase is currently not active.', variant: 'destructive' });
                  } else {
                    navigate('/user-login?redirect=vote');
                  }
                }}
                className="group w-[240px] h-[58px] flex items-center justify-center gap-3 bg-gradient-to-r from-[#1b6b88] to-[#2c9d96] hover:from-[#15546b] hover:to-[#21817b] text-white rounded-[10px] text-[15px] font-medium shadow-[0_8px_20px_rgba(33,124,136,0.3)] hover:shadow-[0_12px_25px_rgba(33,124,136,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-[20px] h-[20px] border-[2px] border-[#fbbe4a] bg-[#1a5b74]/40 rounded-[3px]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[12px] h-[12px] text-[#fbbe4a]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span>Cast Your Vote</span>
              </button>

              {/* Nomination */}
              <button
                onClick={() => {
                  if (electionPhase !== 'nomination') {
                    toast({ title: 'Nominations Closed', description: 'The nomination phase is currently not active.', variant: 'destructive' });
                  } else {
                    navigate('/user-login?redirect=nominate');
                  }
                }}
                className="group w-[240px] h-[58px] flex items-center justify-center gap-3 bg-gradient-to-r from-[#1b6b88] to-[#2c9d96] hover:from-[#15546b] hover:to-[#21817b] text-white rounded-[10px] text-[15px] font-medium shadow-[0_8px_20px_rgba(33,124,136,0.3)] hover:shadow-[0_12px_25px_rgba(33,124,136,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative flex items-center justify-center w-[20px] h-[20px] text-[#fbbe4a]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <div className="absolute -bottom-[1px] -right-[4px] bg-[#1a5b74] rounded-full p-[2px]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[8px] h-[8px] text-[#fbbe4a]">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                </div>
                <span>Nomination</span>
              </button>

              {/* View Result */}
              <button
                onClick={() => {
                  if (electionPhase !== 'results') {
                    toast({ title: 'Results Not Available', description: 'Results are locked until the election reaches the results phase.', variant: 'destructive' });
                  } else {
                    navigate('/results');
                  }
                }}
                className="group w-[240px] h-[58px] flex items-center justify-center gap-3 bg-gradient-to-r from-[#1b6b88] to-[#2c9d96] hover:from-[#15546b] hover:to-[#21817b] text-white rounded-[10px] text-[15px] font-medium shadow-[0_8px_20px_rgba(33,124,136,0.3)] hover:shadow-[0_12px_25px_rgba(33,124,136,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                <BarChart3 strokeWidth={2.5} className="w-[20px] h-[20px] text-[#fbbe4a]" />
                <span>View Result</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wave transition into next section */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]">
            <path fill="#f4fbfa" d="M0,40L60,50C120,60,240,80,360,74.7C480,69,600,37,720,32C840,27,960,53,1080,58.7C1200,64,1320,50,1380,42.7L1440,37L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="bg-[#f4fbfa] py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#193248] mb-3">How It Works</h2>
            <div className="w-14 h-1 bg-[#38a09e] mx-auto rounded-full mb-4"></div>
            <p className="text-[#647683] max-w-xl mx-auto text-base">Participating in your campus election is fast, secure, and straightforward.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Register / Login', desc: 'Sign in securely with your student credentials to verify your election eligibility.' },
              { n: '2', title: 'View Candidates', desc: 'Browse active nominations and read candidate manifestos before making your decision.' },
              { n: '3', title: 'Cast Your Vote', desc: 'Submit your vote securely. Our system ensures full anonymity and verifiable results.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] text-center transition-transform hover:-translate-y-1 border border-[#eaf5f3]">
                <div className="w-12 h-12 bg-[#eaf5f4] text-[#38a09e] rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">{n}</div>
                <h3 className="text-lg font-bold text-[#193248] mb-2">{title}</h3>
                <p className="text-[#75848d] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#193248] mb-3">About VoxNova</h2>
              <div className="w-14 h-1 bg-[#38a09e] mx-auto md:mx-0 rounded-full mb-5"></div>
              <p className="text-[#647683] text-base leading-relaxed mb-4">
                VoxNova represents the next generation of democratic participation on campus. We built this platform to eliminate the friction and fraud associated with paper-based elections.
              </p>
              <p className="text-[#647683] text-base leading-relaxed">
                By leveraging modern web security protocols, VoxNova guarantees that every student's vote is counted exactly once, completely anonymously, and verified instantly.
              </p>
            </div>
            <div className="flex-[0.7] hidden md:flex justify-center">
              <div className="w-52 h-52">
                <LogoSVG className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="bg-[#f4fbfa] py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#193248] mb-3">Get in Touch</h2>
            <div className="w-14 h-1 bg-[#38a09e] mx-auto rounded-full"></div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-[#eaf5f3]">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold text-[#193248] mb-3">Election Commission Support</h3>
                <p className="text-[#75848d] text-sm mb-5">Having trouble? Contact the campus election authorities immediately.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#193248]">
                    <div className="w-9 h-9 rounded-full bg-[#eaf5f4] flex items-center justify-center text-[#38a09e] font-bold text-sm">@</div>
                    <span className="font-medium text-sm">support@voxnova.edu</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#193248]">
                    <div className="w-9 h-9 rounded-full bg-[#eaf5f4] flex items-center justify-center text-[#38a09e] font-bold text-sm">#</div>
                    <span className="font-medium text-sm">Room 402, Admin Block</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:border-[#38a09e] focus:ring-1 focus:ring-[#38a09e] bg-[#fdfdfd] text-[#193248] text-sm" />
                <input type="email" placeholder="Student Email" className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:border-[#38a09e] focus:ring-1 focus:ring-[#38a09e] bg-[#fdfdfd] text-[#193248] text-sm" />
                <textarea placeholder="How can we help?" rows={3} className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] focus:outline-none focus:border-[#38a09e] focus:ring-1 focus:ring-[#38a09e] bg-[#fdfdfd] text-[#193248] resize-none text-sm"></textarea>
                <button className="bg-[#193248] hover:bg-[#112333] text-white font-medium py-3 rounded-xl transition-colors shadow-md text-sm">Send Message</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#193248] py-6 text-center text-[#7c8b93] text-sm">
        <p>© 2026 VoxNova E-Voting System. Built for secure campus elections.</p>
      </footer>
    </div>
  );
};

export default Index;
