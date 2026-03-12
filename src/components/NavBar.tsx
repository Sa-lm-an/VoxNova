import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Home, LogOut } from 'lucide-react';
import logoImg from '@/assets/logo2.png';
import { useVoting } from '@/contexts/VotingContext';

// Inline logo for the NavBar
const LogoImg = () => (
    <div className="relative flex items-center justify-center mix-blend-multiply bg-transparent w-full h-full">
        <img
            src={logoImg}
            alt="VoxNova 3D Logo Icon"
            className="w-[180%] h-[180%] max-w-none object-contain pointer-events-none"
        />
    </div>
);

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, setCurrentUser, setIsAdmin, setIsController } = useVoting();

    // Hide entire navbar on admin/controller dashboards
    const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/controller');
    if (isDashboard) return null;

    // Login button only appears on the home page
    const isHome = location.pathname === '/';

    const handleHomeClick = () => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const handleSignout = () => {
        setCurrentUser(null);
        setIsAdmin(false);
        setIsController(false);
        handleHomeClick();
    };

    return (
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-[0_1px_10px_rgba(0,0,0,0.06)] border-b border-[#eaf5f3]">
            <nav className="container mx-auto px-6 py-3 flex items-center justify-between max-w-7xl">
                {/* Brand & Logo - now logs out and goes home */}
                <div className="flex items-center gap-[6px] cursor-pointer group" onClick={handleSignout}>
                    <div className="relative flex items-center justify-center w-12 h-12 group-hover:scale-105 transition-transform duration-300">
                        <LogoImg />
                    </div>
                    <span className="font-bold text-[26px] tracking-tight ml-1">
                        <span className="text-[#193248]">Vox</span><span className="text-[#3b9f9e]">Nova</span>
                    </span>
                </div>

                {/* Desktop Links — only shown on home page */}
                {isHome && (
                    <div className="hidden md:flex items-center gap-10 text-[15px] font-medium">
                        <a href="/#how-it-works" className="text-[#647683] hover:text-[#38a09e] transition-colors">How It Works</a>
                        <a href="/#about" className="text-[#647683] hover:text-[#38a09e] transition-colors">About</a>
                        <a href="/#contact" className="text-[#647683] hover:text-[#38a09e] transition-colors">Contact</a>
                    </div>
                )}

                {/* Right side: Login + Home on main page, Profile + Signout on inside pages */}
                <div className="flex items-center gap-2">
                    {/* On the main home page, show Login and Home */}
                    {isHome ? (
                        <>
                            <Button
                                onClick={() => navigate('/login')}
                                className="bg-[#38a09e] hover:bg-[#2b8a88] text-white rounded-[2rem] px-6 py-2 h-[42px] text-sm font-semibold transition-all shadow-[0_4px_12px_rgba(56,160,158,0.25)] hover:shadow-[0_6px_16px_rgba(56,160,158,0.35)] border-none flex items-center gap-2 hover:-translate-y-[1px]"
                            >
                                <User size={16} strokeWidth={2.5} />
                                Login
                            </Button>
                            <button
                                onClick={handleHomeClick}
                                title="Home"
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-[#eaf5f4] text-[#647683] hover:text-[#38a09e] transition-colors ml-1"
                            >
                                <Home size={17} />
                            </button>
                        </>
                    ) : (
                        /* On "inside" pages (not home) */
                        <>
                            {currentUser ? (
                                <>
                                    {/* Student ID badge */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eaf5f4] border border-[#38a09e]/30">
                                        <div className="h-2 w-2 rounded-full bg-[#38a09e] animate-pulse" />
                                        <span className="text-sm font-semibold text-[#193248]">{currentUser.studentId}</span>
                                        <span className="text-xs text-[#647683]">{currentUser.name?.split(' ')[0]}</span>
                                    </div>
                                    {/* Sign out icon */}
                                    <button
                                        onClick={handleSignout}
                                        title="Sign out"
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-red-50 text-[#647683] hover:text-red-500 transition-colors ml-2"
                                    >
                                        <LogOut size={17} />
                                    </button>
                                </>
                            ) : (
                                /* Logged out, but on an inside page (e.g., login route) */
                                <button
                                    onClick={handleHomeClick}
                                    title="Home"
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-[#eaf5f4] text-[#647683] hover:text-[#38a09e] transition-colors"
                                >
                                    <Home size={17} />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default NavBar;
