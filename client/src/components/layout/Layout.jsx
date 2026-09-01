import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Truck,
  Users,
  LogOut,
  Menu,
  X,
  Radio,
  UserCheck,
  ChevronDown
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'red-zones', label: 'Red Zones', icon: AlertTriangle },
  { id: 'safe-sites', label: 'Safe Sites', icon: ShieldCheck },
  { id: 'capacity', label: 'Capacity', icon: Scale },
  { id: 'relocation', label: 'Relocation', icon: Truck },
];

const ADMIN_NAV_ITEM = { id: 'admin', label: 'Admin', icon: Users };

export default function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const navList = can('admin') ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Scroll-spy using IntersectionObserver
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = navList.map((item) => document.getElementById(item.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [location.pathname, navList]);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const roleLabel = {
    admin: 'System Administrator',
    disaster_authority: 'Disaster Authority',
    analyst: 'Risk Analyst',
    field_officer: 'Field Officer',
    viewer: 'Public Viewer',
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Navigation Bar (Height 64px - 72px) */}
      <header className="sticky top-0 z-50 h-16 md:h-18 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-700/80 px-4 md:px-8 flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('dashboard');
            }}
            className="flex items-center gap-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform glow-blue">
              🛰️
            </div>
            <div>
              <div className="font-extrabold text-lg md:text-xl tracking-tight text-slate-100 font-heading flex items-center gap-2">
                <span>BhuDan</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                Disaster Decision Support
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Top Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id && location.pathname === '/';

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 group cursor-pointer ${
                  isActive
                    ? 'text-blue-400 bg-blue-500/10 font-semibold'
                    : 'text-slate-400 hover:text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span>{item.label}</span>
                {/* Animated Underline */}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Right: User Status & Profile Menu */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>NDMA Command Stream</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="font-semibold text-slate-100 text-xs truncate max-w-[110px]">{user?.name}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {roleLabel[user?.role] || user?.role}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 animate-fade-up">
                <div className="px-3 py-2 border-b border-slate-700 mb-1">
                  <p className="text-xs font-bold text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                    {user?.role?.replace(/_/g, ' ')}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden sticky top-16 z-40 bg-[#0B1120] border-b border-slate-700 px-4 py-4 space-y-2 animate-fade-up shadow-2xl">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id && location.pathname === '/';

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 uppercase text-sm">
                {user?.name?.[0] || 'U'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">{user?.name}</div>
                <div className="text-[10px] text-slate-400">{roleLabel[user?.role] || user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Page Scroll Container */}
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}