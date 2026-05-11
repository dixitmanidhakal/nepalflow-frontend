import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const SHOW_DEMO = process.env.REACT_APP_SHOW_DEMO_LOGIN !== 'false';

const DEFAULT_CONFIG: Record<string, boolean> = { facebook: true, instagram: true, tiktok: true, google: true, demo: true };

function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  style: React.CSSProperties;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

function SocialButton({ icon, label, style, onClick, loading, disabled }: SocialButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
      style={style}
    >
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
        {loading ? <Spinner size={16} /> : icon}
      </span>
      <span className="flex-1 text-center">{label}</span>
    </button>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [demoEmail, setDemoEmail] = useState('demo@nepalflow.com');
  const [demoName, setDemoName] = useState('Demo User');
  const [showDemo, setShowDemo] = useState(false);
  const [authConfig, setAuthConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    authAPI.getConfig()
      .then((res: { data: Record<string, boolean> }) => setAuthConfig(res.data))
      .catch(() => {});
  }, []);

  const openOAuthPopup = (provider: string) => {
    if (!authConfig[provider]) {
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      const credMap: Record<string, string> = {
        facebook:  'FACEBOOK_APP_ID + FACEBOOK_APP_SECRET',
        instagram: 'FACEBOOK_APP_ID + FACEBOOK_APP_SECRET',
        tiktok:    'TIKTOK_CLIENT_KEY + TIKTOK_CLIENT_SECRET',
        google:    'GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET',
      };
      toast.error(
        `${providerName} not configured.\nAdd ${credMap[provider] || 'credentials'} to backend .env`,
        { duration: 6000, style: { maxWidth: 400 } }
      );
      return;
    }

    setLoadingProvider(provider);
    const width = 520, height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `${API_URL}/auth/${provider}`,
      `${provider}_oauth`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (!event.data?.type || !['OAUTH_SUCCESS', 'OAUTH_ERROR'].includes(event.data.type)) return;
      window.removeEventListener('message', handleMessage);

      if (event.data.type === 'OAUTH_ERROR') {
        toast.error(event.data.message || `${provider} login failed`, { duration: 6000, style: { maxWidth: 400 } });
        setLoadingProvider(null);
        return;
      }

      try {
        const res = await authAPI.getMe(event.data.token);
        login(event.data.token, res.data.user);
        toast.success(`Welcome! Connected with ${provider} 🎉`);
        navigate('/');
      } catch {
        login(event.data.token, undefined);
        navigate('/');
      }
      setLoadingProvider(null);
    };
    window.addEventListener('message', handleMessage);

    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        setLoadingProvider(null);
      }
    }, 500);
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProvider('demo');
    try {
      const res = await authAPI.devLogin({ email: demoEmail, name: demoName });
      login(res.data.token, res.data.user);
      toast.success('Welcome to NepalFlow! 🎉');
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Login failed');
    } finally {
      setLoadingProvider(null);
    }
  };

  const isLoading = loadingProvider !== null;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #24243e 100%)' }}
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #f43f5e, transparent)' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="absolute top-5 right-5 z-20 flex gap-2">
        {[{ code: 'en', label: 'EN', flag: '🇬🇧' }, { code: 'ne', label: 'NE', flag: '🇳🇵' }].map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => i18n.changeLanguage(code)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              i18n.language === code
                ? 'text-white border border-white/30 bg-white/15 backdrop-blur-sm'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {flag} {label}
          </button>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div
          className="absolute -inset-px rounded-3xl opacity-40 blur-sm pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6, #06b6d4)' }}
        />

        <div
          className="relative rounded-3xl p-8 border border-white/10 shadow-2xl"
          style={{ background: 'rgba(15, 12, 41, 0.7)', backdropFilter: 'blur(24px)' }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl"
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Nepal<span style={{ color: '#f43f5e' }}>Flow</span>
            </h1>
            <p className="text-white/40 text-sm mt-1 font-medium">
              {t('tagline', 'Social Media Automation for Nepal')}
            </p>
          </div>

          <div className="space-y-3 mb-5">
            <SocialButton
              icon={<GoogleIcon />}
              label={loadingProvider === 'google' ? 'Connecting...' : authConfig.google ? 'Continue with Google' : 'Continue with Google (setup required)'}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', opacity: authConfig.google ? 1 : 0.55 }}
              onClick={() => openOAuthPopup('google')}
              loading={loadingProvider === 'google'}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-base mt-0.5">📘</span>
            <p className="text-white/40 text-xs leading-relaxed">
              Connect your <span className="text-white/60 font-semibold">Facebook, Instagram & TikTok</span> pages after sign-in from <span className="text-white/60 font-semibold">Settings → Accounts</span>
            </p>
          </div>

          {SHOW_DEMO && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/25 text-xs font-medium tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={() => setShowDemo(v => !v)}
                className="w-full py-3 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-sm font-medium transition-all duration-200"
              >
                {showDemo ? '✕ Hide Demo' : '🚀 Try Demo — No account needed'}
              </button>

              {showDemo && (
                <form onSubmit={handleDemoLogin} className="mt-3 space-y-3 animate-fade-in">
                  <input
                    type="text"
                    value={demoName}
                    onChange={e => setDemoName(e.target.value)}
                    placeholder="Display name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-rose-500/40 transition-all"
                  />
                  <input
                    type="email"
                    value={demoEmail}
                    onChange={e => setDemoEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-rose-500/40 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
                  >
                    {loadingProvider === 'demo'
                      ? <span className="flex items-center justify-center gap-2"><Spinner /> Signing in…</span>
                      : 'Sign in with Demo Account'}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-6 flex items-center justify-center gap-3 text-white/20 text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure OAuth
            </span>
            <span>·</span>
            <span>No password stored</span>
            <span>·</span>
            <span>🇳🇵 Made for Nepal</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {[
            { icon: '📅', label: 'Schedule Posts' },
            { icon: '💬', label: 'Unified Inbox' },
            { icon: '📊', label: 'Analytics' },
            { icon: '🗓️', label: 'Content Calendar' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              {icon} {label}
            </span>
          ))}
        </div>

        <p className="text-center text-white/15 text-xs mt-5">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease-out; }
      `}</style>
    </div>
  );
}
