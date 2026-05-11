import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { accountsAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

interface Account {
  id: string;
  platform: string;
  account_name?: string;
  profile_pic?: string;
  is_active: number | boolean;
}

interface PlatformConfig {
  name: string;
  gradient: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  description: string;
  provider: string;
}

const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  facebook: {
    name: 'Facebook',
    gradient: 'linear-gradient(135deg, #1877f2, #0d5cbf)',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    icon: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    description: 'Schedule posts to Facebook Pages, reply to comments and DMs',
    provider: 'facebook',
  },
  instagram: {
    name: 'Instagram',
    gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    icon: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    description: 'Publish to Instagram Business accounts, manage comments',
    provider: 'instagram',
  },
  tiktok: {
    name: 'TikTok',
    gradient: 'linear-gradient(135deg, #161616, #2dd4bf, #ee1d52)',
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    icon: (
      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/>
      </svg>
    ),
    description: 'Schedule TikTok videos and track video performance',
    provider: 'tiktok',
  },
};

interface PlatformCardProps {
  config: PlatformConfig;
  accounts: Account[];
  onConnect: (provider: string) => void;
  onDisconnect: (id: string) => void;
  onToggle: (id: string) => void;
  connecting: string | null;
}

function PlatformCard({ config, accounts, onConnect, onDisconnect, onToggle, connecting }: PlatformCardProps) {
  const platformAccounts = accounts.filter(a => a.platform === config.provider);
  const isConnected = platformAccounts.length > 0;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-6 space-y-4`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: config.gradient }}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{config.name}</h3>
            {isConnected && (
              <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                ✓ Connected ({platformAccounts.length})
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{config.description}</p>
        </div>
        {/* Connect / Add button */}
        <button
          onClick={() => onConnect(config.provider)}
          disabled={connecting === config.provider}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ background: config.gradient }}
        >
          {connecting === config.provider ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {isConnected ? 'Add Account' : 'Connect'}
            </>
          )}
        </button>
      </div>

      {/* Connected accounts */}
      {platformAccounts.map(account => (
        <div
          key={account.id}
          className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-white shadow-sm"
        >
          {account.profile_pic ? (
            <img src={account.profile_pic} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: config.gradient }}
            >
              {account.account_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{account.account_name}</p>
            <p className="text-xs text-gray-400 capitalize">{account.platform} account</p>
          </div>

          {/* Active toggle */}
          <button
            onClick={() => onToggle(account.id)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
              account.is_active ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
            title={account.is_active ? 'Active — click to pause' : 'Inactive — click to activate'}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
              account.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
            }`} />
          </button>

          {/* Disconnect */}
          <button
            onClick={() => onDisconnect(account.id)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
            title="Disconnect"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {!isConnected && (
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click Connect to authorize via secure OAuth — no password required
        </p>
      )}
    </div>
  );
}

export default function AccountsPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showFbToken, setShowFbToken] = useState(false);
  const [fbToken, setFbToken] = useState('');
  const [tokenConnecting, setTokenConnecting] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.list();
      setAccounts(res.data.accounts);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleConnect = (provider: string) => {
    setConnecting(provider);
    const width = 520, height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `${API_URL}/auth/${provider}`,
      `${provider}_connect`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (!event.data?.type || !['OAUTH_SUCCESS', 'OAUTH_ERROR'].includes(event.data.type)) return;
      window.removeEventListener('message', handleMessage);

      if (event.data.type === 'OAUTH_ERROR') {
        toast.error(event.data.message || `${provider} connection failed`, { duration: 7000, style: { maxWidth: 420 } });
        setConnecting(null);
        return;
      }

      try {
        const res = await authAPI.getMe(event.data.token);
        auth?.login(event.data.token, res.data.user);
        await fetchAccounts();
        toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully! 🎉`);
      } catch {
        await fetchAccounts();
        toast.success('Account connected!');
      }
      setConnecting(null);
    };
    window.addEventListener('message', handleMessage);

    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        setConnecting(null);
      }
    }, 500);
  };

  const handleFbTokenConnect = async () => {
    if (!fbToken.trim()) return;
    setTokenConnecting(true);
    try {
      const res = await accountsAPI.connectFacebook(fbToken.trim());
      toast.success(res.data.message || 'Connected Facebook pages!');
      setFbToken('');
      setShowFbToken(false);
      await fetchAccounts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Connection failed');
    } finally {
      setTokenConnecting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!window.confirm("Disconnect this account? Scheduled posts will remain but won't publish.")) return;
    try {
      await accountsAPI.disconnect(id);
      toast.success('Account disconnected');
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch {
      toast.error('Failed to disconnect account');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await accountsAPI.toggle(id);
      setAccounts(prev => prev.map(a =>
        a.id === id ? { ...a, is_active: a.is_active ? 0 : 1 } : a
      ));
    } catch {
      toast.error('Failed to update account status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          {t('accounts.title', 'Connected Accounts')}
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Connect your social media accounts to start scheduling and managing posts
        </p>
      </div>

      {/* Platform cards */}
      <div className="space-y-4">
        {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
          <PlatformCard
            key={key}
            config={config}
            accounts={accounts}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onToggle={handleToggle}
            connecting={connecting}
          />
        ))}
      </div>

      {/* Advanced: FB Token Input */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Advanced: Manual Facebook Token</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Paste a Facebook User Access Token from Graph API Explorer to connect your pages directly
            </p>
          </div>
          <button
            onClick={() => setShowFbToken(v => !v)}
            className="ml-auto text-sm font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            {showFbToken ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show
              </>
            )}
          </button>
        </div>

        {showFbToken && (
          <div className="space-y-3 pt-2 animate-fade-in">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="underline font-semibold">Facebook Graph API Explorer</a></li>
                <li>Select your app and choose User or Page token</li>
                <li>Grant: <code className="bg-amber-100 px-1 rounded text-xs">pages_show_list, pages_manage_posts, pages_messaging, instagram_basic</code></li>
                <li>Copy and paste the token below</li>
              </ol>
            </div>
            <textarea
              value={fbToken}
              onChange={e => setFbToken(e.target.value)}
              placeholder="EAAxxxxxxxxxxxxxxxxxxxxxx..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none font-mono"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowFbToken(false); setFbToken(''); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFbTokenConnect}
                disabled={tokenConnecting || !fbToken.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1877f2, #0d5cbf)' }}
              >
                {tokenConnecting ? 'Connecting…' : 'Connect Pages'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {accounts.length} account{accounts.length > 1 ? 's' : ''} connected
            </p>
            <p className="text-white/50 text-xs mt-0.5">
              {accounts.filter(a => a.is_active).length} active · {accounts.filter(a => !a.is_active).length} paused
            </p>
          </div>
          <div className="ml-auto flex -space-x-2">
            {accounts.slice(0, 4).map(acc => (
              acc.profile_pic ? (
                <img key={acc.id} src={acc.profile_pic} alt="" className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" />
              ) : (
                <div key={acc.id} className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                  {acc.account_name?.[0]?.toUpperCase()}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}
