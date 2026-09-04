import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const ROLES_OPTIONS = [
  {
    value: 'viewer',
    label: 'Public Viewer / Citizen',
    description: 'View hazard maps, habitation risk scores & public alerts',
  },
  {
    value: 'field_officer',
    label: 'Field Officer / Ground Surveyor',
    description: 'Submit ground surveys, vulnerability data & site validations',
  },
  {
    value: 'analyst',
    label: 'Geotechnical Analyst / Researcher',
    description: 'Run risk simulations, carrying capacity & relocation engine',
  },
  {
    value: 'disaster_authority',
    label: 'Disaster Management Authority (DMA)',
    description: 'Approve relocation orders, allocate resources & declare red-zones',
  },
  {
    value: 'admin',
    label: 'System Administrator',
    description: 'Manage users, system configurations & authoritative datasets',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    role: 'viewer',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim()) {
      return setError('Please enter your full name.');
    }
    if (!form.email.trim()) {
      return setError('Please enter your email address.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name.trim(),
        role: form.role,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (res.success) {
        setSuccess(true);
        // Redirect to login after 1.5 seconds with email pre-filled
        setTimeout(() => {
          navigate('/login', {
            state: {
              email: form.email.trim().toLowerCase(),
              message: 'Account created successfully! Please sign in with your password.',
            },
          });
        }, 1200);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-white/10 backdrop-blur items-center justify-center text-3xl mb-3 shadow-inner border border-white/20">
            🛰️
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">BhuDan</h1>
          <p className="text-slate-300 text-sm mt-1">
            Intelligent Red-Zone & Relocation Decision Support System
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-7">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">Create your account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Register your profile to access risk analytics, maps, and relocation tools.
            </p>
          </div>

          {success && (
            <div className="mb-5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-3.5 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div>
                <div className="font-semibold">Account registered successfully!</div>
                <div className="text-xs text-emerald-600">Saved to database. Redirecting to sign in…</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label text-slate-700 font-semibold" htmlFor="register-name">
                Full Name
              </label>
              <input
                id="register-name"
                name="name"
                className="input"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rohan Rathod"
                required
              />
            </div>

            {/* Who are you? (Role) */}
            <div>
              <label className="label text-slate-700 font-semibold" htmlFor="register-role">
                Who are you? (Role / Identity)
              </label>
              <select
                id="register-role"
                name="role"
                className="input font-medium text-slate-800 bg-white"
                value={form.role}
                onChange={handleChange}
                required
              >
                {ROLES_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5 pl-0.5">
                {ROLES_OPTIONS.find((r) => r.value === form.role)?.description}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="label text-slate-700 font-semibold" htmlFor="register-email">
                Email Address
              </label>
              <input
                id="register-email"
                name="email"
                className="input"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password & Confirm Password in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-slate-700 font-semibold" htmlFor="register-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    name="password"
                    className="input pr-10"
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 select-none px-1"
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="label text-slate-700 font-semibold" htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              className="btn-primary w-full py-2.5 mt-2 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              type="submit"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span>Saving account to database…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          Smart India Hackathon 2026 · Secure Government Cloud Auth
        </div>
      </div>
    </div>
  );
}