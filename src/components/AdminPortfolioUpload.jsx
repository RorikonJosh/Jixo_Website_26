import { useState } from 'react';
import {
  createPortfolioItem,
  registerPortfolioUpload,
} from '../lib/adminApi';
import {
  buildPortfolioPayload,
  buildPortfolioStoragePaths,
} from '../lib/portfolio';
import { PORTFOLIO_BUCKET } from '../lib/portfolioStorage';
import { supabase } from '../lib/supabase';

const PAGE_OPTIONS = [
  { value: 'artwork', label: '作品集 (/artworks)' },
  { value: 'commission_general', label: '委托作品集 — 一般 (/commissions)' },
  { value: 'commission_r18', label: '委托作品集 — R18 (/commissions)' },
];

const INITIAL_FORM = {
  pageTarget: 'artwork',
  displayDate: '',
  platform: 'Pixiv',
  externalLink: '',
  titleZh: '',
  titleJp: '',
  titleEn: '',
  descZh: '',
  descJp: '',
  descEn: '',
  bonusLabelZh: '',
  bonusLabelJp: '',
  bonusLabelEn: '',
  bonusTextZh: '',
  bonusTextJp: '',
  bonusTextEn: '',
  bonusUrl: '',
  clientZh: '',
  clientJp: '',
  clientEn: '',
};

function parsePageTarget(pageTarget) {
  if (pageTarget === 'artwork') {
    return { pageType: 'artwork', commissionCategory: null };
  }
  if (pageTarget === 'commission_r18') {
    return { pageType: 'commission', commissionCategory: 'r18' };
  }
  return { pageType: 'commission', commissionCategory: 'general' };
}

async function uploadPortfolioFile(path, file) {
  const { error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;
}

export default function AdminPortfolioUpload({ onPublished }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [thumbFile, setThumbFile] = useState(null);
  const [fullsizeFile, setFullsizeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { pageType, commissionCategory } = parsePageTarget(form.pageTarget);
  const isCommission = pageType === 'commission';

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!thumbFile) {
      setError('請選擇縮圖檔案。');
      return;
    }
    if (isCommission && !fullsizeFile) {
      setError('委托作品請同時上傳大圖（lightbox 用）。');
      return;
    }
    if (!form.titleZh.trim()) {
      setError('請至少填寫繁中標題。');
      return;
    }
    if (!form.displayDate.trim()) {
      setError('請填寫日期。');
      return;
    }

    setSubmitting(true);
    try {
      const paths = buildPortfolioStoragePaths({
        pageType,
        commissionCategory,
        displayDate: form.displayDate,
        thumbFileName: thumbFile.name,
        fullsizeFileName: fullsizeFile?.name || thumbFile.name,
      });

      await registerPortfolioUpload(paths.imagePath);
      if (paths.fullsizePath) {
        await registerPortfolioUpload(paths.fullsizePath);
      }

      await uploadPortfolioFile(paths.imagePath, thumbFile);
      if (paths.fullsizePath && fullsizeFile) {
        await uploadPortfolioFile(paths.fullsizePath, fullsizeFile);
      }

      await createPortfolioItem(buildPortfolioPayload({
        pageType,
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
        imagePath: paths.imagePath,
        fullsizePath: paths.fullsizePath,
      }));

      setMessage('作品已發布並設為最新展示！先前的最新作品會自動排到下方展示區。');
      setForm(INITIAL_FORM);
      setThumbFile(null);
      setFullsizeFile(null);
      event.target.reset();
      onPublished?.();
    } catch (err) {
      console.error(err);
      const detail = err?.message ?? err?.error_description ?? String(err);
      if (detail.includes('portfolio_upload_sessions') || detail.includes('row-level security')) {
        setError('上傳失敗：Storage 權限未設定完整。請在 Supabase 執行最新 portfolio migration。');
      } else if (detail.includes('Unauthorized') || detail.includes('42501')) {
        setError('上傳失敗：管理密碼錯誤或已過期，請重新登入 Admin。');
      } else if (detail.includes('Bucket not found')) {
        setError('上傳失敗：portfolio Storage bucket 尚未建立。');
      } else {
        setError(`上傳失敗：${detail}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-portfolio">
      <form className="admin-portfolio-form" onSubmit={handleSubmit}>
        <fieldset className="admin-form-section">
          <legend>發布位置</legend>
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
                placeholder="Pixiv"
              />
            </label>
          )}
          <label className="admin-field">
            <span>外部連結（Pixiv 等，可留空）</span>
            <input
              type="url"
              value={form.externalLink}
              onChange={(e) => updateField('externalLink', e.target.value)}
              placeholder="https://..."
            />
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
            <span>標籤（繁中，例：FANBOX）</span>
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
          <p className="admin-note">日文 / 英文 bonus 欄位可之後擴充；目前可先填繁中。</p>
        </fieldset>

        <fieldset className="admin-form-section">
          <legend>圖片檔案</legend>
          <label className="admin-field">
            <span>縮圖 *</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>
          {isCommission && (
            <label className="admin-field">
              <span>大圖（lightbox）*</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFullsizeFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>
          )}
        </fieldset>

        {error && <p className="admin-error">{error}</p>}
        {message && <p className="admin-success">{message}</p>}

        <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
          {submitting ? '上傳中…' : '發布作品'}
        </button>
      </form>
    </div>
  );
}
