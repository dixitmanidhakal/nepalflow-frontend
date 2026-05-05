/**
 * Axios API client - centralized HTTP layer
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
  devLogin:       (data)  => api.post('/auth/dev-login', data),
  getMe:          (token) => api.get('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  updateLanguage: (lang)  => api.patch('/auth/me/language', { language: lang }),
  updateProfile:  (data)  => api.patch('/auth/me', data),
};

// ─── Social Accounts ───────────────────────────────────────────────────────
export const accountsAPI = {
  list:            ()      => api.get('/api/accounts'),
  connectFacebook: (token) => api.post('/api/accounts/facebook', { userAccessToken: token }),
  disconnect:      (id)    => api.delete(`/api/accounts/${id}`),
  toggle:          (id)    => api.patch(`/api/accounts/${id}/toggle`),
};

// ─── Posts ─────────────────────────────────────────────────────────────────
export const postsAPI = {
  list:       (params)   => api.get('/api/posts', { params }),
  calendar:   (params)   => api.get('/api/posts/calendar', { params }),
  get:        (id)       => api.get(`/api/posts/${id}`),
  create:     (data)     => api.post('/api/posts', data),
  update:     (id, data) => api.patch(`/api/posts/${id}`, data),
  delete:     (id)       => api.delete(`/api/posts/${id}`),
  bulkImport: (formData) => api.post('/api/posts/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  exportCSV:  ()         => api.get('/api/posts/export', { responseType: 'blob' }),
};

// ─── Inbox ─────────────────────────────────────────────────────────────────
export const inboxAPI = {
  list:        (params) => api.get('/api/inbox', { params }),
  unreadCount: ()       => api.get('/api/inbox/unread-count'),
  sync:        ()       => api.post('/api/inbox/sync'),
  markRead:    (id)     => api.patch(`/api/inbox/${id}/read`),
  markAllRead: ()       => api.patch('/api/inbox/mark-all-read'),
  reply:       (id, message) => api.post(`/api/inbox/${id}/reply`, { message }),
};

// ─── Analytics ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview:  (params) => api.get('/api/analytics/overview', { params }),
  posts:     (params) => api.get('/api/analytics/posts', { params }),
  chartData: (params) => api.get('/api/analytics/chart-data', { params }),
  sync:      ()       => api.post('/api/analytics/sync'),
};

// ─── AI Content Generator ──────────────────────────────────────────────────
export const aiAPI = {
  generate:  (data)   => api.post('/api/ai/generate', data),
  hashtags:  (data)   => api.post('/api/ai/hashtags', data),
  bestTime:  (params) => api.get('/api/ai/best-time', { params }),
  insights:  (params) => api.get('/api/ai/insights', { params }),
  history:   (params) => api.get('/api/ai/history', { params }),
};

// ─── Content Templates ─────────────────────────────────────────────────────
export const templatesAPI = {
  list:   (params)   => api.get('/api/templates', { params }),
  get:    (id)       => api.get(`/api/templates/${id}`),
  create: (data)     => api.post('/api/templates', data),
  update: (id, data) => api.put(`/api/templates/${id}`, data),
  delete: (id)       => api.delete(`/api/templates/${id}`),
  use:    (id, vars) => api.post(`/api/templates/${id}/use`, { variables: vars }),
};

// ─── Auto-Responders ───────────────────────────────────────────────────────
export const autoRespondersAPI = {
  list:   ()         => api.get('/api/auto-responders'),
  create: (data)     => api.post('/api/auto-responders', data),
  update: (id, data) => api.put(`/api/auto-responders/${id}`, data),
  delete: (id)       => api.delete(`/api/auto-responders/${id}`),
  toggle: (id)       => api.patch(`/api/auto-responders/${id}/toggle`),
  test:   (data)     => api.post('/api/auto-responders/test', data),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationsAPI = {
  list:        (params) => api.get('/api/notifications', { params }),
  unreadCount: ()       => api.get('/api/notifications/unread-count'),
  markRead:    (id)     => api.patch(`/api/notifications/${id}/read`),
  markAllRead: ()       => api.patch('/api/notifications/mark-all-read'),
  delete:      (id)     => api.delete(`/api/notifications/${id}`),
  clear:       ()       => api.delete('/api/notifications/clear'),
};

// ─── RSS Feeds ─────────────────────────────────────────────────────────────
export const rssAPI = {
  list:     ()       => api.get('/api/rss'),
  create:   (data)   => api.post('/api/rss', data),
  update:   (id, d)  => api.put(`/api/rss/${id}`, d),
  delete:   (id)     => api.delete(`/api/rss/${id}`),
  toggle:   (id)     => api.patch(`/api/rss/${id}/toggle`),
  fetch:    (id)     => api.post(`/api/rss/${id}/fetch`),
  postItem: (id, d)  => api.post(`/api/rss/${id}/post-item`, d),
};

// ─── Post Queue (Bulk Scheduler) ───────────────────────────────────────────
export const queueAPI = {
  list:       (params) => api.get('/api/queue', { params }),
  add:        (data)   => api.post('/api/queue', data),
  bulkAdd:    (items)  => api.post('/api/queue/bulk', { items }),
  update:     (id, d)  => api.patch(`/api/queue/${id}`, d),
  delete:     (id)     => api.delete(`/api/queue/${id}`),
  publishAll: ()       => api.post('/api/queue/publish-all'),
  clear:      (status) => api.delete('/api/queue/clear', { params: { status } }),
};

export default api;
