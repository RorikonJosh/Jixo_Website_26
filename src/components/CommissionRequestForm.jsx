import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  ALLOWED_FILE_TYPES,
  COMMISSION_BUCKET,
  MAX_FILE_BYTES,
  MAX_REFERENCE_FILES,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import { submitCommissionRequest } from '../lib/submitCommissionRequest';
import '../styles/commission-form.css';

const INITIAL_FORM = {
  name: '',
  email: '',
  contact_handle: '',
  purpose: '',
  character_desc: '',
  style_notes: '',
  reference_urls: '',
  budget: '',
  deadline: '',
  is_r18: false,
  usage_type: 'personal',
  website: '',
};

function sanitizeFileName(name) {
  return name.replace(/[^\w.\-()+\s]/g, '_').slice(0, 120);
}

export default function CommissionRequestForm() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorKey, setErrorKey] = useState('');

  const usageOptions = useMemo(
    () => [
      { value: 'personal', label: t('contact.form.usagePersonal') },
      { value: 'commercial', label: t('contact.form.usageCommercial') },
    ],
    [t],
  );

  const closeModal = () => {
    if (status === 'submitting') return;
    setOpen(false);
    setStatus('idle');
    setErrorKey('');
  };

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && status !== 'submitting') {
        setOpen(false);
        setStatus('idle');
        setErrorKey('');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, status]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files ?? []);
    const valid = [];
    let rejected = false;

    for (const file of selected.slice(0, MAX_REFERENCE_FILES)) {
      if (!ALLOWED_FILE_TYPES.includes(file.type) || file.size > MAX_FILE_BYTES) {
        rejected = true;
        continue;
      }
      valid.push(file);
    }

    if (selected.length > MAX_REFERENCE_FILES) rejected = true;
    setFiles(valid);
    if (rejected) setErrorKey('contact.form.errorFiles');
    else setErrorKey('');
    event.target.value = '';
  };

  const uploadReferenceFiles = async (submissionId) => {
    if (!supabase || files.length === 0) return [];

    const paths = [];
    for (const file of files) {
      const path = `pending/${submissionId}/${sanitizeFileName(file.name)}`;
      const { error } = await supabase.storage
        .from(COMMISSION_BUCKET)
        .upload(path, file, { upsert: false });

      if (error) throw error;
      paths.push(path);
    }
    return paths;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setErrorKey('contact.form.errorNotConfigured');
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      setStatus('error');
      setErrorKey('contact.form.errorSubmit');
      return;
    }

    if (!form.purpose.trim() && !form.character_desc.trim()) {
      setStatus('error');
      setErrorKey('contact.form.errorRequiredContent');
      return;
    }

    setStatus('submitting');
    setErrorKey('');

    const submissionId = crypto.randomUUID();

    try {
      const referenceFiles = await uploadReferenceFiles(submissionId);

      await submitCommissionRequest(supabase, form, {
        referenceFiles,
        locale: i18n.language,
      });

      setStatus('success');
      setForm(INITIAL_FORM);
      setFiles([]);
    } catch (err) {
      console.error('Commission submit failed:', err);
      setStatus('error');
      const message = err?.message ?? '';
      const code = err?.code ?? '';

      if (code === 'PGRST205' || message.includes('commission_requests')) {
        setErrorKey('contact.form.errorDatabase');
      } else if (message.includes('Bucket not found') || message.includes('storage')) {
        setErrorKey('contact.form.errorUpload');
      } else if (err?.message === 'content') {
        setErrorKey('contact.form.errorRequiredContent');
      } else {
        setErrorKey('contact.form.errorSubmit');
      }
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="commission-form-block">
        <p className="commission-form-note">{t('contact.form.notConfigured')}</p>
      </div>
    );
  }

  return (
    <div className="commission-form-block">
      <button
        type="button"
        className="commission-form-toggle"
        onClick={() => setOpen(true)}
      >
        {t('contact.form.openButton')}
      </button>

      {open &&
        createPortal(
          <div className="commission-modal-overlay" onClick={closeModal}>
            <div
              className="commission-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="commission-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="commission-modal-toolbar">
                <button
                  type="button"
                  className="commission-modal-close"
                  onClick={closeModal}
                  aria-label={t('contact.form.cancel')}
                  disabled={status === 'submitting'}
                >
                  ×
                </button>
              </div>

              <div className="commission-modal-scroll">
            {status === 'success' ? (
              <div className="commission-modal-success">
                <h3 id="commission-modal-title">{t('contact.form.title')}</h3>
                <p className="commission-form-message commission-form-message--success" role="status">
                  {t('contact.form.success')}
                </p>
                <div className="commission-form-actions">
                  <button
                    type="button"
                    className="commission-form-submit"
                    onClick={closeModal}
                  >
                    {t('contact.form.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <form className="commission-form" onSubmit={handleSubmit} noValidate>
                <div className="commission-form-header">
                  <h3 id="commission-modal-title">{t('contact.form.title')}</h3>
                  <p className="commission-form-note">{t('contact.form.subtitle')}</p>
                </div>

                <div className="commission-form-grid">
                  <label className="commission-field">
                    <span>{t('contact.form.name')} *</span>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </label>

                  <label className="commission-field">
                    <span>{t('contact.form.email')} *</span>
                    <input
                      type="email"
                      required
                      maxLength={254}
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                  </label>

                  <label className="commission-field commission-field--full">
                    <span>{t('contact.form.contactHandle')}</span>
                    <input
                      type="text"
                      maxLength={200}
                      placeholder={t('contact.form.contactHandlePlaceholder')}
                      value={form.contact_handle}
                      onChange={(e) => updateField('contact_handle', e.target.value)}
                    />
                  </label>

                  <label className="commission-field commission-field--full">
                    <span>{t('contact.form.purpose')}</span>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={form.purpose}
                      onChange={(e) => updateField('purpose', e.target.value)}
                    />
                  </label>

                  <label className="commission-field commission-field--full">
                    <span>{t('contact.form.characterDesc')}</span>
                    <textarea
                      rows={4}
                      maxLength={4000}
                      value={form.character_desc}
                      onChange={(e) => updateField('character_desc', e.target.value)}
                    />
                  </label>

                  <label className="commission-field commission-field--full">
                    <span>{t('contact.form.styleNotes')}</span>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={form.style_notes}
                      onChange={(e) => updateField('style_notes', e.target.value)}
                    />
                  </label>

                  <label className="commission-field commission-field--full">
                    <span>{t('contact.form.referenceUrls')}</span>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      placeholder={t('contact.form.referenceUrlsPlaceholder')}
                      value={form.reference_urls}
                      onChange={(e) => updateField('reference_urls', e.target.value)}
                    />
                  </label>

                  <label className="commission-field">
                    <span>{t('contact.form.budget')}</span>
                    <input
                      type="text"
                      maxLength={200}
                      value={form.budget}
                      onChange={(e) => updateField('budget', e.target.value)}
                    />
                    <small className="commission-form-hint">{t('contact.form.budgetHint')}</small>
                  </label>

                  <label className="commission-field">
                    <span>{t('contact.form.deadline')}</span>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => updateField('deadline', e.target.value)}
                    />
                    <small className="commission-form-hint">{t('contact.form.deadlineHint')}</small>
                  </label>

                  <div className="commission-field commission-field--full">
                    <span className="commission-field-label">{t('contact.form.usageType')}</span>
                    <div className="commission-radio-group">
                      {usageOptions.map((option) => (
                        <label key={option.value} className="commission-radio">
                          <input
                            type="radio"
                            name="usage_type"
                            value={option.value}
                            checked={form.usage_type === option.value}
                            onChange={(e) => updateField('usage_type', e.target.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="commission-checkbox commission-field--full">
                    <input
                      type="checkbox"
                      checked={form.is_r18}
                      onChange={(e) => updateField('is_r18', e.target.checked)}
                    />
                    {t('contact.form.isR18')}
                  </label>

                  <label className="commission-field commission-field--full">
                    <span>{t('contact.form.referenceFiles')}</span>
                    <input
                      type="file"
                      accept={ALLOWED_FILE_TYPES.join(',')}
                      multiple
                      onChange={handleFileChange}
                    />
                    <small className="commission-form-hint">
                      {t('contact.form.referenceFilesHint', { count: MAX_REFERENCE_FILES })}
                    </small>
                    {files.length > 0 && (
                      <ul className="commission-file-list">
                        {files.map((file) => (
                          <li key={`${file.name}-${file.size}`}>{file.name}</li>
                        ))}
                      </ul>
                    )}
                  </label>
                </div>

                <input
                  type="text"
                  name="website"
                  className="commission-honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => updateField('website', e.target.value)}
                />

                {(status === 'error' || errorKey) && (
                  <p className="commission-form-message commission-form-message--error" role="alert">
                    {t(errorKey || 'contact.form.errorSubmit')}
                  </p>
                )}

                <div className="commission-form-actions">
                  <button
                    type="button"
                    className="commission-form-cancel"
                    onClick={closeModal}
                    disabled={status === 'submitting'}
                  >
                    {t('contact.form.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="commission-form-submit"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting'
                      ? t('contact.form.submitting')
                      : t('contact.form.submit')}
                  </button>
                </div>
              </form>
            )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
