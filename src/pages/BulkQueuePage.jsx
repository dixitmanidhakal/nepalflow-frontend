import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { queueAPI, accountsAPI } from '../utils/api';

const PLATFORM_ICONS = { facebook: '📘', instagram: '📸', tiktok: '🎵' };
const STATUS_STYLES = {
  queued:     { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400', label: 'Queued' },
  published:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Published' },
  failed:     { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Failed' },
  scheduled:  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Scheduled' },
};

function QueueItem({ item, accounts, onDelete, onPublish }) {
  const account = accounts.find(a => a.id === item.account_id);
  const st = STATUS_STYLES[item.status] || STATUS_STYLES.queued;

  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-sm ${item.status === 'queued' ? 'bg-white border-gray-100' : st.bg + ' border-' + st.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {PLATFORM_ICONS[item.platform] || '🌐'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">{item.content}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold border ${st.bg} ${st.text} ${st.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            {item.scheduled_at && (
              <span className="text-xs text-gray-400">
                📅 {dayjs(item.scheduled_at).format('MMM D, YYYY h:mm A')}
              </span>
            )}
            {account && (
              <span className="text-xs text-gray-400">→ {account.account_name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.status === 'queued' && (
            <button
              onClick={() => onPublish(item.id)}
              className="p-1.5 text-emerald-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Publish now"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkAddModal({ open, onClose, onSave, accounts }) {
  const [platform, setPlatform] = useState('facebook');
  const [accountId, setAccountId] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [startDate, setStartDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [intervalHours, setIntervalHours] = useState(24);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const filteredAccounts = accounts.filter(a => a.platform === platform);
  const posts = bulkText
    .split('\n---\n')
    .map(p => p.trim())
    .filter(Boolean);

  if (!open) return null;

  const handleSave = async () => {
    if (posts.length === 0) { toast.error('Add at least one post'); return; }
    if (!accountId) { toast.error('Select a social account'); return; }

    setSaving(true);
    const items = posts.map((content, i) => {
      const scheduledAt = dayjs(`${startDate} ${startTime}`)
        .add(i * intervalHours, 'hour')
        .toISOString();
      return { content, platform, account_id: Number(accountId), scheduled_at: scheduledAt };
    });

    try {
      const res = await queueAPI.bulkAdd(items);
      toast.success(`${res.data.created} posts added to queue!`);
      if (res.data.errors > 0) toast.error(`${res.data.errors} failed`);
      onClose();
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to queue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Bulk Schedule Posts</h2>
          <p className="text-sm text-gray-400 mt-0.5">Separate multiple posts with <code className="bg-gray-100 px-1 rounded text-xs">---</code> on its own line</p>
        </div>

        <div className="p-6 flex gap-5 overflow-hidden flex-1">
          {/* Left: config */}
          <div className="w-56 flex-shrink-0 space-y-4">
            {/* Platform */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Platform</label>
              <div className="space-y-1.5">
                {Object.entries(PLATFORM_ICONS).map(([p, icon]) => (
                  <button
                    key={p}
                    onClick={() => { setPlatform(p); setAccountId(''); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      platform === p ? 'text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    style={platform === p ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}
                  >
                    {icon} {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Account</label>
              {filteredAccounts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No {platform} accounts connected</p>
              ) : (
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
                >
                  <option value="">Select account</option>
                  {filteredAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.account_name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Start date/time */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>

            {/* Interval */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Interval: <span className="text-rose-500">{intervalHours}h</span>
              </label>
              <input
                type="range"
                min={1} max={72} step={1}
                value={intervalHours}
                onChange={e => setIntervalHours(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1h</span><span>1d</span><span>3d</span>
              </div>
            </div>

            {/* Preview count */}
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-gray-900">{posts.length}</p>
              <p className="text-xs text-gray-400 font-medium">post{posts.length !== 1 ? 's' : ''} detected</p>
              {posts.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Last: {dayjs(`${startDate} ${startTime}`).add((posts.length - 1) * intervalHours, 'hour').format('MMM D')}
                </p>
              )}
            </div>
          </div>

          {/* Right: textarea */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Posts Content</label>
              <button
                onClick={() => setBulkText(prev => prev + (prev ? '\n---\n' : '') + '')}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
              >
                + Add separator
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={`Write your first post here...\n\n---\n\nWrite your second post here...\n\n---\n\nWrite your third post here...`}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none font-mono leading-relaxed"
            />
            {posts.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                {posts.map((p, i) => (
                  <span key={i} className="mr-2">
                    #{i + 1}: {p.length} chars
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || posts.length === 0}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            {saving ? 'Scheduling…' : `Schedule ${posts.length} Post${posts.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BulkQueuePage() {
  const [items, setItems] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterPlatform) params.platform = filterPlatform;
      const [qRes, aRes] = await Promise.all([
        queueAPI.list(params),
        accountsAPI.list(),
      ]);
      setItems(qRes.data.items || qRes.data);
      setAccounts(aRes.data.accounts || aRes.data);
    } catch {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filterStatus, filterPlatform]); // eslint-disable-line

  const handlePublishAll = async () => {
    const count = items.filter(i => i.status === 'queued').length;
    if (count === 0) { toast.error('No queued posts to publish'); return; }
    if (!window.confirm(`Publish all ${count} queued posts? They will be scheduled immediately.`)) return;

    setPublishing(true);
    try {
      const res = await queueAPI.publishAll();
      toast.success(`${res.data.published} posts scheduled for publishing!`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await queueAPI.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handlePublishOne = async (id) => {
    try {
      await queueAPI.update(id, { status: 'scheduled' });
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'scheduled' } : i));
      toast.success('Post scheduled!');
    } catch {
      toast.error('Failed to schedule');
    }
  };

  const handleClear = async (status) => {
    if (!window.confirm(`Clear all ${status || 'completed'} posts from the queue?`)) return;
    try {
      await queueAPI.clear(status);
      toast.success('Queue cleared');
      fetchAll();
    } catch {
      toast.error('Failed to clear');
    }
  };

  const queuedCount = items.filter(i => i.status === 'queued').length;
  const publishedCount = items.filter(i => i.status === 'published' || i.status === 'scheduled').length;
  const failedCount = items.filter(i => i.status === 'failed').length;

  const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'queued', label: '⏳ Queued' },
    { value: 'scheduled', label: '📅 Scheduled' },
    { value: 'published', label: '✅ Published' },
    { value: 'failed', label: '❌ Failed' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Bulk Post Queue</h1>
          <p className="text-sm text-gray-400 mt-0.5">Schedule dozens of posts at once with smart spacing</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {queuedCount > 0 && (
            <button
              onClick={() => handleClear('published')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Clear Done
            </button>
          )}
          {queuedCount > 0 && (
            <button
              onClick={handlePublishAll}
              disabled={publishing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {publishing ? (
                <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Publish All ({queuedCount})
            </button>
          )}
          <button
            onClick={() => setShowBulkAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Bulk Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: items.length, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: '📋' },
          { label: 'Queued', value: queuedCount, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', icon: '⏳' },
          { label: 'Scheduled', value: publishedCount, gradient: 'linear-gradient(135deg, #10b981, #06b6d4)', icon: '✅' },
          { label: 'Failed', value: failedCount, gradient: 'linear-gradient(135deg, #ef4444, #f97316)', icon: '❌' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: stat.gradient }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filterStatus === f.value
                ? 'text-white shadow-sm'
                : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'
            }`}
            style={filterStatus === f.value ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}
          >
            {f.label}
          </button>
        ))}
        <div className="h-px w-px flex-shrink-0" />
        {Object.entries(PLATFORM_ICONS).map(([p, icon]) => (
          <button
            key={p}
            onClick={() => setFilterPlatform(filterPlatform === p ? '' : p)}
            className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filterPlatform === p
                ? 'text-white shadow-sm'
                : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'
            }`}
            style={filterPlatform === p ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Queue items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">Queue is empty</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
            Bulk add posts to schedule multiple pieces of content at once with smart time spacing
          </p>
          <button
            onClick={() => setShowBulkAdd(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            + Bulk Add Posts
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <QueueItem
              key={item.id}
              item={item}
              accounts={accounts}
              onDelete={handleDelete}
              onPublish={handlePublishOne}
            />
          ))}
        </div>
      )}

      {/* Empty state when filtered */}
      {!loading && items.length === 0 && (filterStatus || filterPlatform) && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">No posts match this filter</p>
          <button
            onClick={() => { setFilterStatus(''); setFilterPlatform(''); }}
            className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}

      <BulkAddModal
        open={showBulkAdd}
        onClose={() => setShowBulkAdd(false)}
        onSave={fetchAll}
        accounts={accounts}
      />
    </div>
  );
}
