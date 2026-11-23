import { useState } from 'react';
import { updatePortfolioItem } from '../lib/adminApi';
import {
  buildPortfolioUpdatePayload,
  portfolioRowToEditForm,
} from '../lib/portfolio';

const PAGE_OPTIONS = [
  { value: 'artwork', label: '作品集 (/artworks)' },
  { value: 'commission_general', label: '委托作品集 — 一般 (/commissions)' },
  { value: 'commission_r18', label: '委托作品集 — R18 (/commissions)' },
];

const FORM_TABS = [
  { id: 'basic', label: '基本' },
  { id: 'copy', label: '文案' },
  { id: 'extra', label: '進階' },
];

const LANG_TABS = [
  { id: 'zh', label: '繁中' },
  { id: 'jp', label: '日文' },
  { id: 'en', label: '英文' },
];

function parsePageTarget(pageTarget) {
  if (pageTarget === 'artwork') {
    return { pageType: 'artwork', commissionCategory: null };
  }
  if (pageTarget === 'commission_r18') {
    return { pageType: 'commission', commissionCategory: 'r18' };
  }
  return { pageType: 'commission', commissionCategory: 'general' };
}

export default function AdminPortfolioEditForm({ item, onCancel, onSaved }) {
  const [form, setForm] = useState(() => portfolioRowToEditForm(item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('basic');
  const [lang, setLang] = useState('zh');

  const { pageType } = parsePageTarget(form.pageTarget);
  const isCommission = pageType === 'commission';

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.titleZh.trim()) {
      setError('請至少填寫繁中標題。');
      setTab('copy');
      setLang('zh');
      return;
    }
    if (!form.displayDate.trim()) {
      setError('請填寫日期。');
      setTab('basic');
      return;
    }

    setSaving(true);
    try {
      const { pageType: nextPageType, commissionCategory } = parsePageTarget(form.pageTarget);
      await updatePortfolioItem(
        item.id,
        buildPortfolioUpdatePayload({
          pageType: nextPageType,
          commissionCategory,
          displayDate: form.displayDate,
          platform: form.platform,
          externalLink: form.externalLink || '#',
          titleZh: form.titleZh,
          titleJp: form.titleJp,
          titleEn: form.titleEn,
          descZh: form.descZh,
          descJp: form.descJp,
          descEn: form.descEn,
          bonusLabelZh: form.bonusLabelZh,
          bonusLabelJp: form.bonusLabelJp,
          bonusLabelEn: form.bonusLabelEn,
          bonusTextZh: form.bonusTextZh,
          bonusTextJp: form.bonusTextJp,
          bonusTextEn: form.bonusTextEn,
          bonusUrl: form.bonusUrl,
          clientZh: form.clientZh,
          clientJp: form.clientJp,
          clientEn: form.clientEn,
          published: form.published,
        }),
      );
      onSaved?.();
    } catch (err) {
      console.error(err);
      setError(`儲存失敗：${err?.message ?? String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-portfolio-edit-form admin-portfolio-edit-form--compact" onSubmit={handleSubmit}>
      <div className="admin-edit-tabs" role="tablist" aria-label="編輯分類">
        {FORM_TABS.map((itemTab) => (
          <button
            key={itemTab.id}
            type="button"
            role="tab"
            aria-selected={tab === itemTab.id}
            className={`admin-edit-tab${tab === itemTab.id ? ' is-active' : ''}`}
            onClick={() => setTab(itemTab.id)}
          >
            {itemTab.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="admin-edit-pane">
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>顯示頁面</span>
              <select
                value={form.pageTarget}
                onChange={(e) => updateField('pageTarget', e.target.value)}
              >
                {PAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>日期</span>
              <input
                type="text"
                value={form.displayDate}
                onChange={(e) => updateField('displayDate', e.target.value)}
                placeholder="2026.3.29"
                required
              />
            </label>
            {!isCommission && (
              <label className="admin-field">
                <span>平台</span>
                <input
                  type="text"
                  value={form.platform}
                  onChange={(e) => updateField('platform', e.target.value)}
                />
              </label>
            )}
            <label className="admin-field admin-field--full">
              <span>外部連結</span>
              <input
                type="url"
                value={form.externalLink}
                onChange={(e) => updateField('externalLink', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField('published', e.target.checked)}
            />
            公開顯示
          </label>
          {isCommission && (
            <div className="admin-form-grid">
              <label className="admin-field">
                <span>委托人（繁中）</span>
                <input
                  type="text"
                  value={form.clientZh}
                  onChange={(e) => updateField('clientZh', e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>委托人（日文）</span>
                <input
                  type="text"
                  value={form.clientJp}
                  onChange={(e) => updateField('clientJp', e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>委托人（英文）</span>
                <input
                  type="text"
                  value={form.clientEn}
                  onChange={(e) => updateField('clientEn', e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {tab === 'copy' && (
        <div className="admin-edit-pane">
          <div className="admin-lang-tabs" role="tablist" aria-label="語系">
            {LANG_TABS.map((itemLang) => (
              <button
                key={itemLang.id}
                type="button"
                role="tab"
                aria-selected={lang === itemLang.id}
                className={`admin-lang-tab${lang === itemLang.id ? ' is-active' : ''}`}
                onClick={() => setLang(itemLang.id)}
              >
                {itemLang.label}
              </button>
            ))}
          </div>

          {lang === 'zh' && (
            <div className="admin-edit-lang-block">
              <label className="admin-field">
                <span>繁中標題 *</span>
                <input
                  type="text"
                  value={form.titleZh}
                  onChange={(e) => updateField('titleZh', e.target.value)}
                  required
                />
              </label>
              <label className="admin-field">
                <span>繁中描述</span>
                <textarea
                  rows={4}
                  value={form.descZh}
                  onChange={(e) => updateField('descZh', e.target.value)}
                />
              </label>
            </div>
          )}

          {lang === 'jp' && (
            <div className="admin-edit-lang-block">
              <label className="admin-field">
                <span>日文標題</span>
                <input
                  type="text"
                  value={form.titleJp}
                  onChange={(e) => updateField('titleJp', e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>日文描述</span>
                <textarea
                  rows={4}
                  value={form.descJp}
                  onChange={(e) => updateField('descJp', e.target.value)}
                />
              </label>
            </div>
          )}

          {lang === 'en' && (
            <div className="admin-edit-lang-block">
              <label className="admin-field">
                <span>英文標題</span>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => updateField('titleEn', e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>英文描述</span>
                <textarea
                  rows={4}
                  value={form.descEn}
                  onChange={(e) => updateField('descEn', e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {tab === 'extra' && (
        <div className="admin-edit-pane">
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>FANBOX 標籤</span>
              <input
                type="text"
                value={form.bonusLabelZh}
                onChange={(e) => updateField('bonusLabelZh', e.target.value)}
                placeholder="FANBOX"
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>差分說明</span>
              <input
                type="text"
                value={form.bonusTextZh}
                onChange={(e) => updateField('bonusTextZh', e.target.value)}
              />
            </label>
            <label className="admin-field admin-field--full">
              <span>連結 URL</span>
              <input
                type="url"
                value={form.bonusUrl}
                onChange={(e) => updateField('bonusUrl', e.target.value)}
                placeholder="https://kareya.fanbox.cc/..."
              />
            </label>
          </div>
          <p className="admin-note">圖片路徑維持不變；若要換圖請刪除後重新上傳。</p>
        </div>
      )}

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-portfolio-edit-actions">
        <button type="button" className="admin-btn" onClick={onCancel} disabled={saving}>
          取消
        </button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? '儲存中…' : '儲存變更'}
        </button>
      </div>
    </form>
  );
}
