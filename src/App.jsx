import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomBanner from './components/BottomBanner';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Artworks from './pages/Artworks';
import Commer from './pages/Commer';
import Commissions from './pages/Commissions';
import Contact from './pages/Contact';
import Stop from './pages/Stop';
import Admin from './pages/Admin';
import { fetchPublicMaintenance } from './lib/adminApi';
import './i18n';
import './styles/backtotop.css';

function isAdminPath(pathname) {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === '/admin' || normalized.endsWith('/admin');
}

function AdminRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
      <BottomBanner />
      <Footer />
      <BackToTop />
    </>
  );
}

function SiteRoutes() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artworks" element={<Artworks />} />
        <Route path="/commer" element={<Commer />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <BottomBanner />
      <Footer />
      <BackToTop />
    </>
  );
}

export default function App() {
  const location = useLocation();
  const adminPath = isAdminPath(location.pathname);
  const envMaintenance = import.meta.env.VITE_MAINTENANCE === 'true';
  const [maintenance, setMaintenance] = useState(envMaintenance);
  const [ready, setReady] = useState(adminPath || !envMaintenance);

  useEffect(() => {
    if (adminPath) {
      setReady(true);
      return;
    }

    let active = true;

    async function loadMaintenance() {
      if (envMaintenance) {
        if (active) {
          setMaintenance(true);
          setReady(true);
        }
        return;
      }

      const enabled = await fetchPublicMaintenance();
      if (active) {
        setMaintenance(enabled);
        setReady(true);
      }
    }

    loadMaintenance();
    return () => {
      active = false;
    };
  }, [adminPath, envMaintenance, location.pathname]);

  if (adminPath) {
    return <AdminRoutes />;
  }

  if (!ready) {
    return null;
  }

  if (maintenance) {
    return (
      <Routes>
        <Route path="*" element={<Stop />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="*" element={<SiteRoutes />} />
    </Routes>
  );
}
