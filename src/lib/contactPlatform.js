export const CONTACT_PLATFORM_VALUES = ['discord', 'facebook', 'other'];

export const CONTACT_PLATFORM_LABELS_ZH = {
  discord: 'Discord',
  facebook: 'Facebook',
  other: '其他',
};

export function normalizeContactPlatform(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  return CONTACT_PLATFORM_VALUES.includes(trimmed) ? trimmed : null;
}

export function formatContactPlatform(platform, handle) {
  const label = CONTACT_PLATFORM_LABELS_ZH[platform];
  const text = typeof handle === 'string' ? handle.trim() : '';
  if (label && text) return `${label}：${text}`;
  if (label) return label;
  if (text) return text;
  return '—';
}
