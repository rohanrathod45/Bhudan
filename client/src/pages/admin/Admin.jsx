import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, dataApi, analysisApi } from '../../services/api';
import { Card, StatCard, Badge, Spinner } from '../../components/ui';
import { Users, UserCheck, ShieldCheck, Home, Tent, Lock } from 'lucide-react';

const ROLES = ['viewer', 'field_officer', 'analyst', 'disaster_authority', 'admin'];

export default function Admin() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.list().then((r) => setUsers(r.data || [])).catch(() => []);
    dataApi.habitations({}).then((r) => setStats((s) => ({ ...s, habitations: r.count }))).catch(() => {});
    dataApi.sites({}).then((r) => setStats((s) => ({ ...s, sites: r.count }))).catch(() => {});
    setLoading(false);
  }, []);

  const activeUsers = users.filter((u) => u.active !== false).length;

  if (role !== 'admin') {
    return (
      <div className="glass-card p-12 text-center text-slate-300 max-w-md mx-auto my-12 space-y-3">
        <Lock className="h-12 w-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Access Restricted</h3>
        <p className="text-xs text-slate-400">
          The Admin Panel is limited to System Administrator accounts. Your current role is <span className="font-bold uppercase text-brand-300">{role}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Admin Panel • User & Access Control</span>
            <Badge tone="red">System Admin</Badge>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            SIH 2026 Platform • Role-based access governance & system health
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Registered Users" value={users.length} icon={Users} color="text-brand-300" />
        <StatCard label="Active Accounts" value={activeUsers} icon={UserCheck} color="text-emerald-400" />
        <StatCard label="Habitations Database" value={stats?.habitations || 0} icon={Home} color="text-amber-400" />
        <StatCard label="Safe Shelters Database" value={stats?.sites || 0} icon={Tent} color="text-sky-400" />
      </div>

      {loading ? (
        <Spinner label="Loading user registry…" />
      ) : (
        <Card title="System User Registry & Roles" subtitle="Managed accounts across Disaster Authority, Field Officers, Analysts & Viewers">
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 font-semibold">User Name</th>
                  <th className="py-3 px-3 font-semibold">Email</th>
                  <th className="py-3 px-3 font-semibold">Role</th>
                  <th className="py-3 px-3 font-semibold">Designation</th>
                  <th className="py-3 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{u.name}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{u.email}</td>
                    <td className="py-3 px-3">{roleBadge(u.role)}</td>
                    <td className="py-3 px-3 text-slate-300">{u.designation || 'NDMA Officer'}</td>
                    <td className="py-3 px-3 text-right">
                      {u.active === false ? <Badge tone="red">Disabled</Badge> : <Badge tone="green">Active</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function roleBadge(role) {
  const labels = {
    admin: 'Admin',
    disaster_authority: 'Disaster Authority',
    analyst: 'Analyst',
    field_officer: 'Field Officer',
    viewer: 'Viewer',
  };
  const tones = {
    admin: 'red',
    disaster_authority: 'orange',
    analyst: 'yellow',
    field_officer: 'brand',
    viewer: 'green',
  };
  return <Badge tone={tones[role] || 'slate'}>{labels[role] || role}</Badge>;
}