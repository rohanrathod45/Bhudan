import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, dataApi, analysisApi } from '../../services/api';
import { Card, Badge, Spinner } from '../../components/ui';

const ROLES = ['viewer', 'field_officer', 'analyst', 'disaster_authority', 'admin'];

export default function Admin() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.list().then((r) => setUsers(r.data)).catch(() => []);
    analysisApi.meta().then(() => {}).catch(() => {});
    dataApi.habitations({}).then((r) => setStats({ habitations: r.count })).catch(() => setStats({ habitations: 0 }));
    dataApi.sites({}).then((r) => setStats((s) => ({ ...s, sites: r.count }))).catch(() => {});
    setLoading(false);
  }, []);

  const activeUsers = users.filter((u) => u.active !== false).length;

  if (role !== 'admin') {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>🚫 Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Admin · User & Data Management</h2>
          <p className="text-sm text-slate-500">SIH 2026 · Role-based access control</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total users" value={users.length} color="text-brand-600" />
        <Stat label="Active users" value={activeUsers} color="text-emerald-600" />
        <Stat label="Habitations" value={stats?.habitations || 0} color="text-risk-orange" />
        <Stat label="Safe sites" value={stats?.sites || 0} color="text-sky-500" />
      </div>

      {loading ? <Spinner /> : (
        <Card title="Users">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Designation</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-medium text-slate-800">{u.name}</td>
                    <td className="py-2 text-slate-600">{u.email}</td>
                    <td className="py-2">{roleBadge(u.role)}</td>
                    <td className="py-2 text-slate-600">{u.designation || '—'}</td>
                    <td className="py-2">{u.active === false ? <Badge tone="red">Disabled</Badge> : <Badge tone="green">Active</Badge>}</td>
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

function Stat({ label, value, color }) {
  return (
    <div className="card p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs uppercase text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function roleBadge(role) {
  const labels = { admin: 'Admin', disaster_authority: 'Disaster Authority', analyst: 'Analyst', field_officer: 'Field Officer', viewer: 'Viewer' };
  const tones = { admin: 'red', disaster_authority: 'orange', analyst: 'yellow', field_officer: 'blue', viewer: 'green' };
  return <Badge tone={tones[role] || 'slate'}>{labels[role] || role}</Badge>;
}