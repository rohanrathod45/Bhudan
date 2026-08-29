import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const ROLES = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'field_officer', label: 'Field Officer' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Create an account</h2>
        <p className="text-sm text-slate-500 mb-4">Registration is limited to Viewer / Field Officer roles.</p>

        {done && (
          <div className="mb-4 text-sm bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg px-3 py-2">
            Account created! Redirecting to sign in…
          </div>
        )}
        {error && <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className="btn-primary w-full" type="submit">Register</button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}