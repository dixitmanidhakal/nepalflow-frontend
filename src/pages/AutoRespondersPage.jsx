import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { autoRespondersAPI, accountsAPI, aiAPI } from '../utils/api';

const PLATFORM_ICONS = {
  facebook: '📘',
  instagram: '📸',
  tiktok: '🎵',
};

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Keyword Match', icon: '🔤', desc: 'Trigger when specific words appear' },
  { value: 'any_comment', label: 'Any Comment', icon: '💬', desc: 'Respond to every comment' },
  { value: 'any_dm', label: 'Any DM', icon: '✉️', desc: 'Respond to all direct messages' },
  { value: 'first_time', label: 'First-Time Commenter', icon: '👋', desc: 'Welcome new commenters' },
];

const TONE_STYLES = [
  { value: 'friendly', label: 'Friendly', emoji: '😊' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'playful', label: 'Playful', emoji: '🎉' },
  { value: 'formal', label: 'Formal', emoji: '🎩' },
];

function StatusBadge({ isActive }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Paused'}
    </span>
  );
}

function ResponderCard({ responder, onToggle, onEdit, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const triggerType = TRIGGER_TYPES.find(t => t.value === responder.trigger_type) || TRIGGER_TYPES[0];
  const platforms = JSON.parse(responder.platforms || '[]');
  const keywords = JSON.parse(responder.keywords || '[]');

  const handleDelete = async () => {
    if (!window.confirm('Delete this auto-responder?')) return;
    setDeleting(true);
    await onDelete(responder.id);
    setDeleting(false);
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all hover:shadow-md ${
      responder.is_active ? 'border-gray-100' : 'border-gray-100 opacity-70'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f43f5e15, #8b5cf615)' }}
            >
              {triggerType.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm">{responder.name}</h3>
                <StatusBadge isActive={responder.is_active} />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{triggerType.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Toggle */}
            <button
              onClick={() => onToggle(responder.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                responder.is_active ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${
                responder.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
              }`} style={{ transform: responder.is_active ? 'translateX(18px)' : 'translateX(2px)' }} />
            </button>
            <button onClick={() => onEdit(responder)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={handleDelete} disabled={deleting} className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Response preview */}
        <div className="mt-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Auto-Reply</p>
          <p className="text-sm text-gray-700 line-clamp-2">{responder.response}</p>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {/* Platforms */}
          <div className="flex gap-1">
            {platforms.map(p => (
              <span key={p} className="text-sm">{PLATFORM_ICONS[p] || '🌐'}</span>
            ))}
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {keywords.slice(0, 3).map(kw => (
                <span key={kw} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">
                  {kw}
                </span>
              ))}
              {keywords.length > 3 && (
                <span className="text-xs text-gray-400">+{keywords.length - 3} more</span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-600">{(responder.match_count || 0).toLocaleString()}</span> triggered
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponderModal({ open, onClose, onSave, initial, accounts }) {
  const [form, setForm] = useState({
    name: '', trigger_type: 'keyword', keywords: [], keywordInput: '',
    response: '', platforms: [], match_type: 'any', delay_seconds: 0,
    account_id: '', is_active: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        trigger_type: initial.trigger_type || 'keyword',
        keywords: JSON.parse(initial.keywords || '[]'),
        keywordInput: '',
        response: initial.response || '',
        platforms: JSON.parse(initial.platforms || '[]'),
        match_type: initial.match_type || 'any',
        delay_seconds: initial.delay_seconds || 0,
        account_id: initial.account_id || '',
        is_active: initial.is_active ?? 1,
      });
    } else {
      setForm({
        name: '', trigger_type: 'keyword', keywords: [], keywordInput: '',
        response: '', platforms: [], match_type: 'any', delay_seconds: 0,
        account_id: '', is_active: 1,
      });
    }
  }, [initial, open]);

  if (!open) return null;

  const addKeyword = () => {
    const kw = form.keywordInput.trim().toLowerCase();
    if (kw && !form.keywords.includes(kw)) {
      setForm(f => ({ ...f, keywords: [...f.keywords, kw], keywordInput: '' }));
    }
  };

  const removeKeyword = (kw) => setForm(f => ({ ...f, keywords: f.keywords.filter(k => k !== kw) }));

  const togglePlatform = (p) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.response.trim()) {
      toast.error('Name and response are required');
      return;
    }
    setSaving(true);
    await onSave({
      name: form.name,
      trigger_type: form.trigger_type,
      keywords: JSON.stringify(form.keywords),
      response: form.response,
      platforms: JSON.stringify(form.platforms.length > 0 ? form.platforms : ['facebook', 'instagram', 'tiktok']),
      match_type: form.match_type,
      delay_seconds: form.delay_seconds,
      account_id: form.account_id || null,
      is_active: form.is_active,
    }, initial?.id);
    setSaving(false);
  };

  const VARIABLES = ['{name}', '{platform}', '{time}', '{business}'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {initial ? 'Edit Auto-Responder' : 'New Auto-Responder'}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Automate replies to comments and messages</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Welcome New Commenters"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
            />
          </div>

          {/* Trigger Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trigger</label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGER_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, trigger_type: t.value }))}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    form.trigger_type === t.value
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{t.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${form.trigger_type === t.value ? 'text-rose-700' : 'text-gray-700'}`}>{t.label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Keywords (only for keyword trigger) */}
          {form.trigger_type === 'keyword' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={form.keywordInput}
                  onChange={e => setForm(f => ({ ...f, keywordInput: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Type keyword and press Enter"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                />
                <button
                  onClick={addKeyword}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.keywords.map(kw => (
                    <span key={kw} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full border border-violet-100 font-medium">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="hover:text-violet-900">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Match:</span>
                {['any', 'all'].map(m => (
                  <button
                    key={m}
                    onClick={() => setForm(f => ({ ...f, match_type: m }))}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                      form.match_type === m
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {m === 'any' ? 'Any keyword' : 'All keywords'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Response */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-gray-700">Auto-Reply Message</label>
              <span className="text-xs text-gray-400">{form.response.length}/500</span>
            </div>
            <textarea
              value={form.response}
              onChange={e => setForm(f => ({ ...f, response: e.target.value.slice(0, 500) }))}
              placeholder="Hi {name}! Thanks for your comment 🙏 We appreciate your support!"
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 resize-none"
            />
            {/* Variable chips */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs text-gray-400">Insert:</span>
              {VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => setForm(f => ({ ...f, response: f.response + v }))}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md hover:bg-gray-200 transition-colors font-mono"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platforms</label>
            <div className="flex gap-2">
              {Object.entries(PLATFORM_ICONS).map(([p, icon]) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.platforms.includes(p) || form.platforms.length === 0
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

          {/* Delay */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Response Delay: <span className="text-rose-500">{form.delay_seconds}s</span>
            </label>
            <input
              type="range"
              min={0} max={300} step={30}
              value={form.delay_seconds}
              onChange={e => setForm(f => ({ ...f, delay_seconds: Number(e.target.value) }))}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Instant</span><span>1 min</span><span>5 min</span>
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
            {saving ? 'Saving…' : initial ? 'Update' : 'Create Responder'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestModal({ open, onClose }) {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);

  if (!open) return null;

  const handleTest = async () => {
    if (!message.trim()) return;
    setTesting(true);
    try {
      const res = await autoRespondersAPI.test({ message, comment_type: 'comment' });
      setResult(res.data);
    } catch {
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Test Auto-Responder</h2>
          <p className="text-sm text-gray-400 mt-0.5">Simulate a message to see which rules would trigger</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Test Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a sample comment or DM..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
            />
          </div>
          {result && (
            <div className="space-y-3">
              {result.matched?.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-sm font-semibold text-gray-700">{result.matched.length} rule(s) would trigger</span>
                  </div>
                  {result.first_response && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-semibold mb-1">Response that would be sent:</p>
                      <p className="text-sm text-gray-700">{result.first_response}</p>
                    </div>
                  )}
                  {result.matched.map(r => (
                    <div key={r.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                      {r.name}
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-400">○</span>
                  <span className="text-sm text-gray-500">No rules would trigger for this message</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !message.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {testing ? 'Testing…' : '▶ Run Test'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AutoRespondersPage() {
  const { t } = useTranslation();
  const [responders, setResponders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, aRes] = await Promise.all([
        autoRespondersAPI.list(),
        accountsAPI.list(),
      ]);
      setResponders(rRes.data.autoResponders || rRes.data);
      setAccounts(aRes.data.accounts || aRes.data);
    } catch {
      toast.error('Failed to load auto-responders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (data, id) => {
    try {
      if (id) {
        await autoRespondersAPI.update(id, data);
        toast.success('Auto-responder updated!');
      } else {
        await autoRespondersAPI.create(data);
        toast.success('Auto-responder created!');
      }
      setShowModal(false);
      setEditing(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await autoRespondersAPI.toggle(id);
      setResponders(prev => prev.map(r => r.id === id ? { ...r, is_active: res.data.is_active } : r));
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const handleDelete = async (id) => {
    try {
      await autoRespondersAPI.delete(id);
      setResponders(prev => prev.filter(r => r.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const activeCount = responders.filter(r => r.is_active).length;
  const totalTriggers = responders.reduce((sum, r) => sum + (r.match_count || 0), 0);

  const [suggestingAI, setSuggestingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const handleAISuggest = async () => {
    setSuggestingAI(true);
    try {
      const res = await aiAPI.autoResponderSuggestion({ business_type: 'general', platform: 'facebook' });
      setAiSuggestions(res.data.suggestions || []);
      setShowAISuggestions(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI suggestions failed');
    } finally {
      setSuggestingAI(false);
    }
  };

  const handleUseSuggestion = (suggestion) => {
    setEditing({
      name: suggestion.name || '',
      trigger_type: suggestion.trigger_type || 'keyword',
      keywords: JSON.stringify(suggestion.keywords || []),
      response: suggestion.response || '',
      platforms: JSON.stringify(['facebook', 'instagram']),
      match_type: 'any',
      delay_seconds: 0,
      is_active: 1,
    });
    setShowModal(true);
    setShowAISuggestions(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Auto-Responders
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Automate replies to comments and DMs 24/7</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* AI Suggest button */}
          <button
            onClick={handleAISuggest}
            disabled={suggestingAI}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            {suggestingAI ? (
              <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>🤖</span>
            )}
            {suggestingAI ? 'AI Thinking…' : 'AI Suggest Rules'}
          </button>
          <button
            onClick={() => setShowTest(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test Rules
          </button>
          <button
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Responder
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Rules', value: responders.length, icon: '🤖', gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)' },
          { label: 'Active', value: activeCount, icon: '✅', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
          { label: 'Total Triggered', value: totalTriggers, icon: '⚡', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: stat.gradient }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* How it works banner */}
      {responders.length === 0 && !loading && (
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}
        >
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="font-bold text-lg mb-2">Automate Your Engagement</h3>
          <p className="text-white/70 text-sm mb-4 leading-relaxed">
            Set up rules to automatically reply to comments and DMs on Facebook and Instagram.
            Never miss an engagement opportunity — even while you sleep!
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { step: '1', label: 'Set Keywords', icon: '🔤' },
              { step: '2', label: 'Write Reply', icon: '✍️' },
              { step: '3', label: 'Go Live 24/7', icon: '🚀' },
            ].map(s => (
              <div key={s.step} className="bg-white/10 rounded-xl p-3">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-xs text-white/80 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : responders.length === 0 ? (
        <div className="text-center py-12">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
          >
            Create Your First Auto-Responder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {responders.map(r => (
            <ResponderCard
              key={r.id}
              responder={r}
              onToggle={handleToggle}
              onEdit={(r) => { setEditing(r); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ResponderModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
        accounts={accounts}
      />
      <TestModal open={showTest} onClose={() => setShowTest(false)} />

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAISuggestions(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                🤖 Grok AI Suggestions
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">AI-generated auto-responder rules for your business</p>
            </div>
            <div className="p-6 space-y-3">
              {aiSuggestions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No suggestions available. Configure GROK_API_KEY for AI-powered suggestions.</p>
              ) : (
                aiSuggestions.map((s, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-violet-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900">{s.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100 font-medium capitalize">
                            {(s.trigger_type || '').replace('_', ' ')}
                          </span>
                          {(s.keywords || []).slice(0, 3).map(kw => (
                            <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kw}</span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{s.response}</p>
                        {s.reason && <p className="text-[10px] text-gray-400 mt-1 italic">{s.reason}</p>}
                      </div>
                      <button
                        onClick={() => handleUseSuggestion(s)}
                        className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-100">
              <button onClick={() => setShowAISuggestions(false)}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
