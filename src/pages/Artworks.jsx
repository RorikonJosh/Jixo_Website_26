import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArtworkCard from '../components/ArtworkCard';
import { fetchArtworksForPage, resolveArtworkTexts } from '../lib/portfolio';
import '../styles/artworks.css';

export default function Artworks() {
  const { t, i18n } = useTranslation();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('com-bg');
    return () => {
      document.body.classList.remove('com-bg');
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetchArtworksForPage().then((rows) => {
      if (active) {
        setArtworks(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="artworks-page">
        <p className="admin-note" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          {t('artworks.loading', '載入中…')}
        </p>
      </main>
    );
  }

  if (artworks.length === 0) {
    return (
      <main className="artworks-page">
        <p className="admin-note" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          {t('artworks.empty', '尚無作品')}
        </p>
      </main>
    );
  }

  const featured = artworks[0];
  const featuredText = resolveArtworkTexts(featured, t, i18n.language);
  const others = artworks.slice(1);
  const half = Math.ceil(others.length / 2);
  const row1 = others.slice(0, half);
  const row2 = others.slice(half);

  return (
    <main className="artworks-page">
      <section className="featured-artwork">
        <div className="featured-image">
          <a
            href={featured.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={featured.image} alt={featuredText.title} />
          </a>
        </div>

        <div className="featured-info">
          <span className="featured-label">
            ✨ {t('artworks.featuredLabel')}
          </span>
          <h2 className="featured-title">{featuredText.title}</h2>
          <p className="featured-date">{featured.date}</p>
          <p className="featured-desc">{featuredText.desc}</p>

          {(featuredText.bonusLabel || featuredText.bonusText) && (
            <div className="featured-bonus">
              <p className="bonus-line">
                {featuredText.bonusLabel && (
                  <span className="bonus-tag">【{featuredText.bonusLabel}】</span>
                )}
                <span className="bonus-text">{featuredText.bonusText}</span>
              </p>
              {featuredText.bonusUrl && (
                <a
                  href={featuredText.bonusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bonus-link"
                >
                  {featuredText.bonusUrl}
                </a>
              )}
            </div>
          )}

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

      <section className="artworks-marquee">
        <div className="marquee-row">
          <div className="marquee-track">
            {[...row1, ...row1].map((art, idx) => (
              <div className="marquee-item" key={`r1-${art.id}-${idx}`}>
                <ArtworkCard artwork={art} />
              </div>
            ))}
          </div>
        </div>

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
