import { buildCommissions } from '../lib/portfolioStorage';

const commissionsRaw = [
  {
    id: 1,
    category: 'general',
    date: '2025.10.24',
    imagePath: 'commissions/general/20251024.jpg',
    fullsizePath: 'commissions/general/fullsize/20251024_FULL.jpg',
    titleKey: 'comm_004_title',
    descKey: 'comm_004_desc',
    bonusKey: 'comm_004',
    link: 'https://www.pixiv.net/artworks/136649323',
  },
  {
    id: 2,
    category: 'general',
    date: '2025.08.23',
    imagePath: 'commissions/general/20250823.png',
    fullsizePath: 'commissions/general/fullsize/20250823_FULL.png',
    titleKey: 'comm_005_title',
    descKey: 'comm_005_desc',
    link: '#',
  },
  {
    id: 3,
    category: 'r18',
    date: '2025.11.23',
    imagePath: 'commissions/r18/20251123.jpg',
    fullsizePath: 'commissions/r18/fullsize/20251123_FULL.jpg',
    titleKey: 'comm_r18_004_title',
    descKey: 'comm_r18_004_desc',
    bonusKey: 'comm_r18_004',
    link: 'https://www.pixiv.net/artworks/137812779',
  },
  {
    id: 4,
    category: 'r18',
    date: '2025.07.25',
    imagePath: 'commissions/r18/20250725.jpg',
    fullsizePath: 'commissions/r18/fullsize/20250725_FULL.jpg',
    titleKey: 'comm_r18_003_title',
    descKey: 'comm_r18_003_desc',
    bonusKey: 'comm_r18_003',
    link: 'https://www.pixiv.net/artworks/133106188',
  },
];

const built = buildCommissions(commissionsRaw);

export const commissions = built.commissions;
export const generalCommissions = built.generalCommissions;
export const r18Commissions = built.r18Commissions;
