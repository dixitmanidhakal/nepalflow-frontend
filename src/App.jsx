import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { inboxAPI } from './utils/api';

// Layout
import Sidebar from './components/Common/Sidebar';
import MobileNav from './components/Common/MobileNav';

// Pages & Components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PostComposer from './components/Composer/PostComposer';
import UnifiedInbox from './components/Inbox/UnifiedInbox';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import ContentCalendar from './components/Calendar/ContentCalendar';
import AccountsPage from './components/Auth/AccountsPage';

// Auth callback handler
function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Decode basic user info from token (in real app fetch /auth/me)
      localStorage.setItem('nepalflow_token', token);
      window.location.href = '/';
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
    </div>
  );
}

// Protected layout wrapper
function AppLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Poll unread count every 60 seconds
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
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <Routes>
          <Route path="/"          element={<DashboardPage />} />
          <Route path="/compose"   element={<PostComposer />} />
          <Route path="/inbox"     element={<UnifiedInbox />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/calendar"  element={<ContentCalendar />} />
          <Route path="/accounts"  element={<AccountsPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNav unreadCount={unreadCount} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">N</div>
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
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
          className: 'text-sm',
          duration: 4000,
          style: { borderRadius: '12px', padding: '12px 16px' },
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
