import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { aiAPI, accountsAPI } from '../utils/api';

const TONES = [
  { value: 'promotional', label: '📢 Promotional', desc: 'Sales, offers, product launches' },
  { value: 'educational', label: '📚 Educational', desc: 'Tips, how-tos, facts' },
  { value: 'engaging',    label: '🎯 Engaging',    desc: 'Questions, polls, community' },
  { value: 'festival',    label: '🎊 Festival',    desc: 'Holiday, Dashain, Tihar greetings' },
  { value: 'product',     label: '🛍️ Product',     desc: 'New arrivals, features' },
  { value: 'announcement',label: '📌 Announcement',desc: 'Updates, news, changes' },
  { value: 'story',       label: '📖 Story',       desc: 'Behind the scenes, brand story' },
];

const NICHES = [
  { value: 'general', label: '🌐 General' },
  { value: 'food', label: '🍜 Food & Restaurant' },
  { value: 'fashion', label: '👗 Fashion & Clothing' },
  { value: 'business', label: '💼 Business & Services' },
  { value: 'festival', label: '🎊 Festival & Events' },
];

const PLATFORMS = ['facebook', 'instagram', 'tiktok'];

function PlatformIcon({ platform }) {
  const icons = { facebook: '📘', instagram: '📸', tiktok: '🎵' };
  return <span>{icons[platform] || '🌐'}</span>;
}

