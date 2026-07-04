export const PORTFOLIO_BUCKET = 'portfolio';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');

/** Public URL for a file in the portfolio bucket, e.g. `artworks/20260329.jpg`. */
export function portfolioUrl(storagePath) {
  if (!supabaseUrl || !storagePath) return '';
  const encoded = storagePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${supabaseUrl}/storage/v1/object/public/${PORTFOLIO_BUCKET}/${encoded}`;
}

function mapArtwork(item) {
  return {
    ...item,
    image: portfolioUrl(item.imagePath),
  };
}

function mapCommission(item) {
  return {
    ...item,
    image: portfolioUrl(item.imagePath),
    fullsizeImage: portfolioUrl(item.fullsizePath),
  };
}

export function buildArtworks(items) {
  return [...items].map(mapArtwork).sort((a, b) => {
    const dateA = new Date(a.date.replace(/\./g, '-'));
    const dateB = new Date(b.date.replace(/\./g, '-'));
    return dateB - dateA;
  });
}

export function buildCommissions(items) {
  const mapped = items.map(mapCommission);
  const sortByDateDesc = (list) =>
    [...list].sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA;
    });

  return {
    commissions: sortByDateDesc(mapped),
    generalCommissions: sortByDateDesc(mapped.filter((c) => c.category === 'general')),
    r18Commissions: sortByDateDesc(mapped.filter((c) => c.category === 'r18')),
  };
}
