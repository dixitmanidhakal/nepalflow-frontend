import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authAPI, accountsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const TIMEZONES = [
  { value: 'Asia/Kathmandu', label: '🇳🇵 Asia/Kathmandu (NPT +5:45)' },
  { value: 'Asia/Kolkata', label: '🇮🇳 Asia/Kolkata (IST +5:30)' },
  { value: 'UTC', label: '🌍 UTC +0:00' },
  { value: 'America/New_York', label: '🇺🇸 America/New_York (EST)' },
  { value: 'Europe/London', label: '🇬🇧 Europe/London (GMT)' },
  { value: 'Asia/Dubai', label: '🇦🇪 Asia/Dubai (GST +4:00)' },
  { value: 'Asia/Singapore', label: '🇸🇬 Asia/Singapore (SGT +8:00)' },
];

const PLATFORM_ICONS = { facebook: '📘', instagram: '📸', tiktok: '🎵' };
const PLATFORM_COLORS = {
  facebook: 'linear-gradient(135deg, #1877f2, #0a5fd4)',
  instagram: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
  tiktok: 'linear-gradient(135deg, #161616, #ff0050)',
};

function SectionCard({ title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-50">
        <h2 className="font-bold text-gray-900">{title}</h2>
        {desc && <p className="text-sm text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ToggleSwitch({ value, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-rose-500' : 'bg-gray-200'
        }`}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [accounts, setAccounts] = useState([]);

  // Profile
  const [profile, setProfile] = useState({ name: '', email: '', bio: '', website: '', timezone: 'Asia/Kathmandu' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    email_new_comment: true,
    email_post_published: true,
    email_post_failed: true,
    push_new_comment: false,
    push_analytics_report: true,
  });

  // Appearance
  const [language, setLanguage] = useState(user?.language || 'en');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        timezone: user.timezone || 'Asia/Kathmandu',
      });
      setLanguage(user.language || 'en');
    }
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.list();
      setAccounts(res.data.accounts || res.data);
    } catch { /* silent */ }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profile);
      // Update auth context if response includes user
      if (res.data.user) login(localStorage.getItem('nepalflow_token'), res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    try {
      await authAPI.updateLanguage(lang);
    } catch { /* silent */ }
  };

  const handleDisconnect = async (id, name) => {
    if (!window.confirm(`Disconnect ${name}?`)) return;
    try {
      await accountsAPI.disconnect(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
      toast.success('Account disconnected');
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const TABS = [
    { key: 'profile', label: 'Profile', icon: '👤' },
    { key: 'accounts', label: 'Accounts', icon: '🔗' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'appearance', label: 'Appearance', icon: '🎨' },
    { key: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <SectionCard title="Profile Information" desc="Your public profile details">
          <div className="space-y-4">
            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
              >
                {(profile.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{profile.name || user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                <p className="text-xs text-gray-400">Member since {new Date(user?.created_at || Date.now()).getFullYear()}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about yourself or your business..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={e => setProfile(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
            >
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </SectionCard>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <SectionCard title="Connected Social Accounts" desc="Manage your linked social media profiles">
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🔗</div>
                <p className="text-gray-500 text-sm">No accounts connected</p>
                <a
                  href="/accounts"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                >
                  Connect Accounts
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/50 transition-colors">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: PLATFORM_COLORS[account.platform] || '#666' }}
                    >
                      {PLATFORM_ICONS[account.platform] || '🌐'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{account.account_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{account.platform}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        account.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {account.is_active ? '● Active' : '○ Paused'}
                      </span>
                      <button
                        onClick={() => handleDisconnect(account.id, account.account_name)}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ))}
                <a
                  href="/accounts"
                  className="block text-center text-sm text-rose-500 hover:text-rose-600 font-semibold py-2"
                >
                  + Connect More Accounts
                </a>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <SectionCard title="Email Notifications" desc="Choose what you want to be notified about via email">
            <div className="space-y-4">
              <ToggleSwitch
                value={notifPrefs.email_new_comment}
                onChange={v => setNotifPrefs(p => ({ ...p, email_new_comment: v }))}
                label="New comments & DMs"
                desc="Get notified when someone comments on your posts"
              />
              <ToggleSwitch
                value={notifPrefs.email_post_published}
                onChange={v => setNotifPrefs(p => ({ ...p, email_post_published: v }))}
                label="Post published successfully"
                desc="Confirmation when your scheduled posts go live"
              />
              <ToggleSwitch
                value={notifPrefs.email_post_failed}
                onChange={v => setNotifPrefs(p => ({ ...p, email_post_failed: v }))}
                label="Post publishing failed"
                desc="Immediate alert if a post fails to publish"
              />
            </div>
          </SectionCard>

          <SectionCard title="In-App Notifications" desc="Real-time notifications in NepalFlow">
            <div className="space-y-4">
              <ToggleSwitch
                value={notifPrefs.push_new_comment}
                onChange={v => setNotifPrefs(p => ({ ...p, push_new_comment: v }))}
                label="New engagement alerts"
                desc="Notify when you get comments, likes, or shares"
              />
              <ToggleSwitch
                value={notifPrefs.push_analytics_report}
                onChange={v => setNotifPrefs(p => ({ ...p, push_analytics_report: v }))}
                label="Weekly analytics report"
                desc="Get a summary of your performance every Monday"
              />
            </div>
          </SectionCard>

          <button
            onClick={() => toast.success('Notification preferences saved!')}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <SectionCard title="Appearance & Language" desc="Customize your NepalFlow experience">
          <div className="space-y-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Language / भाषा</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'en', label: 'English', flag: '🇺🇸', desc: 'English interface' },
                  { value: 'ne', label: 'नेपाली', flag: '🇳🇵', desc: 'Nepali interface' },
                ].map(lang => (
                  <button
                    key={lang.value}
                    onClick={() => handleLanguageChange(lang.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      language === lang.value
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <p className={`font-bold text-sm ${language === lang.value ? 'text-rose-700' : 'text-gray-700'}`}>
                        {lang.label}
                      </p>
                      <p className="text-xs text-gray-400">{lang.desc}</p>
                    </div>
                    {language === lang.value && (
                      <span className="ml-auto text-rose-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme (cosmetic, future feature) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Light', icon: '☀️', active: true },
                  { label: 'Dark', icon: '🌙', active: false, soon: true },
                  { label: 'System', icon: '💻', active: false, soon: true },
                ].map(theme => (
                  <button
                    key={theme.label}
                    disabled={theme.soon}
                    className={`relative p-4 rounded-xl border text-center transition-all ${
                      theme.active
                        ? 'border-rose-300 bg-rose-50'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-2xl mb-1">{theme.icon}</div>
                    <p className="text-xs font-semibold text-gray-700">{theme.label}</p>
                    {theme.soon && (
                      <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="space-y-4">
          <SectionCard title="⚠️ Danger Zone" desc="These actions are irreversible. Proceed with caution.">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-bold text-red-800">Delete All Posts</p>
                  <p className="text-xs text-red-600 mt-0.5">Permanently delete all your scheduled and published posts</p>
                </div>
                <button
                  onClick={() => toast.error('Contact support to delete all posts')}
                  className="px-3 py-1.5 text-xs font-bold text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Posts
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-bold text-red-800">Disconnect All Accounts</p>
                  <p className="text-xs text-red-600 mt-0.5">Remove all connected social media accounts</p>
                </div>
                <button
                  onClick={() => toast.error('Contact support to disconnect all accounts')}
                  className="px-3 py-1.5 text-xs font-bold text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Disconnect All
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-bold text-red-800">Delete Account</p>
                  <p className="text-xs text-red-600 mt-0.5">Permanently delete your NepalFlow account and all data</p>
                </div>
                <button
                  onClick={() => toast.error('Contact support to delete your account')}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </SectionCard>

          <div className="text-center text-xs text-gray-400">
            Need help? Contact us at{' '}
            <a href="mailto:support@nepalflow.com" className="text-rose-500 hover:underline">
              support@nepalflow.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
