import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CommissionLightbox({ commission, isR18, onClose }) {
  const { t } = useTranslation();

  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    setPortrait(false);
  }, [commission?.fullsizeImage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!commission?.fullsizeImage) return null;

  const title = t(`commissions.${commission.titleKey}`);
  const desc = t(`commissions.${commission.descKey}`);
  const client = commission.clientKey
    ? t(`commissions.${commission.clientKey}`)
    : null;

  return (
    <div
      className="commission-lightbox-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`commission-lightbox ${isR18 ? 'commission-lightbox--r18' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="commission-lightbox-close"
          onClick={onClose}
          aria-label={t('commissions.lightboxClose')}
        >
          ×
        </button>

        <div className="commission-lightbox-image">
          <img
            src={commission.fullsizeImage}
            alt={title}
            className={portrait ? 'is-portrait' : undefined}
            onLoad={(e) => {
              setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth);
            }}
          />
        </div>

        <div className="commission-lightbox-info">
          <h2 className="commission-lightbox-title">{title}</h2>
          <p className="commission-lightbox-date">{commission.date}</p>
          {client && (
            <p className="commission-lightbox-client">
              {t('commissions.clientLabel')}: {client}
            </p>
          )}
          <p className="commission-lightbox-desc">{desc}</p>

          {commission.bonusKey && (
            <div className="featured-bonus commission-lightbox-bonus">
              <p className="bonus-line">
                <span className="bonus-tag">
                  【{t(`commissions.${commission.bonusKey}_bonus_label`)}】
                </span>
                <span className="bonus-text">
                  {t(`commissions.${commission.bonusKey}_bonus_text`)}
                </span>
              </p>
              <a
                href={t(`commissions.${commission.bonusKey}_bonus_url`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bonus-link"
              >
                fanbox:{t(`commissions.${commission.bonusKey}_bonus_url`)}
              </a>
            </div>
          )}

          {commission.link && commission.link !== '#' && (
            <div className="featured-actions">
              <a
                href={commission.link}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-btn primary"
              >
                {t('commissions.viewOnPixiv')} →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
