import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { ShieldAlert, User, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';

const ROLES = [
  { value: 'viewer', label: 'Public Viewer' },
  { value: 'field_officer', label: 'Field Officer' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'field_officer' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Strip */}
      <div className="bg-[#0B2447] text-white text-xs py-1.5 px-4 text-center border-b border-[#14356B]">
        <span>GOVERNMENT OF INDIA • NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)</span>
      </div>

      {/* Center Container */}
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-full bg-[#0B2447] items-center justify-center text-[#F59E0B] shadow-md border-2 border-[#F59E0B] mb-3">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B2447] font-heading">
            BHUDAN PORTAL
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Officer & User Account Registration
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-[#0B2447]">Register New Profile</h2>
            <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              SIH 2026
            </span>
          </div>

          {done && (
            <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-3">
              ✓ Account created successfully! Redirecting to sign in…
            </div>
          )}

          {error && (
            <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Officer Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Officer Full Name"
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">Official Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="officer@bhudan.gov.in"
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">Password (Min 8 Chars)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">Access Role</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="select pl-9 font-semibold text-[#0B2447]"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 font-semibold mt-2">
              <span>Register Account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-[#0B2447] hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="bg-[#06162C] text-slate-400 text-[11px] py-3 text-center border-t border-slate-800">
        Smart India Hackathon 2026 • BhuDan Disaster Decision Support Platform
      </div>
    </div>
  );
}