import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { aiAPI } from '../utils/api';

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: '📘', limit: 63206 },
  { value: 'instagram', label: 'Instagram', icon: '📸', limit: 2200 },
  { value: 'tiktok', label: 'TikTok', icon: '🎵', limit: 2200 },
];

const TONES = [
  { value: 'promotional', label: 'Promotional', emoji: '📣', desc: 'Drive sales & offers' },
  { value: 'educational', label: 'Educational', emoji: '💡', desc: 'Teach & inform' },
  { value: 'engaging', label: 'Engaging', emoji: '🤝', desc: 'Spark conversations' },
  { value: 'festival', label: 'Festival', emoji: '🎊', desc: 'Celebrate occasions' },
  { value: 'product', label: 'Product Launch', emoji: '🚀', desc: 'Showcase products' },
  { value: 'announcement', label: 'Announcement', emoji: '📢', desc: 'Share news' },
  { value: 'story', label: 'Brand Story', emoji: '📖', desc: 'Connect emotionally' },
];

const NICHES = [
  { value: 'general', label: 'General', icon: '🌐' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'food', label: 'Food & Restaurant', icon: '🍜' },
  { value: 'fashion', label: 'Fashion', icon: '👗' },
  { value: 'tech', label: 'Technology', icon: '💻' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'beauty', label: 'Beauty', icon: '💄' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏠' },
];

const REWRITE_MODES = [
  { value: 'improve', label: 'Improve', icon: '✨', desc: 'Fix grammar, enhance quality' },
  { value: 'make_viral', label: 'Make Viral', icon: '🔥', desc: 'Optimize for maximum reach' },
  { value: 'shorten', label: 'Shorten', icon: '✂️', desc: 'Make concise & punchy' },
  { value: 'expand', label: 'Expand', icon: '📝', desc: 'Add detail & storytelling' },
  { value: 'add_emotion', label: 'Add Emotion', icon: '❤️', desc: 'Add warmth & feeling' },
  { value: 'formal', label: 'Formal', icon: '💼', desc: 'Professional business tone' },
  { value: 'casual', label: 'Casual', icon: '😊', desc: 'Friendly conversational' },
];

const TABS = [
  { key: 'generate', label: 'Generate', icon: '✨' },
  { key: 'rewrite', label: 'Rewrite & Improve', icon: '🔄' },
  { key: 'hashtags', label: 'Hashtags', icon: '🏷️' },
  { key: 'reply', label: 'Reply Suggestions', icon: '💬' },
  { key: 'translate', label: 'Translate', icon: '🌐' },
  { key: 'caption', label: 'Image Caption', icon: '🖼️' },
  { key: 'best_time', label: 'Best Time', icon: '⏰' },
  { key: 'insights', label: 'AI Insights', icon: '📊' },
];

function GrokBadge({ available }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold border ${
      available
        ? 'bg-violet-50 text-violet-700 border-violet-200'
        : 'bg-gray-100 text-gray-500 border-gray-200'
    }`}>
      <span className="text-[10px]">⚡</span>
      {available ? 'Grok AI' : 'Template Mode'}
    </span>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}

// ─── Generate Tab ─────────────────────────────────────────────────────────────
function GenerateTab({ grokAvailable }) {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState('facebook');
  const [tone, setTone] = useState('promotional');
  const [niche, setNiche] = useState('general');
  const [topic, setTopic] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.generate({ topic, tone, platform, business_name: businessName, niche, language, additional_context: context });
      setResult(res.data);
      setEditedContent(res.data.content);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUse = () => {
    const params = new URLSearchParams();
    params.set('ai_content', editedContent);
    if (result?.hashtags?.length) params.set('ai_hashtags', result.hashtags.join(' '));
    navigate(`/compose?${params.toString()}`);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: controls */}
      <div className="space-y-5">
        {/* Platform */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Platform</label>
          <div className="flex gap-2">
            {PLATFORMS.map(p => (
              <button key={p.value} onClick={() => setPlatform(p.value)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  platform === p.value ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={platform === p.value ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}>
                <span className="text-xl">{p.icon}</span>
                <span className="text-xs">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Topic / Subject *</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Dashain sale on clothes, New restaurant opening, Tech event"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
          />
        </div>

        {/* Business name */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Business Name</label>
          <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
            placeholder="Your business name"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {/* Tone */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Content Tone</label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(t => (
              <button key={t.value} onClick={() => setTone(t.value)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  tone === t.value ? 'border-rose-300 bg-rose-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                <span className="text-base">{t.emoji}</span>
                <div>
                  <p className={`text-xs font-bold ${tone === t.value ? 'text-rose-700' : 'text-gray-700'}`}>{t.label}</p>
                  <p className="text-[10px] text-gray-400">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Niche + Language */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Niche</label>
            <select value={niche} onChange={e => setNiche(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100">
              {NICHES.map(n => <option key={n.value} value={n.value}>{n.icon} {n.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Language</label>
            <div className="flex gap-2">
              {[{ value: 'en', label: '🇬🇧 EN' }, { value: 'ne', label: '🇳🇵 NE' }].map(l => (
                <button key={l.value} onClick={() => setLanguage(l.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    language === l.value ? 'text-white border-transparent' : 'border-gray-200 text-gray-500'
                  }`}
                  style={language === l.value ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional context */}
        <div>
          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            Additional Context <span className="text-gray-300 font-normal normal-case">(optional)</span>
          </label>
          <textarea value={context} onChange={e => setContext(e.target.value)} rows={2}
            placeholder="e.g. We have 30% off, opening on Falgun 15, targeting women aged 18-35..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
          />
        </div>

        <button onClick={handleGenerate} disabled={loading || !topic.trim()}
          className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Grok is thinking…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              ⚡ Generate with Grok AI
            </span>
          )}
        </button>
      </div>

      {/* Right: result */}
      <div>
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
            <div className="text-5xl mb-4">✨</div>
            <p className="font-bold text-gray-600 text-lg mb-2">Your AI-generated post will appear here</p>
            <p className="text-sm text-gray-400">Powered by Grok AI — real, contextual content for Nepal market</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Generated Post</span>
                  <GrokBadge available={result.ai_powered} />
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${result.within_limit ? 'text-emerald-600' : 'text-red-500'}`}>
                    {result.char_count}/{result.char_limit}
                  </span>
                  <CopyBtn text={editedContent} />
                </div>
              </div>
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                rows={10}
                className="w-full text-sm text-gray-800 leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Hashtags */}
            {result.hashtags?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suggested Hashtags</span>
                  <CopyBtn text={result.hashtags.join(' ')} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map(tag => (
                    <button key={tag} onClick={() => navigator.clipboard.writeText(tag)}
                      className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full font-medium hover:bg-violet-100 transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {result.alternatives?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alternative Versions</p>
                {result.alternatives.map((alt, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-semibold">Variant {i + 2}</span>
                      <div className="flex gap-2">
                        <CopyBtn text={alt} />
                        <button onClick={() => { setEditedContent(alt); toast.success('Switched to variant ' + (i + 2)); }}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold">
                          Use this
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed">{alt}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={handleGenerate} disabled={loading}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                ↺ Regenerate
              </button>
              <button onClick={handleUse}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
                Use in Composer →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rewrite Tab ──────────────────────────────────────────────────────────────
function RewriteTab({ grokAvailable }) {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('improve');
  const [platform, setPlatform] = useState('facebook');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRewrite = async () => {
    if (!content.trim()) { toast.error('Enter content to rewrite'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.rewrite({ content, instruction: mode, platform });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rewrite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Your Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
              placeholder="Paste your existing post here..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Rewrite Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {REWRITE_MODES.map(m => (
                <button key={m.value} onClick={() => setMode(m.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                    mode === m.value ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <span className="text-base">{m.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${mode === m.value ? 'text-violet-700' : 'text-gray-700'}`}>{m.label}</p>
                    <p className="text-[10px] text-gray-400">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleRewrite} disabled={loading || !content.trim()}
            className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Grok is rewriting…
              </span>
            ) : '⚡ Rewrite with Grok'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rewritten Version</span>
                  <CopyBtn text={result.rewritten} />
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result.rewritten}</p>
                <p className="text-xs text-gray-400 mt-3">{result.char_count} characters</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setContent(result.rewritten)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
                  ↓ Use as Input
                </button>
                <button onClick={() => {
                  const params = new URLSearchParams({ ai_content: result.rewritten });
                  window.location.href = `/compose?${params.toString()}`;
                }} className="flex-1 py-2.5 rounded-xl text-xs font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
                  Use in Composer →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
              <div className="text-5xl mb-4">🔄</div>
              <p className="font-bold text-gray-600 mb-2">Rewritten content will appear here</p>
              <p className="text-sm text-gray-400">Grok AI transforms your content while keeping the message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Hashtags Tab ─────────────────────────────────────────────────────────────
