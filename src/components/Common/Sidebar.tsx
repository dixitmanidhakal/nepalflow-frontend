import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

interface NavItemConfig {
  to: string;
  key: string;
  end?: boolean;
  icon: React.ReactNode;
  hasUnread?: boolean;
  badge?: string;
}

const MAIN_NAV: NavItemConfig[] = [
  {
    to: '/', key: 'dashboard', end: true,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    to: '/compose', key: 'composer',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  },
  {
    to: '/calendar', key: 'calendar',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  {
    to: '/inbox', key: 'inbox', hasUnread: true,
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  },
  {
    to: '/analytics', key: 'analytics',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
];

const AUTOMATION_NAV: NavItemConfig[] = [
  {
    to: '/ai-studio', key: 'ai_studio',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    badge: 'AI',
  },
  {
    to: '/templates', key: 'templates',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    to: '/auto-responders', key: 'auto_responders',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  },
  {
    to: '/rss-feeds', key: 'rss_feeds',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
  },
  {
    to: '/queue', key: 'queue',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  },
];

const BOTTOM_NAV: NavItemConfig[] = [
  {
    to: '/accounts', key: 'accounts',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  },
  {
    to: '/notifications', key: 'notifications',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  },
  {
    to: '/settings', key: 'settings',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
];

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
  badge?: string;
  unreadCount?: number;
  showUnread?: boolean;
}

function NavItem({ to, icon, label, end, badge, unreadCount, showUnread }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
        }`
      }
      style={({ isActive }) =>
        isActive ? { background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' } : {}
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-violet-500 text-white leading-none">
          {badge}
        </span>
      )}
      {showUnread && unreadCount && unreadCount > 0 && (
        <span className="ml-auto bg-rose-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  unreadCount?: number;
}

export default function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const { t } = useTranslation();
  const { user, logout, updateLanguage } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0 border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="font-black text-gray-900 text-sm leading-tight">
            Nepal<span style={{ color: '#f43f5e' }}>Flow</span>
          </div>
          <div className="text-xs text-gray-400 leading-tight">{t('tagline', 'Social Automation')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {/* Main */}
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">Main</p>
        {MAIN_NAV.map(({ to, icon, key, end, hasUnread }) => (
          <NavItem
            key={key}
            to={to}
            icon={icon}
            label={t(`nav.${key}`, key.replace('_', ' '))}
            end={end}
            showUnread={hasUnread}
            unreadCount={unreadCount}
          />
        ))}

        {/* Automation section */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">Automation</p>
        </div>
        {AUTOMATION_NAV.map(({ to, icon, key, badge }) => (
          <NavItem
            key={key}
            to={to}
            icon={icon}
            label={t(`nav.${key}`, key.replace(/_/g, ' '))}
            badge={badge}
          />
        ))}

        {/* Bottom links */}
        <div className="pt-4 pb-1">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2">Account</p>
        </div>
        {BOTTOM_NAV.map(({ to, icon, key }) => (
          <NavItem
            key={key}
            to={to}
            icon={icon}
            label={t(`nav.${key}`, key.replace('_', ' '))}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-3">
        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => updateLanguage('en')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              user?.language !== 'ne'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => updateLanguage('ne')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all font-nepali ${
              user?.language === 'ne'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🇳🇵 नेपाली
          </button>
        </div>

        {/* User card */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-default">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email || user.provider}</div>
            </div>
            <button
              onClick={logout}
              title={t('nav.logout', 'Logout')}
              className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
