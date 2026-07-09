import { buildArtworks } from '../lib/portfolioStorage';

/** Legacy static entries are seeded into Supabase; keep empty for DB-only management. */
const artworksRaw = [];

export const artworks = buildArtworks(artworksRaw);
