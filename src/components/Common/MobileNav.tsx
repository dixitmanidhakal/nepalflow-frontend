import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavItemConfig {
  to: string;
  key: string;
  end?: boolean;
  isCompose?: boolean;
  icon: (active: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    to: '/',
    key: 'dashboard',
    end: true,
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/compose',
    key: 'composer',
    isCompose: true,
    icon: () => (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: '/inbox',
    key: 'inbox',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    to: '/analytics',
    key: 'analytics',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/accounts',
    key: 'accounts',
    icon: (active) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
];

interface MobileNavProps {
  unreadCount?: number;
}

export default function MobileNav({ unreadCount = 0 }: MobileNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="flex items-center">
        {NAV_ITEMS.map(({ to, key, end, isCompose, icon }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 gap-0.5 relative transition-colors ${
                isCompose ? '' : isActive ? 'text-rose-500' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isCompose ? (
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg -mt-4"
                    style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
                  >
                    {icon(false)}
                  </div>
                ) : (
                  <div className="relative">
                    {icon(isActive)}
                    {key === 'inbox' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                )}
                <span className={`text-[10px] font-semibold leading-none ${isCompose ? 'text-gray-400' : ''}`}>
                  {t(`nav.${key}`)}
                </span>
                {!isCompose && isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
