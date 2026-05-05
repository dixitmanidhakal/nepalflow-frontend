import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { templatesAPI } from '../utils/api';

const CATEGORIES = ['general', 'promotion', 'product', 'event', 'festival', 'announcement', 'tip', 'quote', 'story'];
const CATEGORY_ICONS = { general: '📄', promotion: '📢', product: '🛍️', event: '🎪', festival: '🎊', announcement: '📌', tip: '💡', quote: '💬', story: '📖' };

function TemplateCard({ template, onUse, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{CATEGORY_ICONS[template.category] || '📄'}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{template.name}</h3>
            <span className="text-xs text-gray-400 capitalize">{template.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(template)} className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => onDelete(template.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {template.description && (
        <p className="text-xs text-gray-500 mb-2 italic">{template.description}</p>
      )}

      <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
        {template.content}
      </p>
      {template.content.length > 120 && (
        <button onClick={() => setExpanded(e => !e)} className="text-xs text-rose-500 font-semibold mt-1 hover:text-rose-600">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {template.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {template.hashtags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
          ))}
          {template.hashtags.length > 4 && <span className="text-xs text-gray-400">+{template.hashtags.length - 4}</span>}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <span className="text-xs text-gray-400">Used {template.use_count} times</span>
        <button
          onClick={() => onUse(template)}
          className="px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}
        >
          Use Template →
        </button>
      </div>
    </div>
  );
}

function TemplateModal({ template, onClose, onSave }) {
  const [form, setForm] = useState({
    name: template?.name || '',
    description: template?.description || '',
    content: template?.content || '',
    category: template?.category || 'general',
    platforms: template?.platforms || ['facebook', 'instagram'],
    hashtags: template?.hashtags || [],
  });
  const [hashtagInput, setHashtagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const addHashtag = () => {
    const tag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
    if (tag !== '#' && !form.hashtags.includes(tag)) setForm(f => ({ ...f, hashtags: [...f.hashtags, tag] }));
    setHashtagInput('');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) { toast.error('Name and content are required'); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally { setSaving(false); }
  };

  const togglePlatform = (p) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900">{template ? 'Edit Template' : 'New Template'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Template Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Festival Greeting, Product Launch, Weekly Tip..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (optional)</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this template for?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Content *</label>
            <p className="text-xs text-gray-400 mb-2">Use {"{{variable}}"} for dynamic placeholders (e.g., {"{{product_name}}"}, {"{{price}}"})</p>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="Write your template content here...&#10;&#10;Use {{business}}, {{topic}}, {{cta}} as variables!"
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100">
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Platforms</label>
              <div className="flex gap-2">
                {['facebook', 'instagram', 'tiktok'].map(p => (
                  <button key={p} type="button" onClick={() => togglePlatform(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${form.platforms.includes(p) ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 text-gray-500'}`}>
                    {p === 'facebook' ? '📘' : p === 'instagram' ? '📸' : '🎵'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Default Hashtags</label>
            <div className="flex gap-2 mb-2">
              <input value={hashtagInput} onChange={e => setHashtagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder="#hashtag" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100" />
              <button onClick={addHashtag} type="button" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.hashtags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                  {tag}<button type="button" onClick={() => setForm(f => ({ ...f, hashtags: f.hashtags.filter(h => h !== tag) }))} className="ml-0.5 hover:text-violet-900">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-2 px-8 py-3 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
            {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalTemplate, setModalTemplate] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [useModal, setUseModal] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.category = filter;
      if (search) params.search = search;
      const res = await templatesAPI.list(params);
      setTemplates(res.data.templates);
      setCategories(res.data.categories);
    } catch { toast.error('Failed to load templates'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, [filter, search]); // eslint-disable-line

  const handleSave = async (data) => {
    try {
      if (modalTemplate?.id) {
        await templatesAPI.update(modalTemplate.id, data);
        toast.success('Template updated!');
      } else {
        await templatesAPI.create(data);
        toast.success('Template created! 🎉');
      }
      await fetchTemplates();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); throw err; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await templatesAPI.delete(id);
      toast.success('Template deleted');
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const handleUse = (template) => {
    // Navigate to compose with template content
    const params = new URLSearchParams({ template_id: template.id });
    navigate(`/compose?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Content Templates</h1>
          <p className="text-sm text-gray-400 mt-0.5">Reusable post templates to speed up your content creation</p>
        </div>
        <button
          onClick={() => setModalTemplate(null)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #8b5cf6 100%)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 max-w-xs">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${!filter ? 'text-white shadow-sm' : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'}`}
            style={!filter ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(filter === c ? '' : c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === c ? 'text-white shadow-sm' : 'text-gray-500 bg-white border border-gray-200 hover:border-gray-300'}`}
              style={filter === c ? { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' } : {}}>
              {CATEGORY_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">No templates yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create reusable templates to post faster and more consistently</p>
          <button onClick={() => setModalTemplate(null)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' }}>
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => (
            <TemplateCard key={t.id} template={t} onUse={handleUse} onEdit={setModalTemplate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalTemplate !== undefined && (
        <TemplateModal
          template={modalTemplate}
          onClose={() => setModalTemplate(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
