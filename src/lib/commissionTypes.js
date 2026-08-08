/** Stable commission type keys stored in DB / Discord. */
export const COMMISSION_TYPE_VALUES = [
  'chibi',
  'bust',
  'illustration',
  'fullbody',
  'other',
];

/** Traditional Chinese labels for Admin / Discord. */
export const COMMISSION_TYPE_LABELS_ZH = {
  chibi: 'Q版',
  bust: '頭像、胸像',
  illustration: '插畫（大腿以上）',
  fullbody: '整身、立繪',
  other: '其他',
};

export function formatCommissionTypes(types, otherText = '') {
  const list = Array.isArray(types) ? types : [];
  const labels = list
    .map((value) => COMMISSION_TYPE_LABELS_ZH[value] ?? value)
    .filter(Boolean);

  if (!labels.length) return '—';

  const base = labels.join('、');
  const other = typeof otherText === 'string' ? otherText.trim() : '';
  if (list.includes('other') && other) {
    return `${base}（${other}）`;
  }
  return base;
}

export function normalizeCommissionTypes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((value) => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => COMMISSION_TYPE_VALUES.includes(value));
}
