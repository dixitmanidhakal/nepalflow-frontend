import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { notificationsAPI } from '../utils/api';

dayjs.extend(relativeTime);

interface NotifTypeConfig {
  icon: string;
  color: string;
}

const NOTIF_TYPES: Record<string, NotifTypeConfig> = {
  post_published:   { icon: '✅', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  post_failed:      { icon: '❌', color: 'text-red-600 bg-red-50 border-red-100' },
  new_comment:      { icon: '💬', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  new_dm:           { icon: '✉️', color: 'text-violet-600 bg-violet-50 border-violet-100' },
  analytics_alert:  { icon: '📊', color: 'text-amber-600 bg-amber-50 border-amber-100' },
  system:           { icon: '⚙️', color: 'text-gray-600 bg-gray-100 border-gray-200' },
  ai_insight:       { icon: '🤖', color: 'text-rose-600 bg-rose-50 border-rose-100' },
  rss_new_items:    { icon: '📡', color: 'text-orange-600 bg-orange-50 border-orange-100' },
};

interface Notification {
  id: string | number;
  type: string;
  icon?: string;
  title: string;
  message: string;
  is_read: number | boolean;
  link?: string;
  created_at: string;
}

// ─── NotifCard ─────────────────────────────────────────────────────────────────
interface NotifCardProps {
  notif: Notification;
  onMarkRead: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

function NotifCard({ notif, onMarkRead, onDelete }: NotifCardProps) {
  const typeConf = NOTIF_TYPES[notif.type] || NOTIF_TYPES.system;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all hover:shadow-sm cursor-pointer ${
        notif.is_read
          ? 'bg-white border-gray-100'
          : 'bg-rose-50/30 border-rose-100'
      }`}
      onClick={() => !notif.is_read && onMarkRead(notif.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border ${typeConf.color}`}>
          {notif.icon || typeConf.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm font-semibold ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notif.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notif.is_read && (
                <span className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
              )}
              <button
                onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
                className="p-1 text-gray-300 hover:text-gray-500 rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">{dayjs(notif.created_at).fromNow()}</span>
            {notif.link && (
              <a
                href={notif.link}
                onClick={e => e.stopPropagation()}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
              >
                View →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NotifGroup ─────────────────────────────────────────────────────────────────
interface NotifGroupProps {
  date: string;
  notifs: Notification[];
  onMarkRead: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

function NotifGroup({ date, notifs, onMarkRead, onDelete }: NotifGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{date}</p>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="space-y-2">
        {notifs.map(n => (
          <NotifCard key={n.id} notif={n} onMarkRead={onMarkRead} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  const fetchNotifs = async (reset = true) => {
    if (reset) setLoading(true);
    try {
      const params: Record<string, unknown> = { limit: LIMIT, offset: reset ? 0 : offset };
      if (filter === 'unread') params.unread = true;
      const res = await notificationsAPI.list(params);
      const data: Notification[] = res.data.notifications || res.data;
      if (reset) {
        setNotifications(data);
        setOffset(0);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
      setTotal(res.data.total || data.length);
    } catch {
      /* silent */
    } finally {
      if (reset) setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(true); }, [filter]); // eslint-disable-line

  const handleMarkRead = async (id: string | number) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { /* silent */ }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all read notifications?')) return;
    try {
      await notificationsAPI.clear();
      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('Read notifications cleared');
    } catch { /* silent */ }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, notif) => {
    const date = dayjs(notif.created_at);
    let label: string;
    if (dayjs().isSame(date, 'day')) label = 'Today';
    else if (dayjs().subtract(1, 'day').isSame(date, 'day')) label = 'Yesterday';
    else label = date.format('MMMM D, YYYY');

    if (!acc[label]) acc[label] = [];
    acc[label].push(notif);
    return acc;
  }, {});

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total} total` : 'No notifications'}
            {unreadCount > 0 && (
              <span className="ml-2 text-rose-500 font-semibold">· {unreadCount} unread</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark all read
            </button>
          )}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Clear read
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === f.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-400">
            {filter === 'unread'
              ? 'You have no unread notifications'
              : 'Notifications about your posts, comments, and analytics will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, notifs]) => (
            <NotifGroup
              key={date}
              date={date}
              notifs={notifs}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}

          {notifications.length < total && (
            <button
              onClick={() => {
                const next = offset + LIMIT;
                setOffset(next);
                fetchNotifs(false);
              }}
              className="w-full py-3 text-sm font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
            >
              Load more · {total - notifications.length} remaining
            </button>
          )}
        </div>
      )}
    </div>
  );
}
