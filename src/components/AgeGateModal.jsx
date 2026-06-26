import { useTranslation } from 'react-i18next';

export default function AgeGateModal({ onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="age-gate-overlay" onClick={onCancel}>
      <div
        className="age-gate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="age-gate-title" className="age-gate-title">
          {t('commissions.ageGate.title')}
        </h2>
        <p className="age-gate-message">{t('commissions.ageGate.message')}</p>
        <div className="age-gate-actions">
          <button type="button" className="age-gate-btn cancel" onClick={onCancel}>
            {t('commissions.ageGate.cancel')}
          </button>
          <button type="button" className="age-gate-btn confirm" onClick={onConfirm}>
            {t('commissions.ageGate.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
