import art20260329 from '../assets/artworks/20260329.jpg';
import art20260308 from '../assets/artworks/20260308.jpg';
import art20251225 from '../assets/artworks/20251225.jpg';
import art20251101 from '../assets/artworks/20251101.jpg';
import art20251012 from '../assets/artworks/20251012.jpg';
import art20250829 from '../assets/artworks/20250829.jpg';
import art20250810 from '../assets/artworks/20250810.jpg';
import art20250622 from '../assets/artworks/20250622.jpg';
import art20250407 from '../assets/artworks/20250407.jpg';
import art20241031 from '../assets/artworks/20241031.jpg';
import art20241019 from '../assets/artworks/20241019.jpg';
import art20240927 from '../assets/artworks/20240927.jpg';

const artworksRaw = [
  {
    id: 1,
    date: '2025.11.01',
    platform: 'Pixiv',
    image: art20251101,
    titleKey: 'art_2025_11_01',   // i18n key
    link: 'https://www.pixiv.net/artworks/136977187',
  },
  {
    id: 2,
    date: '2025.10.12',
    platform: 'Pixiv',
    image:  art20251012,
    titleKey: 'art_2025_10_12',
    link: 'https://www.pixiv.net/artworks/136193149',
  },
  {
    id: 3,
    date: '2025.8.29',
    platform: 'Pixiv',
    image: art20250829,
    titleKey: 'art_2025_08_29',
    link: 'https://www.pixiv.net/artworks/134468065',
  },
  {
    id: 4,
    date: '2025.8.10',
    platform: 'Pixiv',
    image: art20250810,
    titleKey: 'art_2025_08_10',
    link: 'https://www.pixiv.net/artworks/133721266',
  },
  {
    id: 5,
    date: '2025.6.22',
    platform: 'Pixiv',
    image: art20250622,
    titleKey: 'art_2025_06_22',
    link: 'https://www.pixiv.net/artworks/131853848',
  },
  {
    id: 6,
    date: '2025.4.7',
    platform: 'Pixiv',
    image: art20250407,
    titleKey: 'art_2025_04_07',
    link: 'https://www.pixiv.net/artworks/129068611',
  },
  {
    id: 7,
    date: '2024.10.31',
    platform: 'Pixiv',
    image: art20241031,
    titleKey: 'art_2024_10_31',
    link: 'https://www.pixiv.net/artworks/123857704',
  },
  {
    id: 8,
    date: '2024.10.19',
    platform: 'Pixiv',
    image: art20241019,
    titleKey: 'art_2024_10_19',
    link: 'https://www.pixiv.net/artworks/123482185',
  },
  {
    id: 9,
    date: '2024.9.27',
    platform: 'Pixiv',
    image: art20240927,
    titleKey: 'art_2024_09_27',
    link: 'https://www.pixiv.net/artworks/122816028',
  },
  {
    id: 10,
    date: '2025.12.25',
    platform: 'Pixiv',
    image: art20251225,
    titleKey: 'art_2025_12_25',
    link: 'https://www.pixiv.net/artworks/139052431',
  },
  {
    id: 11,
    date: '2026.3.8',
    platform: 'Pixiv',
    image: art20260308,
    titleKey: 'art_2026_03_08',
    link: 'https://www.pixiv.net/artworks/142064210',
  },
  {
    id: 12,
    date: '2026.3.29',
    platform: 'Pixiv',
    image: art20260329,
    titleKey: 'art_2026_03_29',
    link: 'https://www.pixiv.net/artworks/142896853',
  },
];

export const artworks = [...artworksRaw].sort((a, b) => {
  const dateA = new Date(a.date.replace(/\./g, '-'));
  const dateB = new Date(b.date.replace(/\./g, '-'));
  return dateB - dateA;
});