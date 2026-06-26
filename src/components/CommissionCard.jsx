import { useTranslation } from 'react-i18next';
import CommissionImageButton from './CommissionImageButton';

export default function CommissionCard({ commission, onOpenLightbox }) {
  const { t } = useTranslation();
  const title = t(`commissions.${commission.titleKey}`);
  const desc = t(`commissions.${commission.descKey}`);
  const client = commission.clientKey
    ? t(`commissions.${commission.clientKey}`)
    : null;

  return (
    <article className="artwork-card commission-card">
      <div className="artwork-link commission-card-inner">
        <CommissionImageButton
          commission={commission}
          onOpen={onOpenLightbox}
          className="artwork-image-wrap"
          loading="lazy"
        />

        <div className="artwork-info commission-info">
          <div className="artwork-meta">
            <span className="artwork-date">{commission.date}</span>
            {commission.clientKey && (
              <>
                <span className="artwork-divider">|</span>
                <span className="commission-client-label">
                  {t('commissions.clientLabel')}
                </span>
              </>
            )}
          </div>
          <h3 className="artwork-title">{title}</h3>
          {client && <p className="commission-client">{client}</p>}
          <p className="commission-desc">{desc}</p>
        </div>
      </div>
    </article>
  );
}