function HashtagsTab({ grokAvailable }) {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [niche, setNiche] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!content.trim()) { toast.error('Enter some content first'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.hashtags({ content, platform, niche });
      setResult(res.data);
    } catch { toast.error('Failed to generate hashtags'); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    navigator.clipboard.writeText((result?.suggested || []).join(' '));
    toast.success('All hashtags copied!');
  };

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Your Post Content</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8}
              placeholder="Paste or type your post content here to get relevant hashtags..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Niche</label>
              <select value={niche} onChange={e => setNiche(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {NICHES.map(n => <option key={n.value} value={n.value}>{n.icon} {n.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading || !content.trim()}
            className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
            {loading ? 'Analyzing…' : '🏷️ AI-Powered Suggest Hashtags'}
          </button>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Suggested ({result.suggested?.length})</span>
                    <GrokBadge available={result.ai_powered} />
                  </div>
                  <button onClick={copyAll} className="text-xs text-rose-500 font-bold hover:text-rose-600">Copy All</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.suggested?.map(tag => (
                    <button key={tag} onClick={() => { navigator.clipboard.writeText(tag); toast.success(`${tag} copied!`); }}
                      className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full hover:bg-violet-100">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {result.your_best?.length > 0 && (
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
                  <p className="text-xs font-bold text-emerald-700 mb-2">⭐ Your Best Performers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.your_best.map(h => (
                      <span key={h.hashtag} className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
                        {h.hashtag} <span className="opacity-60">({h.avg_likes} avg ❤️)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
                <p className="text-xs font-bold text-orange-700 mb-2">🇳🇵 Trending Nepal Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.trending_nepal?.map(tag => (
                    <button key={tag} onClick={() => navigator.clipboard.writeText(tag)}
                      className="text-xs bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full font-medium hover:bg-orange-200">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
              <div className="text-5xl mb-4">🏷️</div>
              <p className="font-bold text-gray-600 mb-2">Hashtag suggestions will appear here</p>
              <p className="text-sm text-gray-400">Get Nepal-specific hashtags that maximize reach</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reply Suggestions Tab ────────────────────────────────────────────────────
function ReplyTab({ grokAvailable }) {
  const [comment, setComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [postContent, setPostContent] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [tone, setTone] = useState('friendly');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleGenerate = async () => {
    if (!comment.trim()) { toast.error('Enter a comment to reply to'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.replySuggestion({ comment, commenter_name: commenterName, post_content: postContent, platform, tone, business_name: businessName });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Comment to Reply To *</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
              placeholder="Paste the customer comment here..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Commenter Name</label>
              <input type="text" value={commenterName} onChange={e => setCommenterName(e.target.value)}
                placeholder="Ram, Sita..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Business Name</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                placeholder="Your business"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Reply Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'friendly', label: 'Friendly', icon: '😊' },
                { value: 'professional', label: 'Professional', icon: '💼' },
                { value: 'playful', label: 'Playful', icon: '🎉' },
                { value: 'formal', label: 'Formal', icon: '🎩' },
              ].map(t => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all ${
                    tone === t.value ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading || !comment.trim()}
            className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating replies…
              </span>
            ) : '💬 Generate AI Reply Suggestions'}
          </button>
        </div>

        <div>
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Suggested Replies</p>
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-400 font-semibold">Option {i + 1}</span>
                    <CopyBtn text={s} />
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
              <div className="text-5xl mb-4">💬</div>
              <p className="font-bold text-gray-600 mb-2">Reply suggestions will appear here</p>
              <p className="text-sm text-gray-400">AI generates human-like replies in your brand voice</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Translate Tab ────────────────────────────────────────────────────────────
function TranslateTab({ grokAvailable }) {
  const [content, setContent] = useState('');
  const [targetLang, setTargetLang] = useState('ne');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTranslate = async () => {
    if (!content.trim()) { toast.error('Enter content to translate'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.translate({ content, target_language: targetLang });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Content to Translate</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
              placeholder="Paste your social media post here..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Translate to</label>
            <div className="flex gap-3">
              {[{ value: 'ne', flag: '🇳🇵', label: 'Nepali (नेपाली)' }, { value: 'en', flag: '🇬🇧', label: 'English' }].map(l => (
                <button key={l.value} onClick={() => setTargetLang(l.value)}
                  className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    targetLang === l.value ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600'
                  }`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleTranslate} disabled={loading || !content.trim()}
            className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Grok is translating…
              </span>
            ) : '🌐 Translate with Grok'}
          </button>
        </div>
        <div>
          {result ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {result.target_language === 'ne' ? '🇳🇵 Nepali Translation' : '🇬🇧 English Translation'}
                </span>
                <CopyBtn text={result.translated} />
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{result.translated}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
              <div className="text-5xl mb-4">🌐</div>
              <p className="font-bold text-gray-600 mb-2">Translation will appear here</p>
              <p className="text-sm text-gray-400">Grok translates naturally — not word-for-word</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Caption Tab ──────────────────────────────────────────────────────────────
function CaptionTab({ grokAvailable }) {
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('engaging');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState([]);

  const handleGenerate = async () => {
    if (!description.trim()) { toast.error('Describe your image first'); return; }
    setLoading(true);
    try {
      const res = await aiAPI.caption({ image_description: description, platform, tone, business_name: businessName, count: 3 });
      setCaptions(res.data.captions || []);
    } catch (err) {
      toast.error('Caption generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Describe Your Image</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
              placeholder="e.g. A photo of our new restaurant interior with warm lighting, traditional Nepali decor and a family dining together..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Caption Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {TONES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Business Name</label>
            <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="Your business (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
          </div>
          <button onClick={handleGenerate} disabled={loading || !description.trim()}
            className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating captions…
              </span>
            ) : '🖼️ Generate AI Captions'}
          </button>
        </div>
        <div>
          {captions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Caption Options</p>
              {captions.map((cap, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-400 font-semibold">Caption {i + 1}</span>
                    <div className="flex gap-2">
                      <CopyBtn text={cap} />
                      <button onClick={() => {
                        const params = new URLSearchParams({ ai_content: cap });
                        window.location.href = `/compose?${params.toString()}`;
                      }} className="text-xs text-rose-500 font-semibold hover:text-rose-600">Use →</button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{cap}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
              <div className="text-5xl mb-4">🖼️</div>
              <p className="font-bold text-gray-600 mb-2">Image captions will appear here</p>
              <p className="text-sm text-gray-400">Describe your image and get 3 caption options</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Best Time Tab ────────────────────────────────────────────────────────────
function BestTimeTab() {
  const [platform, setPlatform] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await aiAPI.bestTime({ platform });
        setData(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [platform]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>;

  const maxScore = Math.max(...(data?.best_times?.map(t => t.score || t.avg_engagement || 0) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[{ value: 'all', label: 'All Platforms' }, ...PLATFORMS].map(p => (
          <button key={p.value} onClick={() => setPlatform(p.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              platform === p.value ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={platform === p.value ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}>
            {p.icon} {p.label || 'All'}
          </button>
        ))}
      </div>

      {/* Best times list */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Best Times to Post</h3>
            {!data?.has_real_data && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Nepal Defaults</span>}
          </div>
          <div className="space-y-3">
            {data?.best_times?.map((bt, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-black text-gray-300 w-5">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{bt.label || `${bt.day} at ${bt.hour}:00`}</span>
                    <span className="text-xs font-bold text-rose-500">{bt.score || Math.round((bt.avg_engagement || 0) * 10)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((bt.score || bt.avg_engagement || 0) / maxScore) * 100}%`,
                        background: 'linear-gradient(90deg, #f43f5e, #8b5cf6)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">Nepal Market Tips</h3>
          {data?.tips?.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <span className="text-base flex-shrink-0">💡</span>
              <p className="text-sm text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      {data?.heatmap && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-x-auto">
          <h3 className="font-bold text-gray-900 mb-4">Weekly Engagement Heatmap</h3>
          <div className="min-w-[640px]">
            <div className="grid grid-cols-25 gap-0.5" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
              <div className="text-xs text-gray-400 font-semibold text-right pr-2 py-1" />
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="text-center text-[9px] text-gray-400 font-semibold py-1">
                  {h % 4 === 0 ? `${h}h` : ''}
                </div>
              ))}
              {(data.days || []).map((day, d) => (
                <>
                  <div key={`day-${d}`} className="text-xs text-gray-500 font-semibold text-right pr-2 flex items-center justify-end py-0.5">
                    {day.slice(0, 3)}
                  </div>
                  {Array.from({ length: 24 }, (_, h) => {
                    const cell = data.heatmap.find(c => c.day === d && c.hour === h);
                    const val = cell?.value || 0;
                    const maxVal = Math.max(...data.heatmap.map(c => c.value || 0), 1);
                    const opacity = val > 0 ? 0.15 + (val / maxVal) * 0.85 : 0.05;
                    return (
                      <div key={h} className="rounded-sm py-1.5" title={`${day} ${h}:00 — ${val} engagement`}
                        style={{ background: `rgba(244, 63, 94, ${opacity})` }} />
                    );
                  })}
                </>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-xs text-gray-400">Low</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
                <div key={o} className="w-4 h-4 rounded-sm" style={{ background: `rgba(244, 63, 94, ${o})` }} />
              ))}
              <span className="text-xs text-gray-400">High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────
function InsightsTab({ grokAvailable }) {
  const [days, setDays] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await aiAPI.insights({ days });
        setData(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [days]);

  const TYPE_STYLES = {
    error:   'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    ai:      'bg-violet-50 border-violet-200 text-violet-700',
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {['7', '14', '30', '90'].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                days === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}>
              {d}D
            </button>
          ))}
        </div>
        {grokAvailable && (
          <span className="flex items-center gap-1 text-xs text-violet-600 font-semibold bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
            🤖 Grok AI insights included
          </span>
        )}
      </div>

      {/* Stats grid */}
      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Total Posts', value: data.summary.total_posts, icon: '📋', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
            { label: 'Published', value: data.summary.published, icon: '✅', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
            { label: 'Failed', value: data.summary.failed, icon: '❌', gradient: 'linear-gradient(135deg, #ef4444, #f97316)' },
            { label: 'Avg Engagement', value: data.summary.avg_engagement, icon: '❤️', gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)' },
            { label: 'Unread Messages', value: data.summary.unread_messages, icon: '💬', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
            { label: 'Best Hashtag', value: data.summary.best_hashtag || '—', icon: '🏷️', gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)', isText: true },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: stat.gradient }}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className={`font-black text-gray-900 truncate ${stat.isText ? 'text-sm' : 'text-xl'}`}>{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight cards */}
      <div className="space-y-3">
        {(data?.insights || []).map((insight, i) => (
          <div key={i} className={`rounded-xl border p-4 flex items-start gap-3 ${TYPE_STYLES[insight.type] || TYPE_STYLES.info}`}>
            <span className="text-xl flex-shrink-0">{insight.icon}</span>
            <div>
              <p className="font-bold text-sm">{insight.title}</p>
              <p className="text-sm opacity-80 mt-0.5">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIGeneratorPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [grokAvailable, setGrokAvailable] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    aiAPI.status()
      .then(res => {
        setGrokAvailable(res.data.grok_available);
        setStatusLoaded(true);
      })
      .catch(() => setStatusLoaded(true));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            AI Studio
            {statusLoaded && <GrokBadge available={grokAvailable} />}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Powered by Grok AI — generate, rewrite, translate, and automate your content
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.key ? 'text-white shadow-sm' : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'
            }`}
            style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {activeTab === 'generate'  && <GenerateTab grokAvailable={grokAvailable} />}
        {activeTab === 'rewrite'   && <RewriteTab grokAvailable={grokAvailable} />}
        {activeTab === 'hashtags'  && <HashtagsTab grokAvailable={grokAvailable} />}
        {activeTab === 'reply'     && <ReplyTab grokAvailable={grokAvailable} />}
        {activeTab === 'translate' && <TranslateTab grokAvailable={grokAvailable} />}
        {activeTab === 'caption'   && <CaptionTab grokAvailable={grokAvailable} />}
        {activeTab === 'best_time' && <BestTimeTab />}
        {activeTab === 'insights'  && <InsightsTab grokAvailable={grokAvailable} />}
      </div>
    </div>
  );
}
