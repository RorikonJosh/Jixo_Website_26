import { useTranslation } from 'react-i18next';
import '../styles/home.css';
import { useEffect } from 'react';

export default function Home() {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add('home-bg');
    return () => {
      document.body.classList.remove('home-bg');
    };
  }, []);

  return (
    <div className="home-wrapper">
      {/* Full-width Hero Banner (directly written, not seperate component) */}
      <section className="hero-banner">
        <img src="/images/jixo_topbanner.jpg" alt="NIGHTFOX" />
      </section>
      {/* Main Card */}
      <section className="hero-card">
        <div className="hero-image">
          <img src="/images/jixo_new_face.jpg" alt="kareya" />
        </div>

        <div className="hero-text">
          <h1>{t('home.greeting')}</h1>
          <p>{t('home.usageNotice')}</p>
          <p><strong>{t('home.aiWarning')}</strong></p>
          <p>
            {t('home.commission')}{' '}
            <a href="mailto:jixo0407@gmail.com">jixo0407@gmail.com</a>
          </p>
          <p>{t('home.languages')}</p>
        </div>
      </section>

      {/* Social Media Container */}
      <div className="social-container">
        <div className="social-box">
          <a
            href="https://www.pixiv.net/users/31690832"
            className="social-logo-btn"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/pixiv.png" alt="Pixiv" className="social-logo" />
          </a>

          <a
            href="https://x.com/jixo95821699"
            className="social-logo-btn"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/Twitter.png" alt="X (Twitter)" className="social-logo" />
          </a>

          <a
            href="https://www.facebook.com/jixo95821699"
            className="social-logo-btn"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/facebook.png" alt="Facebook" className="social-logo" />
          </a>

          <a
            href="https://home.gamer.com.tw/profile/index_feed.php?owner=jixo0407"
            className="social-logo-btn"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/Bahamut.jpg" alt="Bahamut" className="social-logo" />
          </a>

          <a
            href="https://www.reddit.com/user/jixo0407/"
            className="social-logo-btn"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/reddit.png" alt="Reddit" className="social-logo" />
          </a>

          <a
            href="https://bsky.app/profile/kareya.bsky.social"
            className="social-logo-btn"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/images/Bluesky_Logo.png" alt="Bluesky" className="social-logo" />
          </a>
        </div>
      </div>
    </div>
  );
}