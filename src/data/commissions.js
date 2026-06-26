import commGeneral20251024 from '../assets/commissions/general/20251024.jpg';
import commGeneral20251024Full from '../assets/commissions/general/fullsize/20251024_FULL.jpg';
import commGeneral20250823 from '../assets/commissions/general/20250823.png';
import commGeneral20250823Full from '../assets/commissions/general/fullsize/20250823_FULL.png';
import commR18_20251123 from '../assets/commissions/r18/20251123.jpg';
import commR18_20251123Full from '../assets/commissions/r18/fullsize/20251123_FULL.jpg';
import commR18_20250725 from '../assets/commissions/r18/20250725.jpg';
import commR18_20250725Full from '../assets/commissions/r18/fullsize/20250725_FULL.jpg';

export const commissions = [
  {
    id: 1,
    category: 'general',
    date: '2025.10.24',
    image: commGeneral20251024,
    fullsizeImage: commGeneral20251024Full,
    titleKey: 'comm_004_title',
    descKey: 'comm_004_desc',
    bonusKey: 'comm_004',
    link: 'https://www.pixiv.net/artworks/136649323',
  },
  {
    id: 2,
    category: 'general',
    date: '2025.08.23',
    image: commGeneral20250823,
    fullsizeImage: commGeneral20250823Full,
    titleKey: 'comm_005_title',
    descKey: 'comm_005_desc',
    link: '#',
  },
  {
    id: 3,
    category: 'r18',
    date: '2025.11.23',
    image: commR18_20251123,
    fullsizeImage: commR18_20251123Full,
    titleKey: 'comm_r18_004_title',
    descKey: 'comm_r18_004_desc',
    bonusKey: 'comm_r18_004',
    link: 'https://www.pixiv.net/artworks/137812779',
  },
  {
    id: 4,
    category: 'r18',
    date: '2025.07.25',
    image: commR18_20250725,
    fullsizeImage: commR18_20250725Full,
    titleKey: 'comm_r18_003_title',
    descKey: 'comm_r18_003_desc',
    bonusKey: 'comm_r18_003',
    link: 'https://www.pixiv.net/artworks/133106188',
  },
];

const sortByDateDesc = (items) =>
  [...items].sort((a, b) => {
    const dateA = new Date(a.date.replace(/\./g, '-'));
    const dateB = new Date(b.date.replace(/\./g, '-'));
    return dateB - dateA;
  });

export const generalCommissions = sortByDateDesc(
  commissions.filter((c) => c.category === 'general'),
);
export const r18Commissions = sortByDateDesc(
  commissions.filter((c) => c.category === 'r18'),
);
