import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [demoEmail, setDemoEmail] = useState('demo@nepalflow.com');
  const [demoName, setDemoName] = useState('Demo User');

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const res = await authAPI.devLogin({ email: demoEmail, name: demoName });
      login(res.data.token, res.data.user);
      toast.success('Welcome to NepalFlow! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col items-center justify-center px-4">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={`px-3 py-1 rounded text-sm ${i18n.language === 'en' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'}`}
        >EN</button>
        <button
          onClick={() => i18n.changeLanguage('ne')}
          className={`px-3 py-1 rounded text-sm font-nepali ${i18n.language === 'ne' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border'}`}
        >नेपाली</button>
      </div>

      {/* Hero Card */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white text-3xl font-bold mb-4 shadow-lg">
            N
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('app_name')}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('tagline')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{t('auth.login')}</h2>
            <p className="text-sm text-gray-500 mt-1">{t('auth.connect_account')}</p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <a
              href={`${API_URL}/auth/facebook`}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#1877F2] text-white rounded-xl font-medium hover:bg-[#166FE5] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {t('auth.login_with_facebook')}
            </a>

            <a
              href={`${API_URL}/auth/google`}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.login_with_google')}
            </a>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Demo Login (dev only) */}
          <div className="space-y-3">
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
              🚧 <strong>Demo Mode:</strong> For testing without OAuth setup
            </p>
            <input
              type="text"
              value={demoName}
              onChange={e => setDemoName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Your name"
            />
            <input
              type="email"
              value={demoEmail}
              onChange={e => setDemoEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Email"
            />
            <button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.dev_login')}
            </button>
          </div>
        </div>

        {/* Features teaser */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '📅', label: 'Schedule Posts' },
            { icon: '💬', label: 'Unified Inbox' },
            { icon: '📊', label: 'Analytics' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-gray-600 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
