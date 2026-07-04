import { portfolioUrl } from './portfolioStorage';
import { pickLocale } from './localizedField';
import { artworks as staticArtworks } from '../data/artworks';
import {
  commissions as staticCommissions,
  generalCommissions as staticGeneral,
  r18Commissions as staticR18,
} from '../data/commissions';
import { supabase } from './supabase';

function parseDisplayDateToSort(displayDate) {
  const normalized = displayDate.replace(/\//g, '.').trim();
  const parts = normalized.split('.').map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some(Number.isNaN)) {
    return new Date().toISOString().slice(0, 10);
  }
  const [y, m, d] = parts;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function displayDateToSlug(displayDate) {
  return displayDate.replace(/[./-]/g, '');
}

export function fileExtension(name) {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? 'jpg' : name.slice(idx + 1).toLowerCase();
}

export function buildPortfolioStoragePaths({
  pageType,
  commissionCategory,
  displayDate,
  thumbFileName,
  fullsizeFileName,
}) {
  const slug = displayDateToSlug(displayDate);
  const thumbExt = fileExtension(thumbFileName);

  if (pageType === 'artwork') {
    return {
      imagePath: `artworks/${slug}.${thumbExt}`,
      fullsizePath: null,
    };
  }

  const fullExt = fileExtension(fullsizeFileName || thumbFileName);
  return {
    imagePath: `commissions/${commissionCategory}/${slug}.${thumbExt}`,
    fullsizePath: `commissions/${commissionCategory}/fullsize/${slug}_FULL.${fullExt}`,
  };
}

function mapDbRow(row) {
  return {
    id: row.id,
    source: 'db',
    pageType: row.page_type,
    category: row.commission_category,
    date: row.display_date,
    sortDate: row.sort_date,
    platform: row.platform || 'Pixiv',
    link: row.external_link || '#',
    image: portfolioUrl(row.image_path),
    fullsizeImage: row.fullsize_path ? portfolioUrl(row.fullsize_path) : null,
    imagePath: row.image_path,
    fullsizePath: row.fullsize_path,
    title_zh: row.title_zh,
    title_jp: row.title_jp,
    title_en: row.title_en,
    desc_zh: row.desc_zh,
    desc_jp: row.desc_jp,
    desc_en: row.desc_en,
    bonus_label_zh: row.bonus_label_zh,
    bonus_label_jp: row.bonus_label_jp,
    bonus_label_en: row.bonus_label_en,
    bonus_text_zh: row.bonus_text_zh,
    bonus_text_jp: row.bonus_text_jp,
    bonus_text_en: row.bonus_text_en,
    bonus_url: row.bonus_url,
    client_zh: row.client_zh,
    client_jp: row.client_jp,
    client_en: row.client_en,
  };
}

function sortByDateDesc(items) {
  return [...items].sort((a, b) => {
    const dateA = new Date(parseDisplayDateToSort(a.date));
    const dateB = new Date(parseDisplayDateToSort(b.date));
    return dateB - dateA;
  });
}

function mergeByImagePath(dbItems, staticItems) {
  const dbPaths = new Set(dbItems.map((item) => item.imagePath || item.image));
  const legacy = staticItems.filter((item) => !dbPaths.has(item.imagePath) && !dbPaths.has(item.image));
  return sortByDateDesc([...dbItems, ...legacy]);
}

export async function fetchPublicPortfolioItems(pageType = null) {
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('list_portfolio_items', {
    filter_page_type: pageType,
  });

  if (error) {
    console.error('fetchPublicPortfolioItems', error);
    return [];
  }

  return (data ?? []).map(mapDbRow);
}

export async function fetchArtworksForPage() {
  const dbItems = await fetchPublicPortfolioItems('artwork');
  const dbArtworks = dbItems.filter((item) => item.pageType === 'artwork');
  return mergeByImagePath(dbArtworks, staticArtworks.map((item) => ({ ...item, source: 'static' })));
}

export async function fetchCommissionsForPage() {
  const dbItems = await fetchPublicPortfolioItems('commission');
  const dbCommissions = dbItems.filter((item) => item.pageType === 'commission');

  const merged = mergeByImagePath(
    dbCommissions,
    staticCommissions.map((item) => ({ ...item, source: 'static' })),
  );

  return {
    commissions: merged,
    generalCommissions: merged.filter((c) => c.category === 'general'),
    r18Commissions: merged.filter((c) => c.category === 'r18'),
  };
}

export function resolveArtworkTexts(artwork, t, language) {
  if (artwork.source === 'db') {
    return {
      title: pickLocale(artwork, 'title', language),
      desc: pickLocale(artwork, 'desc', language),
      bonusLabel: pickLocale(artwork, 'bonus_label', language),
      bonusText: pickLocale(artwork, 'bonus_text', language),
      bonusUrl: artwork.bonus_url || '',
    };
  }

  const key = artwork.titleKey;
  return {
    title: t(`artworks.${key}`),
    desc: t(`artworks.${key}_desc`),
    bonusLabel: t(`artworks.${key}_bonus_label`),
    bonusText: t(`artworks.${key}_bonus_text`),
    bonusUrl: t(`artworks.${key}_bonus_url`),
  };
}

export function resolveCommissionTexts(commission, t, language) {
  if (commission.source === 'db') {
    const client = pickLocale(commission, 'client', language);
    return {
      title: pickLocale(commission, 'title', language),
      desc: pickLocale(commission, 'desc', language),
      client: client || null,
      bonusLabel: pickLocale(commission, 'bonus_label', language),
      bonusText: pickLocale(commission, 'bonus_text', language),
      bonusUrl: commission.bonus_url || '',
      hasBonus: Boolean(
        pickLocale(commission, 'bonus_label', language)
        || pickLocale(commission, 'bonus_text', language)
        || commission.bonus_url,
      ),
    };
  }

  return {
    title: t(`commissions.${commission.titleKey}`),
    desc: t(`commissions.${commission.descKey}`),
    client: commission.clientKey ? t(`commissions.${commission.clientKey}`) : null,
    bonusLabel: commission.bonusKey ? t(`commissions.${commission.bonusKey}_bonus_label`) : '',
    bonusText: commission.bonusKey ? t(`commissions.${commission.bonusKey}_bonus_text`) : '',
    bonusUrl: commission.bonusKey ? t(`commissions.${commission.bonusKey}_bonus_url`) : '',
    hasBonus: Boolean(commission.bonusKey),
  };
}

export function buildPortfolioPayload(form) {
  return {
    page_type: form.pageType,
    commission_category: form.pageType === 'commission' ? form.commissionCategory : null,
    display_date: form.displayDate,
    sort_date: parseDisplayDateToSort(form.displayDate),
    platform: form.pageType === 'artwork' ? form.platform : null,
    external_link: form.externalLink || '#',
    title_zh: form.titleZh,
    title_jp: form.titleJp,
    title_en: form.titleEn,
    desc_zh: form.descZh,
    desc_jp: form.descJp,
    desc_en: form.descEn,
    bonus_label_zh: form.bonusLabelZh,
    bonus_label_jp: form.bonusLabelJp,
    bonus_label_en: form.bonusLabelEn,
    bonus_text_zh: form.bonusTextZh,
    bonus_text_jp: form.bonusTextJp,
    bonus_text_en: form.bonusTextEn,
    bonus_url: form.bonusUrl,
    client_zh: form.clientZh,
    client_jp: form.clientJp,
    client_en: form.clientEn,
    image_path: form.imagePath,
    fullsize_path: form.fullsizePath,
    published: true,
  };
}

export { parseDisplayDateToSort };
