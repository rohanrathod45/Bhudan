import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// Safe localStorage wrapper — Edge (tracking prevention / "Enhance your
// security on the web") can deny storage access on localhost, which would
// otherwise crash the whole app at startup with a SecurityError.
const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch {
      /* storage blocked — session-only mode */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(storage.get('bhudan_user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => storage.get('bhudan_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) storage.set('bhudan_token', token);
    else storage.remove('bhudan_token');
    if (user) storage.set('bhudan_user', JSON.stringify(user));
    else storage.remove('bhudan_user');
  }, [token, user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res.token);
      setUser(res.user);
      return { ok: true, user: res.user, token: res.token };
    } catch (err) {
      let msg = err?.response?.data?.message || err?.message;
      if (!msg || err.isDeploymentMisconfig) {
        if (err.isDeploymentMisconfig) {
          msg = err.message;
        } else if (err?.code === 'ERR_NETWORK' || !err?.response) {
          msg = 'Unable to reach backend server. Free-tier servers (like Render) take ~50s to wake up on first load, or verify VITE_API_URL in deployment settings.';
        } else if (err?.response?.status === 404) {
          msg = 'Backend endpoint not found (404). Please ensure VITE_API_URL is configured in your deployment settings.';
        } else {
          msg = 'Login failed. Please try again.';
        }
      }
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
      }
      return { ok: true, user: res.user, token: res.token, message: res.message };
    } catch (err) {
      let msg = err?.response?.data?.message || err?.message;
      if (!msg || err.isDeploymentMisconfig) {
        if (err.isDeploymentMisconfig) {
          msg = err.message;
        } else if (err?.code === 'ERR_NETWORK' || !err?.response) {
          msg = 'Unable to reach backend server. Free-tier servers (like Render) take ~50s to wake up on first load, or verify VITE_API_URL in deployment settings.';
        } else if (err?.response?.status === 404) {
          msg = 'Registration endpoint not found (404). Please ensure VITE_API_URL is configured in your deployment settings.';
        } else {
          msg = 'Registration failed. Please check your details and try again.';
        }
      }
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    storage.remove('bhudan_token');
    storage.remove('bhudan_user');
  }, []);

  const updateUser = useCallback((u) => setUser(u), []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    can: (levelOrRole) => {
      const levels = ['viewer', 'field_officer', 'analyst', 'disaster_authority', 'admin'];
      const myIndex = levels.indexOf(user?.role);
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