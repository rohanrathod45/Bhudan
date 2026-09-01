import logoIcon from '../../assets/logo-icon.svg';
import { Lock, Mail, ArrowRight } from 'lucide-react';

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
    authApi.demo().then((r) => setHint(r.accounts)).catch(() => {
      setHint([
        { role: 'admin', email: 'admin@bhudan.gov.in', password: 'Admin@12345' },
        { role: 'disaster_authority', email: 'authority@bhudan.gov.in', password: 'Authority@12345' },
        { role: 'analyst', email: 'analyst@bhudan.gov.in', password: 'Analyst@12345' },
        { role: 'field_officer', email: 'officer@bhudan.gov.in', password: 'Officer@12345' },
      ]);
    });
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Strip */}
      <div className="bg-[#0B2447] text-white text-xs py-1.5 px-4 text-center border-b border-[#14356B]">
        <span>GOVERNMENT OF INDIA • NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)</span>
      </div>

      {/* Center Container */}
      <div className="max-w-md w-full mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <img src={logoIcon} alt="BhuDan Logo" className="h-14 w-14 mx-auto mb-3 drop-shadow-sm" />
          <h1 className="text-2xl font-extrabold text-[#0B2447] font-heading">
            BHUDAN PORTAL
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Intelligent Red-Zone & Relocation Decision Support
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-[#0B2447]">Officer Portal Sign-In</h2>
            <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              SIH 2026
            </span>
          </div>

          {error && (
            <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg p-3">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Official Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bhudan.gov.in"
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 font-semibold">
              <span>Sign In to Platform</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo Credentials Quick-Fill */}
          {hint && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Quick Demo Credentials (Click to Fill):
              </p>
              <div className="grid grid-cols-2 gap-2">
                {hint.map((a) => (
                  <button
                    key={a.role}
                    type="button"
                    onClick={() => quickFill(a.email, a.password)}
                    className="text-left text-xs bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2 rounded-lg transition cursor-pointer"
                  >
                    <p className="font-bold text-[#0B2447] capitalize">{a.role.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-500 truncate">{a.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-xs text-slate-500 pt-2">
            Need a new account?{' '}
            <Link to="/register" className="font-bold text-[#0B2447] hover:underline">
              Register Officer Profile
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