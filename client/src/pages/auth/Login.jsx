import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hint, setHint] = useState(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    authApi.demo().then((r) => setHint(r.accounts)).catch(() => {});
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/10 items-center justify-center text-3xl mb-3">🛰️</div>
          <h1 className="text-2xl font-extrabold text-white">BhuDan</h1>
          <p className="text-slate-300 text-sm">Intelligent Red-Zone & Relocation Decision Support</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Sign in</h2>
          {error && <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.gov.in" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn-primary w-full" type="submit">Sign in</button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            New account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">Register</Link>
          </div>
        </div>

        {hint && (
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 text-slate-200">
            <div className="text-xs uppercase tracking-wide text-slate-300 mb-2">Demo accounts</div>
            <div className="space-y-1">
              {hint.map((a) => (
                <button
                  key={a.role}
                  onClick={() => quickFill(a.email, a.password)}
                  className="w-full text-left text-xs hover:bg-white/10 rounded px-2 py-1 transition"
                >
                  <span className="capitalize font-semibold">{a.role}</span>
                  <span className="text-slate-400"> · {a.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}