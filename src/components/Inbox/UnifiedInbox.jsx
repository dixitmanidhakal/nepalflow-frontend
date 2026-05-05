import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { inboxAPI } from '../../utils/api';

dayjs.extend(relativeTime);

const PLATFORM_COLORS = {
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-purple-100 text-purple-700',
};

const TYPE_ICONS = {
  comment: '💬',
  dm: '✉️',
  mention: '📢',
};

function CommentCard({ comment, onReply, onMarkRead }) {
  const { t } = useTranslation();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(comment.id, replyText);
    setReplyText('');
    setShowReply(false);
    setSending(false);
  };

  useEffect(() => {
    if (showReply && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showReply]);

  return (
    <div className={`p-4 rounded-xl border transition-all ${comment.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {comment.commenter_name?.[0]?.toUpperCase() || '?'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{comment.commenter_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${PLATFORM_COLORS[comment.platform] || 'bg-gray-100 text-gray-600'}`}>
              {comment.platform}
            </span>
            <span className="text-xs text-gray-400">{TYPE_ICONS[comment.comment_type]} {comment.comment_type}</span>
            {!comment.is_read && (
              <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">{t('inbox.unread')}</span>
            )}
            {comment.is_replied && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ {t('inbox.replied')}</span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.message}</p>

          {/* Post context */}
          {comment.post_content && (
            <p className="text-xs text-gray-400 mt-1 italic truncate">
              Re: "{comment.post_content.substring(0, 60)}..."
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-1">
            {comment.platform_time ? dayjs(comment.platform_time).fromNow() : dayjs(comment.fetched_at).fromNow()}
          </p>

          {/* Reply preview */}
          {comment.reply_text && (
            <div className="mt-2 pl-3 border-l-2 border-green-300 text-xs text-gray-500 italic">
              You replied: "{comment.reply_text}"
            </div>
          )}

          {/* Reply box */}
          {showReply && (
            <div className="mt-3 flex gap-2">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply())}
                placeholder={t('inbox.reply_placeholder')}
                rows={2}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-none"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="px-3 py-1.5 bg-primary-600 text-white text-xs rounded-lg disabled:opacity-50 hover:bg-primary-700"
                >
                  {sending ? '...' : t('inbox.send_reply')}
                </button>
                <button
                  onClick={() => { setShowReply(false); setReplyText(''); }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            {!comment.is_replied && (
              <button
                onClick={() => { setShowReply(true); if (!comment.is_read) onMarkRead(comment.id); }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('inbox.reply')}
              </button>
            )}
            {!comment.is_read && (
              <button
                onClick={() => onMarkRead(comment.id)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {t('inbox.mark_read')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedInbox() {
  const { t } = useTranslation();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState({
    comment_type: '',
    platform: '',
    is_read: '',
  });
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchComments = async (reset = false) => {
    setLoading(true);
    try {
      const params = {
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
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(true); }, [filters]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await inboxAPI.sync();
      toast.success(res.data.message);
      fetchComments(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleReply = async (id, message) => {
    try {
      await inboxAPI.reply(id, message);
      toast.success(t('inbox.reply_sent'));
      setComments(prev => prev.map(c =>
        c.id === id ? { ...c, is_replied: 1, reply_text: message, is_read: 1 } : c
      ));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reply failed');
    }
  };

  const handleMarkRead = async (id) => {
    await inboxAPI.markRead(id);
    setComments(prev => prev.map(c => c.id === id ? { ...c, is_read: 1 } : c));
  };

  const handleMarkAllRead = async () => {
    await inboxAPI.markAllRead();
    setComments(prev => prev.map(c => ({ ...c, is_read: 1 })));
    toast.success(t('inbox.sync_success'));
  };

  const unreadCount = comments.filter(c => !c.is_read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inbox.title')}</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-primary-600 font-medium">{unreadCount} unread</span>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100">
              ✓ {t('inbox.mark_all_read')}
            </button>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            <span className={syncing ? 'animate-spin' : ''}>🔄</span>
            {syncing ? t('inbox.syncing') : t('inbox.sync')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* Type Filter */}
        <select
          value={filters.comment_type}
          onChange={e => setFilters(f => ({ ...f, comment_type: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none bg-white"
        >
          <option value="">{t('inbox.all')}</option>
          <option value="comment">{t('inbox.comments')}</option>
          <option value="dm">{t('inbox.dms')}</option>
        </select>

        {/* Platform Filter */}
        <select
          value={filters.platform}
          onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none bg-white"
        >
          <option value="">{t('common.facebook')} + {t('common.instagram')}</option>
          <option value="facebook">{t('common.facebook')}</option>
          <option value="instagram">{t('common.instagram')}</option>
        </select>

        {/* Read Filter */}
        <select
          value={filters.is_read}
          onChange={e => setFilters(f => ({ ...f, is_read: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none bg-white"
        >
          <option value="">All</option>
          <option value="0">{t('inbox.unread')}</option>
          <option value="1">{t('inbox.read')}</option>
        </select>
      </div>

      {/* Comment List */}
      {loading && comments.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-medium">{t('inbox.no_messages')}</p>
          <p className="text-sm mt-2">Click "Sync Now" to fetch latest messages</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onMarkRead={handleMarkRead}
            />
          ))}
          {/* Load more */}
          {comments.length < total && (
            <button
              onClick={() => { setOffset(o => o + LIMIT); fetchComments(); }}
              className="w-full py-3 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors"
            >
              Load more ({total - comments.length} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
