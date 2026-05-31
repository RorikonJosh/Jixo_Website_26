import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ArtworkCard from '../components/ArtworkCard';
import { artworks } from '../data/artworks';
import '../styles/artworks.css';

export default function Artworks() {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  // First artwork is featured, the rest are split into two rows for the marquee
  const featured = artworks[0];
  const others = artworks.slice(1);
  const half = Math.ceil(others.length / 2);
  const row1 = others.slice(0, half);
  const row2 = others.slice(half);

  return (
    <main className="artworks-page">
      {/* Featured Artwork (Latest) */}
      <section className="featured-artwork">
        <div className="featured-image">
          <a
            href={featured.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={featured.image} alt={t(`artworks.${featured.titleKey}`)} />
          </a>
        </div>

        <div className="featured-info">
          <span className="featured-label">
            ✨ {t('artworks.featuredLabel')}
          </span>
          <h2 className="featured-title">
            {t(`artworks.${featured.titleKey}`)}
          </h2>
          <p className="featured-date">{featured.date}</p>
          
          {/* main introduce */}
          <p className="featured-desc">
            {t(`artworks.${featured.titleKey}_desc`)}
          </p>

          {/* FANBOX info */}
          <div className="featured-bonus">
            <p className="bonus-line">
              <span className="bonus-tag">
                【{t(`artworks.${featured.titleKey}_bonus_label`)}】
              </span>
              <span className="bonus-text">
                {t(`artworks.${featured.titleKey}_bonus_text`)}
              </span>
            </p>
            <a
              href={t(`artworks.${featured.titleKey}_bonus_url`)}
              target="_blank"
              rel="noopener noreferrer"
              className="bonus-link"
            >
              {t(`artworks.${featured.titleKey}_bonus_url`)}
            </a>
          </div>

          <div className="featured-actions">
            <a
              href={featured.link}
              target="_blank"
              rel="noopener noreferrer"
              className="featured-btn primary"
            >
              {t('artworks.viewOnPixiv')} →
            </a>
          </div>
        </div>
      </section>

      {/* Scroll down */}
      <div className="scroll-hint">
        <svg
          className="scroll-hint-arrow"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Auto-scrolling Artworks */}
      <section className="artworks-marquee">
        {/* First Row */}
        <div className="marquee-row">
          <div className="marquee-track">
            {[...row1, ...row1].map((art, idx) => (
              <div className="marquee-item" key={`r1-${art.id}-${idx}`}>
                <ArtworkCard artwork={art} />
              </div>
            ))}
          </div>
        </div>

        {/* Second Row */}
        <div className="marquee-row">
          <div className="marquee-track marquee-track-2">
            {[...row2, ...row2].map((art, idx) => (
              <div className="marquee-item" key={`r2-${art.id}-${idx}`}>
                <ArtworkCard artwork={art} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* more artworks */}
    <div className="more-artworks-wrap">
      <a
        href="https://www.pixiv.net/users/31690832"
        target="_blank"
        rel="noopener noreferrer"
        className="more-artworks-btn"
      >
        <span>{t('artworks.moreButton')}</span>
        <svg
          className="more-arrow"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </div>
    </main>
  );
}