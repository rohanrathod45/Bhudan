import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

const BACKGROUND_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    title: 'Satellite Topography & Orbital Observation',
    category: 'Remote Sensing'
  },
  {
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1920&q=80',
    title: 'Inundation & Flood Risk Zone',
    category: 'Hydrological Hazard'
  },
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    title: 'Himalayan Slope Instability & Landslide Red-Zone',
    category: 'Geological Hazard'
  },
  {
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1920&q=80',
    title: 'Emergency Relief & Rescue Operations',
    category: 'Disaster Response'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
    title: 'Mountainous Habitation Carrying Capacity',
    category: 'Vulnerable Settlement'
  },
  {
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=80',
    title: 'Coastal Erosion & Surge Risk Watch',
    category: 'Maritime Hazard'
  }
];

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    authApi.demo().then((r) => setHint(r.accounts)).catch(() => {});
  }, []);

  // Preload all background imagery for smooth crossfade
  useEffect(() => {
    BACKGROUND_IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.url;
    });
  }, []);

  // Auto-rotating background image slideshow (5.5s interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.ok) navigate('/', { replace: true });
    else setError(res.message);
  };

  const quickFill = (em, pw) => {
    setEmail(em);
    setPassword(pw);
    setError('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden font-sans">
      {/* 1. BACKGROUND — Rotating Disaster/Terrain Imagery & Ken Burns Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
        {BACKGROUND_IMAGES.map((img, index) => {
          const isActive = index === currentImgIndex;
          return (
            <div
              key={img.url}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out"
                style={{
                  transform: isActive ? 'scale(1.08)' : 'scale(1.00)'
                }}
              />
            </div>
          );
        })}

        {/* Dark Gradient Overlay for Maximum Legibility */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 15, 30, 0.78) 0%, rgba(15, 23, 42, 0.72) 50%, rgba(20, 30, 60, 0.85) 100%)'
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-30 w-full max-w-md my-auto">
        {/* 4. LOGO & TITLE */}
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 items-center justify-center text-3xl mb-3 shadow-xl shadow-black/30 transform hover:scale-105 transition-transform duration-300">
            🛰️
          </div>
          <h1
            className="text-3xl font-extrabold text-white tracking-tight"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)' }}
          >
            BhuDan
          </h1>
          <p
            className="text-slate-200 text-sm mt-1 font-medium max-w-xs sm:max-w-sm mx-auto"
            style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.6)' }}
          >
            Intelligent Red-Zone & Relocation Decision Support
          </p>
        </div>

        {/* 2. LOGIN CARD — Glassmorphism Effect */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.10)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)'
          }}
          className="p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Sign in</h2>
            <span className="text-[11px] font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
              SIH 2026 Portal
            </span>
          </div>

          {error && (
            <div className="mb-5 text-sm bg-red-500/20 text-red-100 border border-red-400/40 rounded-xl px-4 py-3 backdrop-blur flex items-center space-x-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.gov.in"
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-brand-900/50 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
            >
              Sign in
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 text-center text-sm text-slate-300">
            New account?{' '}
            <Link to="/register" className="text-brand-300 font-semibold hover:text-brand-200 hover:underline transition-colors">
              Register
            </Link>
          </div>
        </div>

        {/* 3. DEMO ACCOUNTS BOX — Transparent Glass Effect */}
        {hint && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px'
            }}
            className="mt-4 p-4 text-slate-200 shadow-xl"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-300 mb-2.5 font-semibold">
              <span>Demo Accounts</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to quick-fill</span>
            </div>
            <div className="space-y-1.5">
              {hint.map((a) => (
                <button
                  key={a.role}
                  type="button"
                  onClick={() => quickFill(a.email, a.password)}
                  className="w-full flex items-center justify-between text-left text-xs bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg px-3 py-2 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                    <span className="capitalize font-medium text-white group-hover:text-brand-200">{a.role}</span>
                  </div>
                  <span className="text-slate-300 font-mono text-[11px] opacity-80 group-hover:opacity-100">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Slideshow Theme Indicator & Navigation Dots */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-300/80 px-1">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-mono text-slate-300 shrink-0">{BACKGROUND_IMAGES[currentImgIndex].category}</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate text-slate-400 hidden sm:inline">{BACKGROUND_IMAGES[currentImgIndex].title}</span>
          </div>
          <div className="flex space-x-1 shrink-0 ml-2">
            {BACKGROUND_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImgIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}