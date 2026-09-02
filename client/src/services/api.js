import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request when present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhudan_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, clear the stale token so the app returns to login cleanly.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('bhudan_token');
      localStorage.removeItem('bhudan_user');
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email, password) => api.post('/api/auth/login', { email, password }).then((r) => r.data),
  register: (payload) => api.post('/api/auth/register', payload).then((r) => r.data),
  me: () => api.get('/api/auth/me').then((r) => r.data),
  demo: () => api.get('/api/auth/demo').then((r) => r.data),
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