import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { inboxAPI } from './utils/api';

// Layout
import Sidebar from './components/Common/Sidebar';
import MobileNav from './components/Common/MobileNav';

// Core Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PostComposer from './components/Composer/PostComposer';
import UnifiedInbox from './components/Inbox/UnifiedInbox';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import ContentCalendar from './components/Calendar/ContentCalendar';
import AccountsPage from './components/Auth/AccountsPage';

// Advanced Feature Pages
import AIGeneratorPage from './pages/AIGeneratorPage';
import TemplatesPage from './pages/TemplatesPage';
import AutoRespondersPage from './pages/AutoRespondersPage';
import RSSFeedsPage from './pages/RSSFeedsPage';
import BulkQueuePage from './pages/BulkQueuePage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

// Auth callback handler for redirect-based OAuth (non-popup flow)
function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      localStorage.setItem('nepalflow_token', token);
      window.location.href = '/';
    } else {
      navigate('/login', { state: { error: error || 'Authentication failed' } });
    }
  }, []); // eslint-disable-line

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
    >
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/50 text-sm mt-4">Completing sign in…</p>
      </div>
    </div>
  );
}

// Protected layout wrapper
function AppLayout() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      inboxAPI.unreadCount()
        .then(res => setUnreadCount(res.data.unread))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar unreadCount={unreadCount} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Routes>
            {/* Core */}
            <Route path="/"              element={<DashboardPage />} />
            <Route path="/compose"       element={<PostComposer />} />
            <Route path="/inbox"         element={<UnifiedInbox />} />
            <Route path="/analytics"     element={<AnalyticsDashboard />} />
            <Route path="/calendar"      element={<ContentCalendar />} />
            <Route path="/accounts"      element={<AccountsPage />} />

            {/* Automation & AI */}
            <Route path="/ai-studio"       element={<AIGeneratorPage />} />
            <Route path="/templates"       element={<TemplatesPage />} />
            <Route path="/auto-responders" element={<AutoRespondersPage />} />
            <Route path="/rss-feeds"       element={<RSSFeedsPage />} />
            <Route path="/queue"           element={<BulkQueuePage />} />

            {/* Account */}
            <Route path="/notifications"   element={<NotificationsPage />} />
            <Route path="/settings"        element={<SettingsPage />} />

            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <MobileNav unreadCount={unreadCount} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}
    >
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          duration: 4000,
          style: {
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
