import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/map', label: 'GIS Map', icon: '🗺️' },
  { to: '/red-zones', label: 'Red Zones', icon: '🚨' },
  { to: '/habitations', label: 'Habitations', icon: '🏘️' },
  { to: '/sites', label: 'Safe Sites', icon: '🏕️' },
  { to: '/capacity', label: 'Carrying Capacity', icon: '⚖️' },
  { to: '/relocation', label: 'Relocation', icon: '🚌' },
  { to: '/reports', label: 'Reports', icon: '📄' },
];

const ADMIN_NAV = [{ to: '/admin', label: 'Admin · Users', icon: '👥' }];

export default function Layout() {
  const { user, role, logout, can } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Admin',
    disaster_authority: 'Disaster Authority',
    analyst: 'Analyst',
    field_officer: 'Field Officer',
    viewer: 'Viewer',
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-900 text-white flex flex-col transform transition-transform lg:translate-x-0 lg:static ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500 flex items-center justify-center text-xl">🛰️</div>
            <div>
              <div className="font-extrabold text-lg leading-tight">BhuDan</div>
              <div className="text-xs text-slate-300">Risk & Relocation Decision Support</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {can('admin') && ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center font-bold uppercase">
              {user?.name?.[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-xs text-slate-300">{roleLabel[user?.role]}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="mt-3 w-full text-sm text-slate-300 hover:text-white text-left px-1">
            ← Logout
          </button>
        </div>
      </aside>

      {/* overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((v) => !v)} className="lg:hidden btn btn-outline px-2 py-1">☰</button>
            <h1 className="text-lg font-bold text-slate-800 hidden sm:block">Hazard Risk & Relocation System</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="hidden md:inline">SIH 2026 · Decision Support</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="online" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}