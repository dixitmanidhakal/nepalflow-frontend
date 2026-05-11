import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { postsAPI, accountsAPI, templatesAPI, aiAPI } from '../../utils/api';
import { Link } from 'react-router-dom';

interface PlatformLimit {
  max: number;
  label: string;
  color: string;
  gradient: string;
}

const PLATFORM_LIMITS: Record<string, PlatformLimit> = {
  facebook: { max: 63206, label: 'Facebook', color: '#1877f2', gradient: 'linear-gradient(135deg, #1877f2, #0d5cbf)' },
  instagram: { max: 2200, label: 'Instagram', color: '#e1306c', gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' },
  tiktok: { max: 2200, label: 'TikTok', color: '#ee1d52', gradient: 'linear-gradient(135deg, #161616, #2dd4bf, #ee1d52)' },
};

const DEFAULT_LIMIT: PlatformLimit = { max: 63206, label: 'Post', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)' };

interface Account {
  id: string | number;
  platform: string;
  account_name?: string;
  is_active: number | boolean;
}

interface PlatformIconProps {
  platform: string;
  size?: number;
}

function PlatformIcon({ platform, size = 20 }: PlatformIconProps) {
  if (platform === 'facebook') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
  if (platform === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
  if (platform === 'tiktok') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/>
    </svg>
  );
  return <span className="text-white text-sm font-bold">{platform?.[0]?.toUpperCase() || '?'}</span>;
}

interface PostPreviewProps {
  account?: Account;
  content: string;
  hashtags: string[];
  mediaUrl?: string;
  scheduledAt?: string;
}

function PostPreview({ account, content, hashtags, mediaUrl, scheduledAt }: PostPreviewProps) {
  const platform = account?.platform || 'facebook';
  const config = PLATFORM_LIMITS[platform] || DEFAULT_LIMIT;
  const fullText = content + (hashtags.length ? '\n\n' + hashtags.join(' ') : '');

  if (platform === 'instagram') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-w-sm mx-auto">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full" style={{ background: config.gradient }} />
          <div>
            <p className="text-sm font-bold text-gray-900">{account?.account_name || 'your_account'}</p>
          </div>
          <div className="ml-auto">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
        </div>
        {mediaUrl ? (
          <img src={mediaUrl} alt="" className="w-full aspect-square object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="px-4 pt-3 pb-1 flex gap-4">
          <span>♥</span><span>💬</span><span>📤</span>
          <span className="ml-auto">🔖</span>
        </div>
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-800 mt-1 line-clamp-3">
            <span className="font-bold mr-1">{account?.account_name || 'your_account'}</span>
            {content}
            {hashtags.length > 0 && <span className="text-blue-500"> {hashtags.join(' ')}</span>}
          </p>
          {scheduledAt && (
            <p className="text-xs text-gray-400 mt-2">{dayjs(scheduledAt).format('MMM D, YYYY')}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-w-md mx-auto">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: config.gradient }}>
          <PlatformIcon platform={platform} size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{account?.account_name || 'Your Page'}</p>
          <p className="text-xs text-gray-400">
            {scheduledAt ? dayjs(scheduledAt).format('MMM D [at] h:mm A') : 'Scheduled'} · 🌐
          </p>
        </div>
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {fullText || <span className="text-gray-300 italic">Your post content will appear here…</span>}
        </p>
      </div>
      {mediaUrl && (
        <img src={mediaUrl} alt="" className="w-full object-cover max-h-72" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
      <div className="flex border-t border-gray-100 px-4 py-2 gap-4 text-gray-400 text-sm">
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">👍 Like</button>
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">💬 Comment</button>
        <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">↗️ Share</button>
      </div>
    </div>
  );
}

interface FormState {
  accountId: string | number;
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledAt: string;
}

interface FormErrors {
  accountId?: string;
  content?: string;
  scheduledAt?: string;
}

export default function PostComposer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const templateId = searchParams.get('template_id');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState<FormState>({
    accountId: '',
    content: '',
    hashtags: [],
    mediaUrls: [],
    scheduledAt: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  });
  const [hashtagInput, setHashtagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestingHashtags, setSuggestingHashtags] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [loadedTemplate, setLoadedTemplate] = useState<{ name: string } | null>(null);

  useEffect(() => {
    accountsAPI.list().then((res: { data: { accounts: Account[] } }) => setAccounts(res.data.accounts));
    if (editId) {
      postsAPI.get(editId).then((res: { data: { post: { account_id: string | number; content: string; hashtags?: string[]; media_urls?: string[]; scheduled_at: string } } }) => {
        const p = res.data.post;
        setForm({
          accountId: p.account_id,
          content: p.content,
          hashtags: p.hashtags || [],
          mediaUrls: p.media_urls || [],
          scheduledAt: dayjs(p.scheduled_at).format('YYYY-MM-DDTHH:mm'),
        });
      });
    } else if (templateId) {
      templatesAPI.get(templateId).then((res: { data: { template: { name: string; content?: string; hashtags?: string[] } } }) => {
        const tpl = res.data.template;
        setLoadedTemplate(tpl);
        setForm(f => ({
          ...f,
          content: tpl.content || '',
          hashtags: Array.isArray(tpl.hashtags) ? tpl.hashtags : [],
        }));
        toast.success(`Template "${tpl.name}" loaded!`);
        if (tpl.content) {
          setSuggestingHashtags(true);
          aiAPI.hashtags({ content: tpl.content, platform: 'instagram', niche: 'general' })
            .then((hRes: { data?: { suggested?: string[] } }) => {
              const suggested = hRes.data?.suggested || [];
              if (suggested.length > 0) {
                setForm(f => ({
                  ...f,
                  hashtags: [...new Set([...(Array.isArray(tpl.hashtags) ? tpl.hashtags : []), ...suggested])],
                }));
                toast.success(`✨ AI suggested ${suggested.length} hashtags!`);
              }
            })
            .catch(() => { /* silently ignore AI hashtag failure */ })
            .finally(() => setSuggestingHashtags(false));
        }
      }).catch(() => toast.error('Failed to load template'));
    }
  }, [editId, templateId]); // eslint-disable-line

  const selectedAccount = accounts.find(a => a.id === form.accountId);
  const platformConfig = PLATFORM_LIMITS[selectedAccount?.platform || ''] || DEFAULT_LIMIT;
  const charCount = form.content.length;
  const charMax = platformConfig.max;
  const charPercent = Math.min((charCount / charMax) * 100, 100);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.accountId) errs.accountId = 'Please select an account';
    if (!form.content.trim()) errs.content = 'Post content is required';
    if (charCount > charMax) errs.content = `Content exceeds ${platformConfig.label} limit of ${charMax.toLocaleString()} characters`;
    if (!form.scheduledAt) errs.scheduledAt = 'Schedule time is required';
    else if (new Date(form.scheduledAt) <= new Date()) errs.scheduledAt = 'Schedule time must be in the future';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) { setActiveTab('compose'); return; }
    setLoading(true);
    try {
      const payload = {
        accountId: form.accountId,
        content: form.content + (form.hashtags.length ? '\n\n' + form.hashtags.join(' ') : ''),
        mediaUrls: form.mediaUrls,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        hashtags: form.hashtags,
      };
      if (editId) {
        await postsAPI.update(editId, payload);
        toast.success('Post updated successfully!');
      } else {
        await postsAPI.create(payload);
        toast.success(t('composer.success', 'Post scheduled! 🎉'));
      }
      navigate('/calendar');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const addHashtag = () => {
    const raw = hashtagInput.trim();
    if (!raw) return;
    const tag = raw.startsWith('#') ? raw : `#${raw}`;
    if (tag !== '#' && !form.hashtags.includes(tag)) {
      setForm(f => ({ ...f, hashtags: [...f.hashtags, tag] }));
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag: string) => setForm(f => ({ ...f, hashtags: f.hashtags.filter(h => h !== tag) }));

  const addImage = () => {
    const url = imageInput.trim();
    if (url && !form.mediaUrls.includes(url)) {
      setForm(f => ({ ...f, mediaUrls: [...f.mediaUrls, url] }));
    }
    setImageInput('');
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {editId ? t('composer.edit_title', 'Edit Post') : t('composer.title', 'Create Post')}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Schedule content to your social accounts</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'compose' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ✏️ Compose
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">Live preview of how your post will look</p>
            <PostPreview
              account={selectedAccount}
              content={form.content}
              hashtags={form.hashtags}
              mediaUrl={form.mediaUrls[0]}
              scheduledAt={form.scheduledAt}
            />
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setActiveTab('compose')}
              className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Back to Edit
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
            >
              {loading ? 'Scheduling…' : editId ? '✓ Update Post' : '🚀 Schedule Post'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            {/* Template loaded banner */}
            {loadedTemplate && (
              <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                <span className="text-lg">📋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-violet-800">Template loaded: {loadedTemplate.name}</p>
                  <p className="text-xs text-violet-600">Content and hashtags pre-filled. Edit as needed.</p>
                </div>
                <button type="button" onClick={() => setLoadedTemplate(null)} className="text-violet-400 hover:text-violet-600">×</button>
              </div>
            )}
            {/* Account selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Select Account</label>
              {accounts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm mb-3">No accounts connected yet</p>
                  <Link
                    to="/accounts"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                  >
                    Connect an account →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {accounts.filter(a => a.is_active).map(acc => {
                    const cfg = PLATFORM_LIMITS[acc.platform] || DEFAULT_LIMIT;
                    const isSelected = form.accountId === acc.id;
                    return (
                      <label
                        key={acc.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-transparent shadow-sm' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        style={isSelected ? { background: `${cfg.color}12`, borderColor: cfg.color } : {}}
                      >
                        <input
                          type="radio"
                          name="accountId"
                          value={String(acc.id)}
                          checked={isSelected}
                          onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                          className="sr-only"
                        />
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.gradient }}
                        >
                          <PlatformIcon platform={acc.platform} size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{acc.account_name}</p>
                          <p className="text-xs text-gray-400 capitalize">{acc.platform}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: cfg.color }}>
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
              {errors.accountId && <p className="text-red-500 text-xs mt-2">{errors.accountId}</p>}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Post Content</label>
              <textarea
                ref={textareaRef}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="What do you want to share? Write in Nepali or English..."
                rows={7}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 resize-none transition-all leading-relaxed ${
                  errors.content ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-violet-100'
                }`}
              />
              <div className="flex items-center justify-between mt-3">
                {errors.content
                  ? <p className="text-red-500 text-xs">{errors.content}</p>
                  : <p className="text-xs text-gray-400">{platformConfig.label} · max {charMax.toLocaleString()} chars</p>
                }
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle
                        cx="16" cy="16" r="12" fill="none"
                        stroke={charPercent > 95 ? '#ef4444' : charPercent > 80 ? '#f59e0b' : platformConfig.color}
                        strokeWidth="4"
                        strokeDasharray={`${charPercent * 0.754} 75.4`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {charPercent > 80 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold" style={{ color: charPercent > 95 ? '#ef4444' : '#f59e0b' }}>
                        {charMax - charCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hashtags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-gray-700">Hashtags</label>
                <button
                  type="button"
                  disabled={suggestingHashtags || !form.content.trim()}
                  onClick={async () => {
                    if (!form.content.trim()) { toast.error('Write some content first'); return; }
                    setSuggestingHashtags(true);
                    try {
                      const platform = accounts.find(a => a.id === form.accountId)?.platform || 'instagram';
                      const res = await aiAPI.hashtags({ content: form.content, platform, niche: 'general' });
                      const suggested: string[] = res.data?.suggested || [];
                      if (suggested.length > 0) {
                        setForm(f => ({ ...f, hashtags: [...new Set([...f.hashtags, ...suggested])] }));
                        toast.success(`✨ Added ${suggested.length} AI hashtags!`);
                      }
                    } catch { toast.error('Failed to get hashtag suggestions'); }
                    finally { setSuggestingHashtags(false); }
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
                >
                  {suggestingHashtags ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : '✨'}
                  {suggestingHashtags ? 'Suggesting…' : 'AI Suggest'}
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={e => setHashtagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  placeholder="#nepal #business #trending"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <button
                  type="button"
                  onClick={addHashtag}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                >
                  Add
                </button>
              </div>
              {form.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.hashtags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-violet-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="hover:text-violet-900 font-bold leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Media (Image URL)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={imageInput}
                  onChange={e => setImageInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                >
                  Add
                </button>
              </div>
              {form.mediaUrls.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {form.mediaUrls.map((url, i) => (
                    <div key={i} className="relative flex-shrink-0 group">
                      <img
                        src={url} alt=""
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, mediaUrls: f.mediaUrls.filter((_, j) => j !== i) }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Schedule Time</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                min={dayjs().add(1, 'minute').format('YYYY-MM-DDTHH:mm')}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.scheduledAt ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-violet-100'
                }`}
              />
              {errors.scheduledAt && <p className="text-red-500 text-xs mt-2">{errors.scheduledAt}</p>}
              {form.scheduledAt && !errors.scheduledAt && (
                <p className="text-xs text-gray-400 mt-2">
                  📅 Will publish at scheduled time
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-24 md:pb-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex-1 py-3 border border-violet-200 bg-violet-50 rounded-xl text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
              >
                👁️ Preview
              </button>
              <button
                type="submit"
                disabled={loading || accounts.length === 0}
                className="flex-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
              >
                {loading ? 'Scheduling…' : editId ? '✓ Update' : '🚀 Schedule'}
              </button>
            </div>
          </form>

          {/* Right: Live preview panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>
              <PostPreview
                account={selectedAccount}
                content={form.content}
                hashtags={form.hashtags}
                mediaUrl={form.mediaUrls[0]}
                scheduledAt={form.scheduledAt}
              />
              {selectedAccount && (
                <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">
                    {platformConfig.label} limits
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max {charMax.toLocaleString()} characters · {form.mediaUrls.length > 0 ? '✓ Media added' : 'No media'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
