import { buildCommissions } from '../lib/portfolioStorage';

/** Legacy static entries are seeded into Supabase; keep empty for DB-only management. */
const commissionsRaw = [];

const built = buildCommissions(commissionsRaw);

export const commissions = built.commissions;
export const generalCommissions = built.generalCommissions;
export const r18Commissions = built.r18Commissions;
