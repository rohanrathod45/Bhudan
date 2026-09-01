import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // In-Memory state only — NO localStorage / sessionStorage
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to authenticate with real JWT from backend
  const authenticateDemoUser = useCallback(async () => {
    try {
      const res = await authApi.login('admin@bhudan.gov.in', 'Admin@12345');
      if (res.token && res.user) {
        setTokenState(res.token);
        setAuthToken(res.token);
        setUser(res.user);
      }
    } catch (e) {
      console.warn('[AuthContext] Auto-login fallback error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // On initial mount, automatically authenticate with backend to receive a real valid JWT token
  useEffect(() => {
    authenticateDemoUser();
  }, [authenticateDemoUser]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setTokenState(res.token);
      setAuthToken(res.token);
      setUser(res.user);
      return { ok: true, user: res.user };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please verify credentials.';
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
    setAuthToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u) => setUser(u), []);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    role: user?.role || 'viewer',
    can: (levelOrRole) => {
      const levels = ['viewer', 'field_officer', 'analyst', 'disaster_authority', 'admin'];
      const myIndex = levels.indexOf(user?.role || 'viewer');
      const targetIndex = Array.isArray(levelOrRole)
        ? levelOrRole.map((r) => levels.indexOf(r)).filter((i) => i >= 0)
        : [levels.indexOf(levelOrRole)];
      if (typeof levelOrRole === 'string' && levelOrRole.startsWith('>=')) {
        return myIndex >= levels.indexOf(levelOrRole.slice(2));
      }
      return targetIndex.some((i) => myIndex >= i);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}