import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveCommissionTexts } from '../lib/portfolio';

function isPortraitImage(img) {
  return img.naturalHeight > img.naturalWidth;
}

export default function CommissionImageButton({
  commission,
  onOpen,
  className = '',
  imgClassName = 'artwork-image',
  loading,
}) {
  const { t, i18n } = useTranslation();
  const [portrait, setPortrait] = useState(false);
  const { title } = resolveCommissionTexts(commission, t, i18n.language);
  const canOpen = Boolean(commission.fullsizeImage && onOpen);

  const handleImageLoad = (e) => {
    setPortrait(isPortraitImage(e.currentTarget));
  };

  const image = (
    <img
      src={commission.image}
      alt={title}
      className={`${imgClassName}${portrait ? ' is-portrait' : ''}`}
      loading={loading}
      onLoad={handleImageLoad}
    />
  );

  if (!canOpen) {
    return <div className={className}>{image}</div>;
  }

  return (
    <button
      type="button"
      className={`commission-image-btn ${className}`.trim()}
      onClick={() => onOpen(commission)}
      aria-label={`${title} — ${t('commissions.view')}`}
    >
      {image}
      <div className="artwork-overlay">
        <span className="artwork-view">🔍 {t('commissions.view')}</span>
      </div>
    </button>
  );
}
