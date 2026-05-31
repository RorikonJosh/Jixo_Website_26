import { useTranslation } from 'react-i18next';
import MiniHeader from '../components/stopheader';
import '../styles/Stop.css';

export default function Stop() {
  const { t } = useTranslation();

  return (
    <>
      <MiniHeader />

      <div className="stop-wrapper">
        <div className="stop-content">
          <img src="../images/stop.png" alt="NIGHTFOX" className="stop-img" />
          <h1>{t('stop.title')}</h1>
          <p>{t('stop.message')}</p>
          <p>{t('stop.subMessage')}</p>
          <p className="stop-sub">{t('stop.backSoon')}</p>
        </div>
      </div>
    </>
  );
}