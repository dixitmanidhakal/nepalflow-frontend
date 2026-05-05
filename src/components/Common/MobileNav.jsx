import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/',          icon: '🏠', key: 'dashboard' },
  { to: '/compose',   icon: '✏️',  key: 'composer' },
  { to: '/calendar',  icon: '📅', key: 'calendar' },
  { to: '/inbox',     icon: '💬', key: 'inbox' },
  { to: '/analytics', icon: '📊', key: 'analytics' },
];

export default function MobileNav({ unreadCount = 0 }) {
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {navItems.map(({ to, icon, key }) => (
          <NavLink
            key={key}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs transition-colors relative ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <span className="text-xl mb-0.5">{icon}</span>
            <span className="text-[10px]">{t(`nav.${key}`)}</span>
            {key === 'inbox' && unreadCount > 0 && (
              <span className="absolute top-1 right-1/4 bg-primary-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
