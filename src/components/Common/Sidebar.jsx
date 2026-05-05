import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/',          icon: '🏠', key: 'dashboard' },
  { to: '/compose',   icon: '✏️',  key: 'composer' },
  { to: '/calendar',  icon: '📅', key: 'calendar' },
  { to: '/inbox',     icon: '💬', key: 'inbox' },
  { to: '/analytics', icon: '📊', key: 'analytics' },
  { to: '/accounts',  icon: '🔗', key: 'accounts' },
];

export default function Sidebar({ unreadCount = 0 }) {
  const { t } = useTranslation();
  const { user, logout, updateLanguage } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg">N</div>
        <div>
          <div className="font-bold text-gray-900 text-sm">NepalFlow</div>
          <div className="text-xs text-gray-500">{t('tagline')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, key }) => (
          <NavLink
            key={key}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            <span>{t(`nav.${key}`)}</span>
            {key === 'inbox' && unreadCount > 0 && (
              <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & language switcher */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-3">
        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t('common.language')}:</span>
          <button
            onClick={() => updateLanguage('en')}
            className={`text-xs px-2 py-1 rounded ${user?.language === 'en' ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >EN</button>
          <button
            onClick={() => updateLanguage('ne')}
            className={`text-xs px-2 py-1 rounded font-nepali ${user?.language === 'ne' ? 'bg-primary-100 text-primary-700 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >नेपाली</button>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600 text-xs" title={t('nav.logout')}>
              ⬅️
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
