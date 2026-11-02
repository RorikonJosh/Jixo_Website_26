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
      return;
    }
    if (!form.displayDate.trim()) {
      setError('請填寫日期。');
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
    <form className="admin-portfolio-edit-form" onSubmit={handleSubmit}>
      <fieldset className="admin-form-section">
        <legend>基本資料</legend>
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
          <span>日期（例：2026.3.29）</span>
          <input
            type="text"
            value={form.displayDate}
            onChange={(e) => updateField('displayDate', e.target.value)}
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
        <label className="admin-field">
          <span>外部連結（Pixiv 等）</span>
          <input
            type="url"
            value={form.externalLink}
            onChange={(e) => updateField('externalLink', e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => updateField('published', e.target.checked)}
          />
          公開顯示
        </label>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>標題</legend>
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
          <span>日文標題</span>
          <input
            type="text"
            value={form.titleJp}
            onChange={(e) => updateField('titleJp', e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>英文標題</span>
          <input
            type="text"
            value={form.titleEn}
            onChange={(e) => updateField('titleEn', e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>描述</legend>
        <label className="admin-field">
          <span>繁中描述</span>
          <textarea
            rows={3}
            value={form.descZh}
            onChange={(e) => updateField('descZh', e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>日文描述</span>
          <textarea
            rows={3}
            value={form.descJp}
            onChange={(e) => updateField('descJp', e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>英文描述</span>
          <textarea
            rows={3}
            value={form.descEn}
            onChange={(e) => updateField('descEn', e.target.value)}
          />
        </label>
      </fieldset>

      {isCommission && (
        <fieldset className="admin-form-section">
          <legend>委托人（選填）</legend>
          <label className="admin-field">
            <span>繁中</span>
            <input
              type="text"
              value={form.clientZh}
              onChange={(e) => updateField('clientZh', e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>日文</span>
            <input
              type="text"
              value={form.clientJp}
              onChange={(e) => updateField('clientJp', e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>英文</span>
            <input
              type="text"
              value={form.clientEn}
              onChange={(e) => updateField('clientEn', e.target.value)}
            />
          </label>
        </fieldset>
      )}

      <fieldset className="admin-form-section">
        <legend>FANBOX / 差分資訊（選填）</legend>
        <label className="admin-field">
          <span>標籤（繁中）</span>
          <input
            type="text"
            value={form.bonusLabelZh}
            onChange={(e) => updateField('bonusLabelZh', e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>說明（繁中）</span>
          <input
            type="text"
            value={form.bonusTextZh}
            onChange={(e) => updateField('bonusTextZh', e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>連結 URL</span>
          <input
            type="url"
            value={form.bonusUrl}
            onChange={(e) => updateField('bonusUrl', e.target.value)}
            placeholder="https://kareya.fanbox.cc/..."
          />
        </label>
      </fieldset>

      <p className="admin-note">圖片路徑維持不變；若要換圖請刪除後重新上傳。</p>

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
