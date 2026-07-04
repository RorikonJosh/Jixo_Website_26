import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/commer.css';

export default function Commer() {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  // get matrix data from i18n
  const prices = t('commer.price.items', { returnObjects: true }) || [];
  const priceNotes = t('commer.price.notes', { returnObjects: true }) || [];
  const processNotes = t('commer.process.notes', { returnObjects: true }) || [];

  return (
    <>
      {/* ===== Brand Introduction ===== */}
      <section className="brand-introduction wide commer-page">
        <div className="brand-card">
          {/* Left image */}
          <div className="brand-image">
            <img src="/images/a.jpg" alt="Commission" className="brand-img" />
          </div>

          {/* Right content */}
          <div className="brand-content">
            <h2>{t('commer.title')}</h2>

            {/* Price */}
            <div className="price-section">
              <h3>💰 {t('commer.price.title')}</h3>
              <ul className="price-list">
                {prices.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>

              <p>
                <span className="highlight">{t('commer.price.r18')}</span>
              </p>

              <ul className="note-list">
                {priceNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>

            {/* Process */}
            <div className="process-section">
              <h3>🎨 {t('commer.process.title')}</h3>
              <p className="warning">{t('commer.process.diff')}</p>
              <p>{t('commer.process.revision')}</p>
              <ul className="note-list">
                {processNotes.map((n, i) => (
                  <li key={i} className="warning">{n}</li>
                ))}
              </ul>
              <p className="muted">{t('commer.process.contact')}</p>
            </div>

            {/* Copyright */}
            <div className="rights-section">
              <h3>📝 {t('commer.copyright.title')}</h3>
              <p className="note">{t('commer.copyright.notice')}</p>

              <hr />
              
              <h4 className="sub-title">{t('commer.copyright.designTitle')}</h4>

              <h4>{t('commer.copyright.buyout')}</h4>
              <p>{t('commer.copyright.buyoutDesc')}</p>
              <h4>{t('commer.copyright.nobuyout')}</h4>
              <p>{t('commer.copyright.nobuyoutDesc')}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}