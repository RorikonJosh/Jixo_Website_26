import { useTranslation } from 'react-i18next';
import { resolveArtworkTexts } from '../lib/portfolio';

export default function ArtworkCard({ artwork }) {
  const { t, i18n } = useTranslation();
  const { title } = resolveArtworkTexts(artwork, t, i18n.language);

  return (
    <article className="artwork-card">
      <a
        href={artwork.link}
        target="_blank"
        rel="noopener noreferrer"
        className="artwork-link"
      >
        <div className="artwork-image-wrap">
          <img
            src={artwork.image}
            alt={title}
            className="artwork-image"
            loading="lazy"
          />
          <div className="artwork-overlay">
            <span className="artwork-view">🔍 {t('artworks.view')}</span>
          </div>
        </div>

        <div className="artwork-info">
          <div className="artwork-meta">
            <span className="artwork-date">{artwork.date}</span>
            <span className="artwork-divider">|</span>
            <span className="artwork-release">RELEASE</span>
            <span className="artwork-divider">|</span>
            <span className="artwork-platform">{artwork.platform}</span>
          </div>
          <h3 className="artwork-title">{title}</h3>
        </div>
      </a>
    </article>
  );
}
