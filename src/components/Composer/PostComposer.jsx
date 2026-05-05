import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { postsAPI, accountsAPI } from '../../utils/api';
import { platformIcon } from '../../utils/helpers';

const MAX_CHARS = 63206;

export default function PostComposer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    accountId: '',
    content: '',
    hashtags: [],
    mediaUrls: [],
    scheduledAt: dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  });
  const [hashtagInput, setHashtagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    accountsAPI.list().then(res => setAccounts(res.data.accounts));
    if (editId) {
      postsAPI.get(editId).then(res => {
        const p = res.data.post;
        setForm({
          accountId: p.account_id,
          content: p.content,
          hashtags: p.hashtags || [],
          mediaUrls: p.media_urls || [],
          scheduledAt: dayjs(p.scheduled_at).format('YYYY-MM-DDTHH:mm'),
        });
      });
    }
  }, [editId]);

  const validate = () => {
    const errs = {};
    if (!form.accountId) errs.accountId = t('composer.validation.account_required');
    if (!form.content.trim()) errs.content = t('composer.validation.content_required');
    if (form.content.length > MAX_CHARS) errs.content = t('composer.validation.content_too_long');
    if (!form.scheduledAt) errs.scheduledAt = t('composer.validation.schedule_required');
    else if (new Date(form.scheduledAt) <= new Date()) errs.scheduledAt = t('composer.validation.future_time');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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
        toast.success('Post updated!');
      } else {
        await postsAPI.create(payload);
        toast.success(t('composer.success'));
      }
      navigate('/calendar');
    } catch (err) {
      toast.error(err.response?.data?.error || t('composer.error'));
    } finally {
      setLoading(false);
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
    if (tag && tag !== '#' && !form.hashtags.includes(tag)) {
      setForm(f => ({ ...f, hashtags: [...f.hashtags, tag] }));
    }
    setHashtagInput('');
  };

  const removeHashtag = (tag) => setForm(f => ({ ...f, hashtags: f.hashtags.filter(h => h !== tag) }));

  const addImage = () => {
    if (imageInput.trim() && !form.mediaUrls.includes(imageInput.trim())) {
      setForm(f => ({ ...f, mediaUrls: [...f.mediaUrls, imageInput.trim()] }));
    }
    setImageInput('');
  };

  const selectedAccount = accounts.find(a => a.id === form.accountId);
  const charPercent = Math.min((form.content.length / MAX_CHARS) * 100, 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editId ? t('composer.edit_title') : t('composer.title')}
        </h1>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          {preview ? '✏️ Edit' : '👁️ Preview'}
        </button>
      </div>

      {preview ? (
        /* ── Preview Mode ── */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">
              {platformIcon(selectedAccount?.platform)}
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">{selectedAccount?.account_name || 'Your Page'}</div>
              <div className="text-xs text-gray-500">{form.scheduledAt && new Date(form.scheduledAt).toLocaleString()}</div>
            </div>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap text-sm">
            {form.content}
            {form.hashtags.length > 0 && (
              <span className="text-blue-500"> {form.hashtags.join(' ')}</span>
            )}
          </p>
          {form.mediaUrls[0] && (
            <img
              src={form.mediaUrls[0]}
              alt="Post preview"
              className="mt-4 rounded-xl w-full object-cover max-h-72"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="mt-6 flex gap-3">
            <button onClick={() => setPreview(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              Edit
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {loading ? t('common.loading') : t('composer.schedule_button')}
            </button>
          </div>
        </div>
      ) : (
        /* ── Compose Form ── */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('composer.select_account')}</label>
            {accounts.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">No accounts connected.</p>
                <a href="/accounts" className="text-primary-600 text-sm hover:underline">Connect Facebook →</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map(acc => (
                  <label
                    key={acc.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.accountId === acc.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountId"
                      value={acc.id}
                      checked={form.accountId === acc.id}
                      onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
                      className="sr-only"
                    />
                    <span className="text-xl">{platformIcon(acc.platform)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{acc.account_name}</div>
                      <div className="text-xs text-gray-400 capitalize">{acc.platform}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.accountId && <p className="text-red-500 text-xs mt-2">{errors.accountId}</p>}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('composer.content')}</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={t('composer.content_placeholder')}
              rows={6}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-300 outline-none resize-none transition-colors ${
                errors.content ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {/* Character count bar */}
            <div className="flex items-center justify-between mt-2">
              {errors.content && <p className="text-red-500 text-xs">{errors.content}</p>}
              <div className="ml-auto flex items-center gap-2">
                <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${charPercent > 90 ? 'bg-red-500' : charPercent > 70 ? 'bg-yellow-500' : 'bg-primary-500'}`}
                    style={{ width: `${charPercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{form.content.length}/{MAX_CHARS.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('composer.add_hashtags')}</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={hashtagInput}
                onChange={e => setHashtagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder={t('composer.hashtag_placeholder')}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              />
              <button type="button" onClick={addHashtag} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                Add
              </button>
            </div>
            {form.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.hashtags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeHashtag(tag)} className="hover:text-blue-900">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media URL */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('composer.add_image')}</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={e => setImageInput(e.target.value)}
                placeholder={t('composer.image_placeholder')}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-300 outline-none"
              />
              <button type="button" onClick={addImage} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                Add
              </button>
            </div>
            {form.mediaUrls.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {form.mediaUrls.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" onError={e => e.target.src = ''}/>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, mediaUrls: f.mediaUrls.filter((_, j) => j !== i) }))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('composer.schedule_time')}</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              min={dayjs().add(1, 'minute').format('YYYY-MM-DDTHH:mm')}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-300 outline-none ${
                errors.scheduledAt ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.scheduledAt && <p className="text-red-500 text-xs mt-1">{errors.scheduledAt}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pb-20 md:pb-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex-1 py-3 border border-primary-200 bg-primary-50 rounded-xl text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
            >
              👁️ Preview
            </button>
            <button
              type="submit"
              disabled={loading || accounts.length === 0}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('composer.schedule_button')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
