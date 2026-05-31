import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/footer.css';

export default function Footer() {
  const { t } = useTranslation();
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show when no rolling space (short page)
      if (docHeight <= 0) {
        setOpacity(1);
        return;
      }

      // Scroll progress 0 ~ 1
      const progress = scrollTop / docHeight;

      // Start fading in at 60% scroll, fully visible at 100%
      // Adjust 0.4 for earlier appearance, 0.8 for later
      const start = 0.6;
      let value = (progress - start) / (1 - start);
      value = Math.max(0, Math.min(1, value));

      setOpacity(value);
    };

    handleScroll(); // Initial call
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="copyright" style={{ opacity }}>
      {t('footer.copyright')}
    </div>
  );
}