/**
 * Axios API client - centralized HTTP layer
 */

import axios, { AxiosRequestConfig } from 'axios';

const API_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
  devLogin:       (data: Record<string, string>)  => api.post('/auth/dev-login', data),
  getMe:          (token?: string) => api.get('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  updateLanguage: (lang: string)  => api.patch('/auth/me/language', { language: lang }),
  updateProfile:  (data: Record<string, unknown>)  => api.patch('/auth/me', data),
  getConfig:      ()      => api.get('/auth/config'),
};

// ─── Social Accounts ───────────────────────────────────────────────────────
export const accountsAPI = {
  list:            ()            => api.get('/api/accounts'),
  connectFacebook: (token: string) => api.post('/api/accounts/facebook', { userAccessToken: token }),
  disconnect:      (id: string)    => api.delete(`/api/accounts/${id}`),
  toggle:          (id: string)    => api.patch(`/api/accounts/${id}/toggle`),
};

// ─── Posts ─────────────────────────────────────────────────────────────────
export const postsAPI = {
  list:       (params?: Record<string, unknown>)   => api.get('/api/posts', { params }),
  calendar:   (params?: Record<string, unknown>)   => api.get('/api/posts/calendar', { params }),
  get:        (id: string)       => api.get(`/api/posts/${id}`),
  create:     (data: Record<string, unknown>)     => api.post('/api/posts', data),
  update:     (id: string, data: Record<string, unknown>) => api.patch(`/api/posts/${id}`, data),
  delete:     (id: string)       => api.delete(`/api/posts/${id}`),
  duplicate:  (id: string)       => api.post(`/api/posts/${id}/duplicate`),
  bulkImport: (formData: FormData) => api.post('/api/posts/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  exportCSV:  ()         => api.get('/api/posts/export', { responseType: 'blob' }),
};

// ─── Inbox ─────────────────────────────────────────────────────────────────
export const inboxAPI = {
  list:        (params?: Record<string, unknown>) => api.get('/api/inbox', { params }),
  unreadCount: ()       => api.get('/api/inbox/unread-count'),
  sync:        ()       => api.post('/api/inbox/sync'),
  markRead:    (id: string)     => api.patch(`/api/inbox/${id}/read`),
  markAllRead: ()       => api.patch('/api/inbox/mark-all-read'),
  reply:       (id: string, message: string) => api.post(`/api/inbox/${id}/reply`, { message }),
};

// ─── Analytics ─────────────────────────────────────────────────────────────
export const analyticsAPI = {
  overview:  (params?: Record<string, unknown>) => api.get('/api/analytics/overview', { params }),
  posts:     (params?: Record<string, unknown>) => api.get('/api/analytics/posts', { params }),
  chartData: (params?: Record<string, unknown>) => api.get('/api/analytics/chart-data', { params }),
  sync:      ()       => api.post('/api/analytics/sync'),
};

// ─── AI Content Generator (Groq-powered) ───────────────────────────────────
export const aiAPI = {
  status:                   ()       => api.get('/api/ai/status'),
  generate:                 (data: Record<string, unknown>)   => api.post('/api/ai/generate', data),
  rewrite:                  (data: Record<string, unknown>)   => api.post('/api/ai/rewrite', data),
  hashtags:                 (data: Record<string, unknown>)   => api.post('/api/ai/hashtags', data),
  replySuggestion:          (data: Record<string, unknown>)   => api.post('/api/ai/reply-suggestion', data),
  translate:                (data: Record<string, unknown>)   => api.post('/api/ai/translate', data),
  caption:                  (data: Record<string, unknown>)   => api.post('/api/ai/caption', data),
  autoResponderSuggestion:  (data: Record<string, unknown>)   => api.post('/api/ai/auto-responder-suggestion', data),
  bestTime:                 (params?: Record<string, unknown>) => api.get('/api/ai/best-time', { params }),
  insights:                 (params?: Record<string, unknown>) => api.get('/api/ai/insights', { params }),
  history:                  (params?: Record<string, unknown>) => api.get('/api/ai/history', { params }),
};

// ─── Content Templates ─────────────────────────────────────────────────────
export const templatesAPI = {
  list:   (params?: Record<string, unknown>)   => api.get('/api/templates', { params }),
  get:    (id: string)       => api.get(`/api/templates/${id}`),
  create: (data: Record<string, unknown>)     => api.post('/api/templates', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/templates/${id}`, data),
  delete: (id: string)       => api.delete(`/api/templates/${id}`),
  use:    (id: string, vars: Record<string, string>) => api.post(`/api/templates/${id}/use`, { variables: vars }),
};

// ─── Auto-Responders ───────────────────────────────────────────────────────
export const autoRespondersAPI = {
  list:   ()         => api.get('/api/auto-responders'),
  create: (data: Record<string, unknown>)     => api.post('/api/auto-responders', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/auto-responders/${id}`, data),
  delete: (id: string)       => api.delete(`/api/auto-responders/${id}`),
  toggle: (id: string)       => api.patch(`/api/auto-responders/${id}/toggle`),
  test:   (data: Record<string, unknown>)     => api.post('/api/auto-responders/test', data),
};

// ─── Notifications ─────────────────────────────────────────────────────────
export const notificationsAPI = {
  list:        (params?: Record<string, unknown>) => api.get('/api/notifications', { params }),
  unreadCount: ()       => api.get('/api/notifications/unread-count'),
  markRead:    (id: string)     => api.patch(`/api/notifications/${id}/read`),
  markAllRead: ()       => api.patch('/api/notifications/mark-all-read'),
  delete:      (id: string)     => api.delete(`/api/notifications/${id}`),
  clear:       ()       => api.delete('/api/notifications/clear'),
};

// ─── RSS Feeds ─────────────────────────────────────────────────────────────
export const rssAPI = {
  list:     ()       => api.get('/api/rss'),
  create:   (data: Record<string, unknown>)   => api.post('/api/rss', data),
  update:   (id: string, d: Record<string, unknown>)  => api.put(`/api/rss/${id}`, d),
  delete:   (id: string)     => api.delete(`/api/rss/${id}`),
  toggle:   (id: string)     => api.patch(`/api/rss/${id}/toggle`),
  fetch:    (id: string)     => api.post(`/api/rss/${id}/fetch`),
  postItem: (id: string, d: Record<string, unknown>)  => api.post(`/api/rss/${id}/post-item`, d),
};

// ─── Post Queue (Bulk Scheduler) ───────────────────────────────────────────
export const queueAPI = {
  list:       (params?: Record<string, unknown>) => api.get('/api/queue', { params }),
  add:        (data: Record<string, unknown>)   => api.post('/api/queue', data),
  bulkAdd:    (items: Record<string, unknown>[])  => api.post('/api/queue/bulk', { items }),
  update:     (id: string, d: Record<string, unknown>)  => api.patch(`/api/queue/${id}`, d),
  delete:     (id: string)     => api.delete(`/api/queue/${id}`),
  publishAll: ()       => api.post('/api/queue/publish-all'),
  clear:      (status?: string) => api.delete('/api/queue/clear', { params: { status } }),
};

export default api;
