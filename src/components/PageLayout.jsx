import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * @param {boolean} hasBackground
 */
function PageLayout({ children, hasBackground = false }) {
  useEffect(() => {
    if (hasBackground) {
      document.body.classList.add('has-bg');
    } else {
      document.body.classList.remove('has-bg');
    }
    return () => document.body.classList.remove('has-bg');
  }, [hasBackground]);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default PageLayout;