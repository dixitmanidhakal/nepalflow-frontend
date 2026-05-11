import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { rssAPI, accountsAPI } from '../utils/api';

dayjs.extend(relativeTime);

const PLATFORM_ICONS: Record<string, string> = { facebook: '📘', instagram: '📸', tiktok: '🎵' };
const CATEGORY_OPTIONS = ['news', 'tech', 'business', 'entertainment', 'sports', 'health', 'other'];

interface Feed {
  id: string;
  name: string;
  feed_url?: string;
  url?: string;
  category?: string;
  is_active: number | boolean;
  last_fetched_at?: string;
  items_fetched?: number;
  post_template?: string;
  platforms?: string;
  auto_post?: number;
  schedule_interval?: number;
}

interface Account {
  id: string;
  platform: string;
  account_name?: string;
}

interface RSSItem {
  title?: string;
  description?: string;
  link?: string;
}

// ─── FeedCard ──────────────────────────────────────────────────────────────────
interface FeedCardProps {
  feed: Feed;
  onToggle: (id: string) => void;
  onFetch: (id: string) => Promise<RSSItem[]>;
  onDelete: (id: string) => void;
  onEdit: (feed: Feed) => void;
  accounts: Account[];
}

function FeedCard({ feed, onToggle, onFetch, onDelete, onEdit, accounts }: FeedCardProps) {
  const [fetching, setFetching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<RSSItem[]>([]);
  const [postingItem, setPostingItem] = useState<string | null>(null);

  const handleFetch = async () => {
    setFetching(true);
    try {
      const res = await onFetch(feed.id);
      setItems(res);
      setExpanded(true);
    } finally {
      setFetching(false);
    }
  };

  const handlePostItem = async (item: RSSItem, accountId: string) => {
    setPostingItem(item.link || null);
    try {
      await rssAPI.postItem(feed.id, { item, account_id: accountId });
      toast.success('Scheduled as a post!');
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to schedule');
    } finally {
      setPostingItem(null);
    }
  };

  const feedAccounts = accounts.filter(a => {
    const platforms: string[] = JSON.parse(feed.platforms || '[]');
    return platforms.length === 0 || platforms.includes(a.platform);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
            📡
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm truncate">{feed.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                feed.is_active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                {feed.is_active ? '● Active' : '○ Paused'}
              </span>
              {feed.category && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 capitalize">
                  {feed.category}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{feed.feed_url || feed.url}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {feed.last_fetched_at && (
                <span>Last synced {dayjs(feed.last_fetched_at).fromNow()}</span>
              )}
              <span className="font-semibold text-gray-600">{feed.items_fetched || 0} items total</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggle(feed.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                feed.is_active ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span
                className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
                style={{ transform: feed.is_active ? 'translateX(18px)' : 'translateX(2px)' }}
              />
            </button>
            <button onClick={() => onEdit(feed)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => onDelete(feed.id)} className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {feed.post_template && (
          <div className="mt-3 p-2.5 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Post Template</p>
            <p className="text-xs text-gray-600 line-clamp-2">{feed.post_template}</p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleFetch}
            disabled={fetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {fetching ? (
              <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
            {fetching ? 'Fetching…' : 'Fetch Items'}
          </button>
          {expanded && items.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2"
            >
              {expanded ? '▲ Hide' : `▼ Show ${items.length} items`}
            </button>
          )}
        </div>
      </div>

      {expanded && items.length > 0 && (
        <div className="border-t border-gray-50">
          <div className="px-5 py-3 bg-gray-50/50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Items from Feed</p>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item, i) => (
              <div key={i} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-300 font-mono w-5 flex-shrink-0 mt-0.5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                    )}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block truncate">
                        {item.link}
                      </a>
                    )}
                  </div>
                  {feedAccounts.length > 0 ? (
                    <div className="flex-shrink-0">
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none cursor-pointer"
                        defaultValue=""
                        onChange={e => e.target.value && handlePostItem(item, e.target.value)}
                      >
                        <option value="" disabled>Post to…</option>
                        {feedAccounts.map(a => (
                          <option key={a.id} value={String(a.id)}>{PLATFORM_ICONS[a.platform]} {a.account_name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <button
                      disabled={postingItem === item.link}
                      onClick={() => toast.error('Connect a social account first')}
                      className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-lg text-white font-medium disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                    >
                      Schedule
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FeedModal ─────────────────────────────────────────────────────────────────
interface FeedFormState {
  name: string;
  url: string;
  category: string;
  post_template: string;
  platforms: string[];
  auto_post: number;
  schedule_interval: number;
}

interface FeedModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<FeedFormState, 'platforms'> & { platforms: string }, id?: string) => Promise<void>;
  initial: Partial<Feed> | null;
}

function FeedModal({ open, onClose, onSave, initial }: FeedModalProps) {
  const [form, setForm] = useState<FeedFormState>({
    name: '', url: '', category: 'news', post_template: '📰 {{title}}\n\n{{description}}\n\nRead more: {{link}}',
    platforms: [], auto_post: 0, schedule_interval: 60,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        url: initial.url || '',
        category: initial.category || 'news',
        post_template: initial.post_template || '📰 {{title}}\n\n{{description}}\n\nRead more: {{link}}',
        platforms: JSON.parse(initial.platforms || '[]'),
        auto_post: initial.auto_post || 0,
        schedule_interval: initial.schedule_interval || 60,
      });
    } else {
      setForm({
        name: '', url: '', category: 'news',
        post_template: '📰 {{title}}\n\n{{description}}\n\nRead more: {{link}}',
        platforms: [], auto_post: 0, schedule_interval: 60,
      });
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Name and URL are required');
      return;
    }
    setSaving(true);
    await onSave({
      ...form,
      platforms: JSON.stringify(form.platforms),
    }, initial?.id);
    setSaving(false);
  };

  const togglePlatform = (p: string) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  };

  const TEMPLATE_VARS = ['{{title}}', '{{description}}', '{{link}}', '{{source}}'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{initial ? 'Edit RSS Feed' : 'Add RSS Feed'}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Import content from any RSS/Atom feed</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Feed Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nepal Times News"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">RSS Feed URL</label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com/feed.xml"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Platforms</label>
            <div className="flex gap-2">
              {Object.entries(PLATFORM_ICONS).map(([p, icon]) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.platforms.includes(p)
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {icon} {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">No selection = all platforms</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Post Template</label>
            <textarea
              value={form.post_template}
              onChange={e => setForm(f => ({ ...f, post_template: e.target.value }))}
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none font-mono"
            />
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs text-gray-400">Variables:</span>
              {TEMPLATE_VARS.map(v => (
                <button
                  key={v}
                  onClick={() => setForm(f => ({ ...f, post_template: f.post_template + v }))}
                  className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md hover:bg-orange-100 transition-colors font-mono border border-orange-100"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            {saving ? 'Saving…' : initial ? 'Update Feed' : 'Add Feed'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RSSFeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Feed> | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fRes, aRes] = await Promise.all([rssAPI.list(), accountsAPI.list()]);
      setFeeds(fRes.data.feeds || fRes.data);
      setAccounts(aRes.data.accounts || aRes.data);
    } catch {
      toast.error('Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (data: Omit<FeedFormState, 'platforms'> & { platforms: string }, id?: string) => {
    try {
      const payload = { ...data, feed_url: data.url };
      if (id) {
        await rssAPI.update(id, payload);
        toast.success('Feed updated!');
      } else {
        await rssAPI.create(payload);
        toast.success('Feed added!');
      }
      setShowModal(false);
      setEditing(null);
      fetchAll();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to save feed');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await rssAPI.toggle(id);
      setFeeds(prev => prev.map(f => f.id === id ? { ...f, is_active: res.data.is_active } : f));
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const handleFetch = async (id: string): Promise<RSSItem[]> => {
    try {
      const res = await rssAPI.fetch(id);
      return res.data.items || [];
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to fetch items');
      return [];
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this RSS feed?')) return;
    try {
      await rssAPI.delete(id);
      setFeeds(prev => prev.filter(f => f.id !== id));
      toast.success('Feed deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const activeFeeds = feeds.filter(f => f.is_active).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">RSS Content Hub</h1>
          <p className="text-sm text-gray-400 mt-0.5">Import and schedule content from any RSS feed</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add RSS Feed
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Feeds', value: feeds.length, icon: '📡', gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
          { label: 'Active', value: activeFeeds, icon: '✅', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
          { label: 'Items Fetched', value: feeds.reduce((s, f) => s + (f.items_fetched || 0), 0), icon: '📰', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: stat.gradient }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {feeds.length === 0 && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🇳🇵</span> Popular Nepal RSS Feeds
          </h3>
          <div className="grid gap-2">
            {[
              { name: 'The Kathmandu Post', url: 'https://kathmandupost.com/rss' },
              { name: 'OnlineKhabar', url: 'https://www.onlinekhabar.com/feed' },
              { name: 'Ekantipur', url: 'https://ekantipur.com/rss' },
              { name: 'Ratopati', url: 'https://ratopati.com/rss' },
            ].map(suggestion => (
              <div key={suggestion.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{suggestion.name}</p>
                  <p className="text-xs text-gray-400 font-mono truncate max-w-xs">{suggestion.url}</p>
                </div>
                <button
                  onClick={() => {
                    setEditing({ name: suggestion.name, url: suggestion.url });
                    setShowModal(true);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {feeds.length === 0 && !loading && (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #1c1917, #292524)' }}>
          <p className="text-white font-black text-lg mb-4">How RSS Hub Works</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🔗', step: 'Add any RSS feed URL' },
              { icon: '📥', step: 'Preview & select items' },
              { icon: '📅', step: 'Schedule to social media' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3">
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-xs text-white/80 font-medium leading-tight">{s.step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : feeds.length === 0 ? (
        <div className="text-center py-12">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            Add Your First RSS Feed
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feeds.map(feed => (
            <FeedCard
              key={feed.id}
              feed={feed}
              accounts={accounts}
              onToggle={handleToggle}
              onFetch={handleFetch}
              onDelete={handleDelete}
              onEdit={(f) => { setEditing(f); setShowModal(true); }}
            />
          ))}
        </div>
      )}

      <FeedModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
