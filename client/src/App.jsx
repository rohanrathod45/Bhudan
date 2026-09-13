import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import MapView from './pages/map/MapView';
import RedZones from './pages/hazard/RedZones';
import Habitations from './pages/habitations/Habitations';
import SafeSites from './pages/safesites/SafeSites';
import CarryingCapacity from './pages/safesites/CarryingCapacity';
import Relocation from './pages/relocation/Relocation';
import Reports from './pages/reports/Reports';
import Admin from './pages/admin/Admin';

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="map" element={<MapView />} />
        <Route path="red-zones" element={<RedZones />} />
        <Route path="habitations" element={<Habitations />} />
        <Route path="habitations/:id" element={<Habitations />} />
        <Route path="sites" element={<SafeSites />} />
        <Route path="capacity" element={<CarryingCapacity />} />
        <Route path="relocation" element={<Relocation />} />
        <Route path="reports" element={<Reports />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}