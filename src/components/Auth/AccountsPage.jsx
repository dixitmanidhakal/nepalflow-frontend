import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { accountsAPI } from '../../utils/api';
import { platformIcon } from '../../utils/helpers';

export default function AccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [fbToken, setFbToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const fetchAccounts = async () => {
    const res = await accountsAPI.list();
    setAccounts(res.data.accounts);
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleConnect = async () => {
    if (!fbToken.trim()) return;
    setConnecting(true);
    try {
      const res = await accountsAPI.connectFacebook(fbToken.trim());
      toast.success(res.data.message);
      setFbToken('');
      setShowTokenInput(false);
      await fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (id) => {
    if (!window.confirm('Disconnect this account?')) return;
    await accountsAPI.disconnect(id);
    toast.success(t('accounts.disconnected'));
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggle = async (id) => {
    await accountsAPI.toggle(id);
    setAccounts(prev => prev.map(a =>
      a.id === id ? { ...a, is_active: a.is_active ? 0 : 1 } : a
    ));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('accounts.title')}</h1>
        <button
          onClick={() => setShowTokenInput(!showTokenInput)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700"
        >
          📘 {t('accounts.connect_facebook')}
        </button>
      </div>

      {/* Facebook Connect Panel */}
      {showTokenInput && (
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 space-y-4">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Connect Your Facebook Page</h3>
            <p className="text-sm text-blue-700">
              Get your User Access Token from{' '}
              <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="underline font-medium">
                Facebook Graph Explorer
              </a>{' '}
              with <code className="bg-blue-100 px-1 rounded text-xs">pages_show_list, pages_manage_posts, pages_messaging</code> permissions.
            </p>
          </div>
          <textarea
            value={fbToken}
            onChange={e => setFbToken(e.target.value)}
            placeholder="Paste your Facebook User Access Token here..."
            rows={3}
            className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none bg-white"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setShowTokenInput(false); setFbToken(''); }}
              className="flex-1 py-2 border border-blue-200 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConnect}
              disabled={connecting || !fbToken.trim()}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {connecting ? t('accounts.connecting') : 'Connect Pages'}
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🔗</div>
          <p className="font-medium">{t('accounts.no_accounts')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(account => (
            <div key={account.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              {/* Platform icon / profile pic */}
              <div className="relative">
                {account.profile_pic ? (
                  <img src={account.profile_pic} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    {platformIcon(account.platform)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 text-sm">{platformIcon(account.platform)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{account.account_name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 capitalize">{account.platform}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {account.is_active ? t('accounts.status_active') : t('accounts.status_inactive')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Toggle active */}
                <button
                  onClick={() => handleToggle(account.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    account.is_active ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    account.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>

                {/* Disconnect */}
                <button
                  onClick={() => handleDisconnect(account.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {t('accounts.disconnect')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">ℹ️ How to get your Facebook token</h3>
        <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
          <li>Go to <strong>Facebook Developers</strong> → Your App → Graph API Explorer</li>
          <li>Select permissions: <code>pages_show_list, pages_manage_posts, pages_messaging</code></li>
          <li>Generate User Access Token</li>
          <li>Paste the token above — NepalFlow will auto-detect your Pages & Instagram accounts</li>
        </ol>
        <p className="text-xs text-amber-600 mt-2">
          💡 In production, use OAuth login above instead (click "Login with Facebook")
        </p>
      </div>
    </div>
  );
}
