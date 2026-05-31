import { useTranslation } from 'react-i18next';

export default function ArtworkCard({ artwork }) {
  const { t } = useTranslation();

  return (
    <article className="artwork-card">
      <a
        href={artwork.link}
        target="_blank"
        rel="noopener noreferrer"
        className="artwork-link"
      >
        {/* image */}
        <div className="artwork-image-wrap">
          <img
            src={artwork.image}
            alt={t(`artworks.${artwork.titleKey}`)}
            className="artwork-image"
            loading="lazy"
          />
          <div className="artwork-overlay">
            <span className="artwork-view">🔍 {t('artworks.view')}</span>
          </div>
        </div>

        {/* text info */}
        <div className="artwork-info">
          <div className="artwork-meta">
            <span className="artwork-date">{artwork.date}</span>
            <span className="artwork-divider">|</span>
            <span className="artwork-release">RELEASE</span>
            <span className="artwork-divider">|</span>
            <span className="artwork-platform">{artwork.platform}</span>
          </div>
          <h3 className="artwork-title">
            {t(`artworks.${artwork.titleKey}`)}
          </h3>
        </div>
      </a>
    </article>
  );
}