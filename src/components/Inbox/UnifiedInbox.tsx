import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { inboxAPI } from '../../utils/api';

dayjs.extend(relativeTime);

const PLATFORM_STYLES: Record<string, { bg: string; light: string; label: string }> = {
  facebook: { bg: 'bg-blue-500', light: 'bg-blue-50 border-blue-100 text-blue-700', label: 'Facebook' },
  instagram: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', light: 'bg-purple-50 border-purple-100 text-purple-700', label: 'Instagram' },
  tiktok: { bg: 'bg-gray-900', light: 'bg-gray-50 border-gray-200 text-gray-700', label: 'TikTok' },
};

const TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  comment: { icon: '💬', label: 'Comment', color: 'text-blue-600 bg-blue-50' },
  dm: { icon: '✉️', label: 'DM', color: 'text-violet-600 bg-violet-50' },
  mention: { icon: '📢', label: 'Mention', color: 'text-amber-600 bg-amber-50' },
};

interface Comment {
  id: string | number;
  platform: string;
  comment_type: string;
  commenter_name?: string;
  message: string;
  is_read: number | boolean;
  is_replied: number | boolean;
  reply_text?: string;
  post_content?: string;
  platform_time?: string;
  fetched_at?: string;
}

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? 'text-white shadow-sm'
          : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'
      }`}
      style={active ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}
    >
      {label}
    </button>
  );
}

interface MessageCardProps {
  comment: Comment;
  onReply: (id: string | number, message: string) => Promise<void>;
  onMarkRead: (id: string | number) => Promise<void>;
}

function MessageCard({ comment, onReply, onMarkRead }: MessageCardProps) {
  const { t } = useTranslation();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pStyle = PLATFORM_STYLES[comment.platform] || PLATFORM_STYLES.facebook;
  const typeConf = TYPE_CONFIG[comment.comment_type] || TYPE_CONFIG.comment;

  useEffect(() => {
    if (showReply && textareaRef.current) textareaRef.current.focus();
  }, [showReply]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(comment.id, replyText);
    setReplyText('');
    setShowReply(false);
    setSending(false);
  };

  const timeAgo = comment.platform_time
    ? dayjs(comment.platform_time).fromNow()
    : dayjs(comment.fetched_at).fromNow();

  return (
    <div
      className={`rounded-2xl border p-4 transition-all hover:shadow-sm ${
        comment.is_read
          ? 'bg-white border-gray-100'
          : 'bg-rose-50/40 border-rose-100'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: comment.platform === 'instagram'
              ? 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)'
              : comment.platform === 'tiktok' ? '#161616' : '#1877f2' }}
          >
            {comment.commenter_name?.[0]?.toUpperCase() || '?'}
          </div>
          {!comment.is_read && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{comment.commenter_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${pStyle.light}`}>
              {pStyle.label}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConf.color}`}>
              {typeConf.icon} {typeConf.label}
            </span>
            {comment.is_replied && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-emerald-700 bg-emerald-50 border border-emerald-100">
                ✓ Replied
              </span>
            )}
            <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{timeAgo}</span>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{comment.message}</p>

          {/* Post context */}
          {comment.post_content && (
            <div className="mt-2 pl-3 border-l-2 border-gray-200">
              <p className="text-xs text-gray-400 italic line-clamp-1">
                Re: "{comment.post_content.substring(0, 80)}"
              </p>
            </div>
          )}

          {/* Reply preview */}
          {comment.reply_text && !showReply && (
            <div className="mt-2 pl-3 border-l-2 border-emerald-300">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-emerald-600">You:</span> {comment.reply_text}
              </p>
            </div>
          )}

          {/* Reply input */}
          {showReply && (
            <div className="mt-3 space-y-2">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply())}
                placeholder="Type your reply… (Enter to send)"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowReply(false); setReplyText(''); }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-1.5 text-white text-xs rounded-lg font-bold disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                >
                  {sending ? 'Sending…' : '↑ Send Reply'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!showReply && (
            <div className="flex items-center gap-3 mt-2.5">
              {!comment.is_replied && (
                <button
                  onClick={() => { setShowReply(true); if (!comment.is_read) onMarkRead(comment.id); }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}
              {!comment.is_read && (
                <button
                  onClick={() => onMarkRead(comment.id)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Mark as read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Filters {
  comment_type: string;
  platform: string;
  is_read: string;
}

export default function UnifiedInbox() {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState<Filters>({ comment_type: '', platform: '', is_read: '' });
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchComments = async (reset = false) => {
    if (reset) setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: LIMIT,
        offset: reset ? 0 : offset,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')),
      };
      const res = await inboxAPI.list(params);
      if (reset) {
        setComments(res.data.comments);
        setOffset(0);
      } else {
        setComments(prev => [...prev, ...res.data.comments]);
      }
      setTotal(res.data.total);
    } finally {
      if (reset) setLoading(false);
    }
  };

  useEffect(() => { fetchComments(true); }, [filters]); // eslint-disable-line

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await inboxAPI.sync();
      toast.success(res.data.message || 'Inbox synced!');
      fetchComments(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleReply = async (id: string | number, message: string) => {
    try {
      await inboxAPI.reply(id, message);
      toast.success('Reply sent! ✓');
      setComments(prev => prev.map(c =>
        c.id === id ? { ...c, is_replied: 1, reply_text: message, is_read: 1 } : c
      ));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to send reply');
    }
  };

  const handleMarkRead = async (id: string | number) => {
    try {
      await inboxAPI.markRead(id);
      setComments(prev => prev.map(c => c.id === id ? { ...c, is_read: 1 } : c));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await inboxAPI.markAllRead();
      setComments(prev => prev.map(c => ({ ...c, is_read: 1 })));
      toast.success('All messages marked as read');
    } catch { /* silent */ }
  };

  const unreadCount = comments.filter(c => !c.is_read).length;

  const FILTER_PILLS = [
    { label: 'All', key: 'comment_type' as keyof Filters, value: '' },
    { label: '💬 Comments', key: 'comment_type' as keyof Filters, value: 'comment' },
    { label: '✉️ DMs', key: 'comment_type' as keyof Filters, value: 'dm' },
    { label: '📘 Facebook', key: 'platform' as keyof Filters, value: 'facebook' },
    { label: '📸 Instagram', key: 'platform' as keyof Filters, value: 'instagram' },
    { label: '🔵 Unread', key: 'is_read' as keyof Filters, value: '0' },
    { label: '✓ Read', key: 'is_read' as keyof Filters, value: '1' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {t('inbox.title', 'Unified Inbox')}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0 ? `${total} messages` : 'No messages yet'}
            {unreadCount > 0 && (
              <span className="ml-2 text-rose-500 font-semibold">· {unreadCount} unread</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark all read
            </button>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            <svg
              className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTER_PILLS.map(pill => (
          <FilterPill
            key={`${pill.key}-${pill.value}`}
            label={pill.label}
            active={filters[pill.key] === pill.value && (pill.value !== '' || pill.key === 'comment_type')}
            onClick={() => {
              if (pill.value === '' && pill.key === 'comment_type') {
                setFilters({ comment_type: '', platform: '', is_read: '' });
              } else {
                setFilters(f => ({
                  ...f,
                  [pill.key]: f[pill.key] === pill.value ? '' : pill.value,
                }));
              }
            }}
          />
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <p className="font-bold text-gray-600 text-lg">No messages found</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            {Object.values(filters).some(v => v !== '')
              ? 'Try clearing filters to see all messages'
              : 'Click "Sync Now" to fetch latest messages from your social accounts'}
          </p>
          {!Object.values(filters).some(v => v !== '') && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
            >
              Sync messages
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <MessageCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onMarkRead={handleMarkRead}
            />
          ))}
          {comments.length < total && (
            <button
              onClick={() => {
                const nextOffset = offset + LIMIT;
                setOffset(nextOffset);
                fetchComments(false);
              }}
              className="w-full py-3 text-sm font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
            >
              Load more · {total - comments.length} remaining
            </button>
          )}
        </div>
      )}
    </div>
  );
}
