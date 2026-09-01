import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';

function Protected({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#0B2447]">
        <div className="h-10 w-10 border-4 border-[#0B2447] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider">Connecting to BhuDan Disaster Intelligence Server…</p>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="map" element={<Dashboard />} />
        <Route path="red-zones" element={<Dashboard />} />
        <Route path="habitations" element={<Dashboard />} />
        <Route path="habitations/:id" element={<Dashboard />} />
        <Route path="sites" element={<Dashboard />} />
        <Route path="capacity" element={<Dashboard />} />
        <Route path="relocation" element={<Dashboard />} />
        <Route path="reports" element={<Dashboard />} />
        <Route path="admin" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}