import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomBanner from './components/BottomBanner';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop'; 
import Home from './pages/Home';
import Artworks from './pages/Artworks';
import Commer from './pages/Commer';
import Contact from './pages/Contact';
import Stop from './pages/Stop';
import './i18n';
import './styles/backtotop.css'; 

// 🚧 maintain on or off?
const isMaintenance = import.meta.env.VITE_MAINTENANCE === 'true';

export default function App() {
  // maintain mode on
  if (isMaintenance) {
    return (
      <Routes>
        <Route path="*" element={<Stop />} />
      </Routes>
    );
  }

  // maintain mode off
  return (
    <>
      <ScrollToTop />  
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artworks" element={<Artworks />} />
        <Route path="/commer" element={<Commer />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <BottomBanner />
      <Footer />
      <BackToTop />
    </>
  );
}