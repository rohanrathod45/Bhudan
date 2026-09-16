import axios from 'axios';

let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
// Strip trailing /api if user configured VITE_API_URL with it, preventing double /api/api/... paths
if (rawApiUrl.endsWith('/api')) {
  rawApiUrl = rawApiUrl.slice(0, -4);
}
const API_BASE = rawApiUrl;

if (import.meta.env.PROD && !API_BASE) {
  console.warn(
    '[BhuDan API] VITE_API_URL is not configured in production build! If your backend is hosted separately (e.g. Render), please configure VITE_API_URL in your hosting platform environment variables.'
  );
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s timeout accommodates Render/free-tier cold starts
});

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhudan_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: Detect HTML responses from SPA rewrites and handle 401s cleanly
api.interceptors.response.use(
  (res) => {
    // If an API call returned an HTML document (SPA rewrite on Vercel/Netlify due to missing VITE_API_URL)
    if (
      typeof res.data === 'string' &&
      (res.data.toLowerCase().includes('<!doctype html') || res.data.toLowerCase().includes('<html'))
    ) {
      const err = new Error(
        'Backend server could not be reached. If deployed, please set VITE_API_URL to your deployed backend URL (e.g. https://your-server.onrender.com).'
      );
      err.isDeploymentMisconfig = true;
      return Promise.reject(err);
    }
    return res;
  },
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('bhudan_token');
      localStorage.removeItem('bhudan_user');
    }
    return Promise.reject(err);
  }
);

export const healthApi = {
  check: () => api.get('/health').then((r) => r.data),
};

export const authApi = {
  status: () => api.get('/api/auth/status').then((r) => r.data),
  login: (email, password) => api.post('/api/auth/login', { email, password }).then((r) => r.data),
  register: (payload) => api.post('/api/auth/register', payload).then((r) => r.data),
  me: () => api.get('/api/auth/me').then((r) => r.data),
};

export const analysisApi = {
  districtAnalysis: (district) => api.get('/api/analysis/district', { params: { district } }).then((r) => r.data),
  habitation: (id) => api.get(`/api/analysis/habitation/${id}`).then((r) => r.data),
  redZones: (district) => api.get('/api/analysis/red-zones', { params: { district } }).then((r) => r.data),
  capacity: (district) => api.get('/api/analysis/capacity', { params: { district } }).then((r) => r.data),
  relocation: (district) => api.get('/api/analysis/relocation', { params: { district } }).then((r) => r.data),
  hazards: () => api.get('/api/analysis/hazards').then((r) => r.data),
  meta: () => api.get('/api/analysis/meta').then((r) => r.data),
  districts: (params) => api.get('/api/analysis/districts', { params }).then((r) => r.data),
};

export const dataApi = {
  habitations: (params) => api.get('/api/habitations', { params }).then((r) => r.data),
  habitation: (id) => api.get(`/api/habitations/${id}`).then((r) => r.data),
  createHabitation: (payload) => api.post('/api/habitations', payload).then((r) => r.data),
  updateHabitation: (id, payload) => api.put(`/api/habitations/${id}`, payload).then((r) => r.data),
  deleteHabitation: (id) => api.delete(`/api/habitations/${id}`).then((r) => r.data),
  sites: (params) => api.get('/api/sites', { params }).then((r) => r.data),
  createSite: (payload) => api.post('/api/sites', payload).then((r) => r.data),
  updateSite: (id, payload) => api.put(`/api/sites/${id}`, payload).then((r) => r.data),
  deleteSite: (id) => api.delete(`/api/sites/${id}`).then((r) => r.data),
};

export const relocationApi = {
  list: (district) => api.get('/api/relocation', { params: { district } }).then((r) => r.data),
  generate: (district) => api.post('/api/relocation/generate', { district }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/api/relocation/${id}/status`, { status }).then((r) => r.data),
  delete: (id) => api.delete(`/api/relocation/${id}`).then((r) => r.data),
};

export const liveApi = {
  weather: (params) => api.get('/api/live/weather', { params }).then((r) => r.data),
  seismic: (params) => api.get('/api/live/seismic', { params }).then((r) => r.data),
  alerts: () => api.get('/api/live/alerts').then((r) => r.data),
  syncDistrict: (district, state) => api.post('/api/live/sync', { district, state }).then((r) => r.data),
  status: () => api.get('/api/live/status').then((r) => r.data),
};

export const userApi = {
  list: () => api.get('/api/users').then((r) => r.data),
  create: (payload) => api.post('/api/users', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/users/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/users/${id}`).then((r) => r.data),
};

export default api;