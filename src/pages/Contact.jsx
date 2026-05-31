import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/contact.css';

export default function Contact() {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  return (
    <>
      {/* ===== Brand Introduction ===== */}
      <section className="brand-introduction">
        {/* Image of contact */}
        <div className="brand-card">
          <div className="brand-image">
            <img src="/images/contact.png" alt="Contact" className="brand-img" />
          </div>

          <div className="brand-content">
            <h2>{t('contact.title')}</h2>

            {/* Email */}
            <div className="contact-section">
              <h3>{t('contact.email.title')}</h3>
              <p className="contact-info">
                {t('contact.email.label')}：
                <a href="mailto:jixo0407@gmail.com" className="contact-link">
                  jixo0407@gmail.com
                </a>
              </p>
              <p className="note">{t('contact.email.note')}</p>
            </div>

            <hr />

            {/* Twitter */}
            <div className="contact-section">
              <h3>{t('contact.twitter.title')}</h3>
              <p>{t('contact.twitter.desc')}</p>
              <a
                href="https://twitter.com/your_account"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn"
              >
                {t('contact.twitter.button')}
              </a>
            </div>

            <hr />

            {/*  Pixiv */}
            <div className="contact-section">
              <h3>{t('contact.pixiv.title')}</h3>
              <p>{t('contact.pixiv.desc')}</p>
              <a
                href="https://www.pixiv.net/users/your_id"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn"
              >
                {t('contact.pixiv.button')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer Copyright ===== */}
      <div className="copyright">{t('footer.copyright')}</div>
    </>
  );
}