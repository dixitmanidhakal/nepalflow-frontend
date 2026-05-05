import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { analyticsAPI, postsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate, platformIcon, statusBadge, truncate } from '../utils/helpers';

function StatCard({ icon, label, value, color = 'bg-primary-50 text-primary-600' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.overview({ days: 30 }),
      postsAPI.list({ limit: 5 }),
    ]).then(([ovRes, postsRes]) => {
      setOverview(ovRes.data.summary);
      setRecentPosts(postsRes.data.posts);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'there' })}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t('dashboard.overview')}</p>
        </div>
        <Link
          to="/compose"
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors text-sm"
        >
          <span>✏️</span> {t('dashboard.create_post')}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📋" label={t('dashboard.scheduled_posts')} value={overview?.scheduled_posts} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon="✅" label={t('dashboard.published_posts')} value={overview?.total_posts} color="bg-green-50 text-green-600" />
        <StatCard icon="💬" label={t('dashboard.unread_messages')} value={overview?.unread_inbox} color="bg-blue-50 text-blue-600" />
        <StatCard icon="❌" label={t('dashboard.failed_posts')} value={overview?.failed_posts} color="bg-red-50 text-red-600" />
      </div>

      {/* Engagement Row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="❤️" label={t('dashboard.total_likes')} value={(overview?.total_likes || 0).toLocaleString()} color="bg-pink-50 text-pink-600" />
        <StatCard icon="💬" label={t('dashboard.total_comments')} value={(overview?.total_comments || 0).toLocaleString()} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon="🔁" label={t('dashboard.total_shares')} value={(overview?.total_shares || 0).toLocaleString()} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">{t('dashboard.quick_actions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/compose',   icon: '✏️',  label: t('dashboard.create_post') },
            { to: '/calendar',  icon: '📅', label: t('nav.calendar') },
            { to: '/inbox',     icon: '💬', label: t('dashboard.view_inbox') },
            { to: '/accounts',  icon: '🔗', label: t('nav.accounts') },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">{t('dashboard.recent_posts')}</h2>
          <Link to="/calendar" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {t('nav.calendar')} →
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📝</div>
            <p>{t('dashboard.no_posts')}</p>
            <Link to="/compose" className="inline-block mt-4 text-sm text-primary-600 font-medium hover:underline">
              {t('dashboard.create_post')} →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentPosts.map(post => {
              const badge = statusBadge(post.status);
              return (
                <div key={post.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mt-0.5">{platformIcon(post.platform)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{truncate(post.content, 60)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{post.account_name}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(post.scheduled_at)}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
