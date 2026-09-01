import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'field_officer', label: 'Field Officer' },
];

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1920&q=80'
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.register(form);
      if (res.success) {
        setDone(true);
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-x-hidden font-sans">
      {/* Background Slideshow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
        {BACKGROUND_IMAGES.map((url, index) => {
          const isActive = index === currentImgIndex;
          return (
            <div
              key={url}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={url}
                alt="Terrain"
                className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out"
                style={{ transform: isActive ? 'scale(1.08)' : 'scale(1.00)' }}
              />
            </div>
          );
        })}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 15, 30, 0.78) 0%, rgba(15, 23, 42, 0.72) 50%, rgba(20, 30, 60, 0.85) 100%)'
          }}
        />
      </div>

      <div className="relative z-30 w-full max-w-md my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 items-center justify-center text-3xl mb-2 shadow-xl">
            🛰️
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
            BhuDan Registration
          </h1>
        </div>

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
          <h2 className="text-xl font-bold text-white mb-1">Create an account</h2>
          <p className="text-xs text-slate-300 mb-5">Registration is limited to Viewer / Field Officer roles.</p>

          {done && (
            <div className="mb-4 text-sm bg-emerald-500/20 text-emerald-100 border border-emerald-400/40 rounded-xl px-4 py-3 backdrop-blur">
              Account created! Redirecting to sign in…
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm bg-red-500/20 text-red-100 border border-red-400/40 rounded-xl px-4 py-3 backdrop-blur">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
              <input
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(30, 41, 59, 0.75)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff' }}
              >
                {ROLES.map((r) => <option key={r.value} value={r.value} className="bg-slate-800 text-white">{r.label}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg cursor-pointer mt-2"
            >
              Register
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-white/10 text-center text-sm text-slate-300">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-300 font-semibold hover:text-brand-200 hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}