export default function AIGeneratorPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    topic: '',
    tone: 'promotional',
    platform: 'facebook',
    niche: 'general',
    business_name: '',
    custom_vars: {},
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtagResult, setHashtagResult] = useState(null);
  const [suggestingHashtags, setSuggestingHashtags] = useState(false);

  useEffect(() => {
    aiAPI.insights({ days: 30 }).then(r => setInsights(r.data)).catch(() => {});
    aiAPI.bestTime({ platform: 'all' }).then(r => setBestTime(r.data)).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!form.topic.trim()) { toast.error('Please enter a topic first'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.generate(form);
      setResult(res.data);
      toast.success('Content generated! ✨');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHashtags = async () => {
    if (!hashtagInput.trim()) return;
    setSuggestingHashtags(true);
    try {
      const res = await aiAPI.hashtags({ content: hashtagInput, platform: form.platform, niche: form.niche });
      setHashtagResult(res.data);
    } catch { toast.error('Failed to suggest hashtags'); }
    finally { setSuggestingHashtags(false); }
  };

  const useContent = () => {
    if (!result) return;
    const params = new URLSearchParams({
      ai_content: result.content,
      ai_hashtags: JSON.stringify(result.hashtags),
    });
    navigate(`/compose?${params.toString()}`);
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>AI</div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">AI Content Studio</h1>
          </div>
          <p className="text-sm text-gray-400">Generate engaging posts, find the best hashtags, and discover optimal posting times</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {[
          { key: 'generate', label: '✨ Generate' },
          { key: 'hashtags', label: '🏷️ Hashtags' },
          { key: 'besttime', label: '⏰ Best Time' },
          { key: 'insights', label: '💡 Insights' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Generate Tab ─── */}
      {activeTab === 'generate' && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Platform */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Target Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, platform: p }))}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      form.platform === p ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <PlatformIcon platform={p} />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Topic / Subject *</label>
              <input
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                placeholder="e.g., Dashain sale, new product launch, business tips..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
              <label className="block text-sm font-bold text-gray-700 mb-2 mt-4">Business Name</label>
              <input
                value={form.business_name}
                onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                placeholder="Your business name..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Tone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Content Tone</label>
              <div className="space-y-2">
                {TONES.map(t => (
                  <label
                    key={t.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.tone === t.value ? 'border-violet-500 bg-violet-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input type="radio" name="tone" value={t.value} checked={form.tone === t.value}
                      onChange={e => setForm(f => ({ ...f, tone: e.target.value }))} className="sr-only" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Niche */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-bold text-gray-700 mb-3">Business Niche</label>
              <div className="grid grid-cols-2 gap-2">
                {NICHES.map(n => (
                  <button
                    key={n.value}
                    onClick={() => setForm(f => ({ ...f, niche: n.value }))}
                    className={`text-xs font-semibold py-2 px-3 rounded-xl border-2 text-left transition-all ${
                      form.niche === n.value ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !form.topic.trim()}
              className="w-full py-4 rounded-2xl font-black text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
            >
              {loading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating...</>
              ) : <><span>✨</span> Generate Content</>}
            </button>
          </div>

          {/* Result */}
          <div className="lg:col-span-3">
            {result ? (
              <div className="space-y-4">
                {/* Main result */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Generated Content</h3>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${result.within_limit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {result.char_count}/{result.char_limit} chars
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={result.content}
                    onChange={e => setResult(r => ({ ...r, content: e.target.value }))}
                    rows={12}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none leading-relaxed"
                  />
                  {/* Hashtags */}
                  {result.hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.hashtags.map(tag => (
                        <span key={tag} className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-semibold border border-violet-100">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      🔄 Regenerate
                    </button>
                    <button
                      onClick={useContent}
                      className="flex-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
                    >
                      Use This → Compose
                    </button>
                  </div>
                </div>

                {/* Alternatives */}
                {result.alternatives?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Alternative Versions</h3>
                    <div className="space-y-3">
                      {result.alternatives.map((alt, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4">
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{alt}</p>
                          <button
                            onClick={() => setResult(r => ({ ...r, content: alt }))}
                            className="mt-2 text-xs font-semibold text-rose-500 hover:text-rose-600"
                          >
                            Use this version →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="font-bold text-gray-700 text-lg mb-2">Ready to Generate</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Fill in the topic, choose your tone and platform, then click Generate to create engaging content for Nepal's market.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Hashtags Tab ─── */}
      {activeTab === 'hashtags' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-3">Hashtag Intelligence</h3>
            <p className="text-sm text-gray-500 mb-4">Enter your post content to get smart hashtag suggestions optimized for Nepal's audience</p>
            <textarea
              value={hashtagInput}
              onChange={e => setHashtagInput(e.target.value)}
              placeholder="Paste your post content here to get hashtag suggestions..."
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
            />
            <button
              onClick={handleHashtags}
              disabled={suggestingHashtags || !hashtagInput.trim()}
              className="mt-3 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
            >
              {suggestingHashtags ? '🔍 Analyzing...' : '🏷️ Suggest Hashtags'}
            </button>
          </div>

          {hashtagResult && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-bold text-gray-900 mb-3">📍 Suggested for Your Content</h4>
                <div className="flex flex-wrap gap-2">
                  {hashtagResult.suggested.map(tag => (
                    <span key={tag} className="bg-violet-50 text-violet-700 text-sm px-3 py-1.5 rounded-full font-semibold border border-violet-100 cursor-pointer hover:bg-violet-100 transition-colors"
                      onClick={() => navigator.clipboard.writeText(tag).then(() => toast.success('Copied!'))}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {hashtagResult.your_best.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h4 className="font-bold text-gray-900 mb-3">⭐ Your Top Performing Hashtags</h4>
                  <div className="space-y-2">
                    {hashtagResult.your_best.map(h => (
                      <div key={h.hashtag} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm font-semibold text-gray-800">{h.hashtag}</span>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          avg {h.avg_likes} ❤️
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h4 className="font-bold text-gray-900 mb-3">🇳🇵 Trending in Nepal</h4>
                <div className="flex flex-wrap gap-2">
                  {hashtagResult.trending_nepal.map(tag => (
                    <span key={tag} className="bg-rose-50 text-rose-700 text-sm px-3 py-1.5 rounded-full font-semibold border border-rose-100">{tag}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Best Time Tab ─── */}
      {activeTab === 'besttime' && bestTime && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-1">🏆 Best Times to Post</h3>
              <p className="text-xs text-gray-400 mb-4">{bestTime.has_real_data ? 'Based on your actual post performance' : 'Nepal market averages (post more to see your data)'}</p>
              <div className="space-y-3">
                {bestTime.best_times.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black"
                      style={{ background: `linear-gradient(135deg, hsl(${340 - i * 20}, 80%, 60%), hsl(${280 - i * 20}, 70%, 60%))` }}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                      {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                    </div>
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${t.score}%`, background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-8 text-right">{t.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">💡 Nepal Posting Tips</h3>
              <ul className="space-y-3">
                {bestTime.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">{i+1}</span>
                    <span className="text-sm text-gray-600 leading-snug">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
            <h3 className="font-bold text-gray-900 mb-4">📊 Engagement Heatmap (Hour × Day)</h3>
            <div className="min-w-max">
              <div className="flex gap-1 mb-1 ml-8">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="w-6 text-center text-[9px] text-gray-400 font-medium">{h}</div>
                ))}
              </div>
              {DAYS.map((day, d) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <span className="w-7 text-[10px] text-gray-500 font-bold">{day}</span>
                  {Array.from({ length: 24 }, (_, h) => {
                    const cell = bestTime.heatmap.find(c => c.day === d && c.hour === h);
                    const val = cell?.value || 0;
                    const max = Math.max(...bestTime.heatmap.map(c => c.value), 1);
                    const pct = val / max;
                    return (
                      <div
                        key={h}
                        title={`${day} ${h}:00 — ${val} avg engagement`}
                        className="w-6 h-6 rounded-sm"
                        style={{ background: pct > 0 ? `rgba(244, 63, 94, ${0.1 + pct * 0.9})` : '#f9fafb' }}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <span>Low</span>
                <div className="flex gap-0.5">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map(v => (
                    <div key={v} className="w-4 h-4 rounded-sm" style={{ background: `rgba(244, 63, 94, ${v})` }} />
                  ))}
                </div>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Insights Tab ─── */}
      {activeTab === 'insights' && insights && (
        <div className="space-y-4 max-w-3xl">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Posts Published', value: insights.summary.published, icon: '✅', color: '#10b981' },
              { label: 'Failed Posts', value: insights.summary.failed, icon: '❌', color: '#ef4444' },
              { label: 'Avg Engagement', value: insights.summary.avg_engagement, icon: '📈', color: '#8b5cf6' },
              { label: 'Unread Messages', value: insights.summary.unread_messages, icon: '💬', color: '#3b82f6' },
              { label: 'Total Posts', value: insights.summary.total_posts, icon: '📝', color: '#f59e0b' },
              { label: 'Best Hashtag', value: insights.summary.best_hashtag || 'N/A', icon: '🏷️', color: '#ec4899' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm mb-2" style={{ background: `${card.color}15` }}>
                  {card.icon}
                </div>
                <div className="text-2xl font-black text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Insight cards */}
          {insights.insights.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-semibold text-gray-700">All good! No critical issues detected.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.insights.map((ins, i) => {
                const colors = { error: 'border-red-100 bg-red-50', warning: 'border-amber-100 bg-amber-50', success: 'border-emerald-100 bg-emerald-50', info: 'border-blue-100 bg-blue-50' };
                return (
                  <div key={i} className={`rounded-2xl border p-5 flex items-start gap-4 ${colors[ins.type] || colors.info}`}>
                    <span className="text-2xl flex-shrink-0">{ins.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{ins.title}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{ins.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
