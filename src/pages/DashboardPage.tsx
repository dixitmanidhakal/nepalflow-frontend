import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { analyticsAPI, postsAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate, platformIcon, statusBadge, truncate } from '../utils/helpers';

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'from-blue-500 to-blue-700',
  instagram: 'from-pink-500 via-rose-500 to-orange-400',
  tiktok: 'from-gray-900 via-teal-400 to-rose-500',
};

interface StatCardProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  gradient: string;
  trend?: number;
  trendLabel?: string;
}

function StatCard({ icon, label, value, gradient, trend, trendLabel }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-900 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${gradient}`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-black text-gray-900 tracking-tight">
        {value ?? <span className="text-gray-300">—</span>}
      </div>
      <div className="text-sm text-gray-500 mt-1 font-medium">{label}</div>
      {trendLabel && <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>}
    </div>
  );
}

interface QuickActionProps {
  to: string;
  icon: string;
  label: string;
  sublabel?: string;
  gradient: string;
}

function QuickAction({ to, icon, label, sublabel, gradient }: QuickActionProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:border-transparent hover:shadow-lg transition-all duration-200 relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-200 bg-gradient-to-br"
        style={{ background: `linear-gradient(135deg, ${gradient})` }}
      />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: `linear-gradient(135deg, ${gradient})` }}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold text-gray-800 text-sm">{label}</div>
        {sublabel && <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>}
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors absolute top-5 right-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

interface Post {
  id: string;
  status: string;
  platform: string;
  content: string;
  account_name: string;
  scheduled_at: string;
}

interface PostRowProps {
  post: Post;
  onDuplicate: (id: string) => Promise<void>;
}

function PostRow({ post, onDuplicate }: PostRowProps) {
  const badge = statusBadge(post.status);
  const [duplicating, setDuplicating] = useState(false);

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDuplicating(true);
    try {
      await onDuplicate(post.id);
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
      <div className="flex-shrink-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base bg-gradient-to-br ${PLATFORM_COLORS[post.platform] || 'from-gray-400 to-gray-600'}`}>
          {platformIcon(post.platform)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate leading-snug">{truncate(post.content, 70)}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400 font-medium">{post.account_name}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
          <span className="text-xs text-gray-400">{formatDate(post.scheduled_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.color}`}>
          {badge.label}
        </span>
        <button
          onClick={handleDuplicate}
          disabled={duplicating}
          title="Duplicate post"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 disabled:opacity-40"
        >
          {duplicating ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}

interface Overview {
  scheduled_posts?: number;
  total_posts?: number;
  unread_inbox?: number;
  failed_posts?: number;
  total_likes?: number;
  total_comments?: number;
  total_shares?: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.all([
      analyticsAPI.overview({ days: 30 }),
      postsAPI.list({ limit: 6 }),
    ]).then(([ovRes, postsRes]: [{ data: { summary: Overview } }, { data: { posts: Post[] } }]) => {
      setOverview(ovRes.data.summary);
      setRecentPosts(postsRes.data.posts);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDuplicate = async (postId: string) => {
    try {
      const res = await postsAPI.duplicate(postId);
      toast.success('Post duplicated and scheduled for tomorrow!');
      setRecentPosts(prev => [res.data.post, ...prev].slice(0, 6));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to duplicate post');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{greeting} 👋</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {user?.name?.split(' ')[0] || 'there'}'s Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          to="/compose"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t('dashboard.create_post', 'Create Post')}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📋" label="Scheduled" value={overview?.scheduled_posts ?? 0} gradient="from-amber-400 to-orange-500" trendLabel="Upcoming posts" />
        <StatCard icon="✅" label="Published" value={overview?.total_posts ?? 0} gradient="from-emerald-400 to-teal-500" trendLabel="Total published" />
        <StatCard icon="💬" label="Unread" value={overview?.unread_inbox ?? 0} gradient="from-blue-400 to-indigo-500" trendLabel="Messages & comments" />
        <StatCard icon="⚡" label="Failed" value={overview?.failed_posts ?? 0} gradient="from-rose-400 to-red-500" trendLabel="Need attention" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="❤️" label="Total Likes" value={(overview?.total_likes || 0).toLocaleString()} gradient="from-pink-400 to-rose-500" />
        <StatCard icon="💬" label="Comments" value={(overview?.total_comments || 0).toLocaleString()} gradient="from-violet-400 to-purple-500" />
        <StatCard icon="🔁" label="Shares" value={(overview?.total_shares || 0).toLocaleString()} gradient="from-cyan-400 to-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction to="/compose" icon="✏️" label="New Post" sublabel="Schedule content" gradient="#f43f5e, #8b5cf6" />
            <QuickAction to="/calendar" icon="📅" label="Calendar" sublabel="View schedule" gradient="#f59e0b, #f97316" />
            <QuickAction to="/inbox" icon="💬" label="Inbox" sublabel="Reply to messages" gradient="#3b82f6, #6366f1" />
            <QuickAction to="/accounts" icon="🔗" label="Accounts" sublabel="Manage socials" gradient="#10b981, #06b6d4" />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Recent Posts</h2>
            <Link to="/calendar" className="text-sm text-rose-500 hover:text-rose-600 font-semibold">View all →</Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {recentPosts.length === 0 ? (
              <div className="py-14 text-center text-gray-400">
                <div className="text-5xl mb-3">📝</div>
                <p className="font-medium text-gray-500">No posts yet</p>
                <p className="text-sm mt-1">Create your first post to get started</p>
                <Link
                  to="/compose"
                  className="inline-block mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                >
                  Create a post
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentPosts.map(post => <PostRow key={post.id} post={post} onDuplicate={handleDuplicate} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {overview?.total_posts === 0 && (
        <div
          className="rounded-2xl p-6 flex items-center gap-6 flex-wrap"
          style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)' }}
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-1">Connect your social accounts</h3>
            <p className="text-white/60 text-sm">Link Facebook, Instagram, or TikTok to start scheduling posts and tracking analytics.</p>
          </div>
          <Link
            to="/accounts"
            className="flex-shrink-0 px-5 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            Connect Accounts →
          </Link>
        </div>
      )}
    </div>
  );
}
