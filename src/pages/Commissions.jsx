import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommissionCard from '../components/CommissionCard';
import CommissionImageButton from '../components/CommissionImageButton';
import CommissionLightbox from '../components/CommissionLightbox';
import AgeGateModal from '../components/AgeGateModal';
import { generalCommissions, r18Commissions } from '../data/commissions';
import { isR18AgeConfirmed, setR18AgeConfirmed } from '../utils/r18AgeGate';
import '../styles/artworks.css';
import '../styles/commissions.css';

export default function Commissions() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [lightboxCommission, setLightboxCommission] = useState(null);

  useEffect(() => {
    document.body.classList.add('com-bg', 'commissions-active', 'theme-general');
    return () => {
      document.body.classList.remove(
        'com-bg',
        'commissions-active',
        'theme-general',
        'theme-r18',
      );
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'r18') {
      document.body.classList.add('theme-r18');
      document.body.classList.remove('theme-general');
    } else {
      document.body.classList.add('theme-general');
      document.body.classList.remove('theme-r18');
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    if (tab === 'r18') {
      if (isR18AgeConfirmed()) {
        setActiveTab('r18');
      } else {
        setShowAgeGate(true);
      }
      return;
    }
    setActiveTab('general');
  };

  const handleAgeConfirm = () => {
    setR18AgeConfirmed();
    setShowAgeGate(false);
    setActiveTab('r18');
  };

  const handleAgeCancel = () => {
    setShowAgeGate(false);
  };

  const visibleCommissions =
    activeTab === 'r18' ? r18Commissions : generalCommissions;
  const featured = visibleCommissions[0];
  const others = visibleCommissions.slice(1);

  return (
    <main className={`commissions-page ${activeTab === 'r18' ? 'commissions-page--r18' : ''}`}>
      <header className="commissions-bookmarks">
        <div className="bookmark-ribbon bookmark-ribbon--title">
          <h1 className="commissions-title">{t('commissions.pageTitle')}</h1>
        </div>

        <div
          className="bookmark-tabs"
          role="tablist"
          aria-label={t('commissions.pageTitle')}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'general'}
            className={`bookmark-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => handleTabClick('general')}
          >
            {t('commissions.tabGeneral')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'r18'}
            className={`bookmark-tab bookmark-tab--r18 ${activeTab === 'r18' ? 'active' : ''}`}
            onClick={() => handleTabClick('r18')}
          >
            {t('commissions.tabR18')}
          </button>
        </div>
      </header>

      {featured && (
        <section className="featured-artwork commissions-featured">
          <div className="featured-image">
            <CommissionImageButton
              commission={featured}
              onOpen={setLightboxCommission}
              className="featured-image-btn"
            />
          </div>

          <div className="featured-info">
            <span className="featured-label">
              ✨ {t('commissions.featuredLabel')}
            </span>
            <h2 className="featured-title">
              {t(`commissions.${featured.titleKey}`)}
            </h2>
            <p className="featured-date">{featured.date}</p>
            {featured.clientKey && (
              <p className="commission-featured-client">
                {t('commissions.clientLabel')}: {t(`commissions.${featured.clientKey}`)}
              </p>
            )}
            <p className="featured-desc">
              {t(`commissions.${featured.descKey}`)}
            </p>

            {featured.bonusKey && (
              <div className="featured-bonus">
                <p className="bonus-line">
                  <span className="bonus-tag">
                    【{t(`commissions.${featured.bonusKey}_bonus_label`)}】
                  </span>
                  <span className="bonus-text">
                    {t(`commissions.${featured.bonusKey}_bonus_text`)}
                  </span>
                </p>
                <a
                  href={t(`commissions.${featured.bonusKey}_bonus_url`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bonus-link"
                >
                  fanbox:{t(`commissions.${featured.bonusKey}_bonus_url`)}
                </a>
              </div>
            )}

            {featured.link && featured.link !== '#' && (
              <div className="featured-actions">
                <a
                  href={featured.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="featured-btn primary"
                >
                  {t('commissions.viewOnPixiv')} →
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <>
          <div className="commissions-section-divider">
            <span className="commissions-section-label">
              {t('commissions.moreWorks')}
            </span>
          </div>

          <section
            className="commissions-grid"
            role="tabpanel"
            aria-label={
              activeTab === 'r18'
                ? t('commissions.tabR18')
                : t('commissions.tabGeneral')
            }
          >
            {others.map((commission) => (
              <CommissionCard
                key={commission.id}
                commission={commission}
                onOpenLightbox={setLightboxCommission}
              />
            ))}
          </section>
        </>
      )}

      {showAgeGate && (
        <AgeGateModal onConfirm={handleAgeConfirm} onCancel={handleAgeCancel} />
      )}

      {lightboxCommission && (
        <CommissionLightbox
          commission={lightboxCommission}
          isR18={activeTab === 'r18'}
          onClose={() => setLightboxCommission(null)}
        />
      )}
    </main>
  );
}
