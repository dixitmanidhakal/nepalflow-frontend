/**
 * Axios API client - centralized HTTP layer
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nepalflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nepalflow_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  devLogin:       (data) => api.post('/auth/dev-login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateLanguage: (lang) => api.patch('/auth/me/language', { language: lang }),
};

// ─── Social Accounts ───────────────────────────────────────────────────────
export const accountsAPI = {
  list:            ()           => api.get('/api/accounts'),
  connectFacebook: (token)      => api.post('/api/accounts/facebook', { userAccessToken: token }),
  disconnect:      (id)         => api.delete(`/api/accounts/${id}`),
  toggle:          (id)         => api.patch(`/api/accounts/${id}/toggle`),
};

// ─── Posts ─────────────────────────────────────────────────────────────────
export const postsAPI = {
  list:        (params)     => api.get('/api/posts', { params }),
  calendar:    (params)     => api.get('/api/posts/calendar', { params }),
  get:         (id)         => api.get(`/api/posts/${id}`),
  create:      (data)       => api.post('/api/posts', data),
  update:      (id, data)   => api.patch(`/api/posts/${id}`, data),
  delete:      (id)         => api.delete(`/api/posts/${id}`),
  bulkImport:  (formData)   => api.post('/api/posts/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportCSV:   ()           => api.get('/api/posts/export', { responseType: 'blob' }),
};

// ─── Inbox ─────────────────────────────────────────────────────────────────
export const inboxAPI = {
  list:         (params) => api.get('/api/inbox', { params }),
  unreadCount:  ()       => api.get('/api/inbox/unread-count'),
  sync:         ()       => api.post('/api/inbox/sync'),
  markRead:     (id)     => api.patch(`/api/inbox/${id}/read`),
  markAllRead:  ()       => api.patch('/api/inbox/mark-all-read'),
  reply:        (id, message) => api.post(`/api/inbox/${id}/reply`, { message }),
};

// ─── Analytics ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview:   (params) => api.get('/api/analytics/overview', { params }),
  posts:      (params) => api.get('/api/analytics/posts', { params }),
  chartData:  (params) => api.get('/api/analytics/chart-data', { params }),
  sync:       ()       => api.post('/api/analytics/sync'),
};

export default api;
