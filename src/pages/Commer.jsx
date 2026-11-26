import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommissionRequestForm from '../components/CommissionRequestForm';
import '../styles/commer.css';
import '../styles/commission-form.css';

const TABS = [
  { id: 'price', labelKey: 'commer.tabs.price' },
  { id: 'process', labelKey: 'commer.tabs.process' },
  { id: 'copyright', labelKey: 'commer.tabs.copyright' },
];

export default function Commer() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('price');

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  const prices = t('commer.price.items', { returnObjects: true }) || [];
  const priceNotes = t('commer.price.notes', { returnObjects: true }) || [];
  const processNotes = t('commer.process.notes', { returnObjects: true }) || [];
  const copyrightSections = t('commer.copyright.sections', { returnObjects: true }) || [];
  const isRightsTab = activeTab === 'copyright';

  return (
    <section
      className={`brand-introduction wide commer-page${isRightsTab ? ' commer-page--rights' : ''}`}
    >
      <div className="brand-card">
        <div className="brand-image">
          <img src="/images/a.jpg" alt="" className="brand-img" />
        </div>

        <div className="brand-content">
          <h2>{t('commer.title')}</h2>

          <div
            className="commer-bookmarks"
            role="tablist"
            aria-label={t('commer.title')}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`commer-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`commer-panel-${tab.id}`}
                className={`commer-bookmark${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div className="commer-panels">
            {activeTab === 'price' && (
              <div
                className="commer-panel price-section"
                role="tabpanel"
                id="commer-panel-price"
                aria-labelledby="commer-tab-price"
              >
                <h3>{t('commer.price.title')}</h3>
                <ul className="price-list">
                  {prices.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p>
                  <span className="highlight">{t('commer.price.r18')}</span>
                </p>
                <ul className="note-list">
                  {priceNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'process' && (
              <div
                className="commer-panel process-section"
                role="tabpanel"
                id="commer-panel-process"
                aria-labelledby="commer-tab-process"
              >
                <h3>{t('commer.process.title')}</h3>
                <p className="warning">{t('commer.process.diff')}</p>
                <p>{t('commer.process.revision')}</p>
                <ul className="note-list">
                  {processNotes.map((note, index) => (
                    <li key={index} className="warning">{note}</li>
                  ))}
                </ul>
                <p className="muted">{t('commer.process.contact')}</p>
              </div>
            )}

            {activeTab === 'copyright' && (
              <div
                className="commer-panel rights-section"
                role="tabpanel"
                id="commer-panel-copyright"
                aria-labelledby="commer-tab-copyright"
              >
                <h3>{t('commer.copyright.title')}</h3>
                {Array.isArray(copyrightSections) && copyrightSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="rights-block">
                    <h4 className="sub-title">{section.heading}</h4>
                    <ul className="note-list rights-list">
                      {(section.items || []).map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.text}
                          {Array.isArray(item.children) && item.children.length > 0 && (
                            <ul className="note-list rights-sublist">
                              {item.children.map((child, childIndex) => (
                                <li key={childIndex}>{child}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="commer-cta" aria-label={t('commer.requestCta')}>
        <div className="commer-cta-copy">
          <h3>{t('commer.requestCta')}</h3>
          <p>{t('commer.requestNote')}</p>
        </div>
        <div className="commer-cta-action">
          <CommissionRequestForm />
        </div>
      </aside>
    </section>
  );
}
