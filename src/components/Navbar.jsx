import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '繁體中文' },
    { code: 'en', label: 'English' },
  ];

  const currentLangLabel =
    languages.find((l) => l.code === i18n.language)?.label || '日本語';

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <NavLink to="/" className="logo">
          <img src="/images/logo.png" alt="NIGHTFOX" className="logo-img" />
        </NavLink>

        <nav className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" className="nav-btn" onClick={() => setMenuOpen(false)}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/artworks" className="nav-btn" onClick={() => setMenuOpen(false)}>
            {t('nav.artworks')}
          </NavLink>
          <NavLink to="/commer" className="nav-btn" onClick={() => setMenuOpen(false)}>
            {t('nav.request')}
          </NavLink>
          <NavLink to="/contact" className="nav-btn" onClick={() => setMenuOpen(false)}>
            {t('nav.contact')}
          </NavLink>

          <div className="custom-language-selector">
            <div
              className={`selected-language ${langOpen ? 'active' : ''}`}
              onClick={() => setLangOpen(!langOpen)}
            >
              <span className="language-icon">🌐</span>
              <span className="selected-text">{currentLangLabel}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {langOpen && (
              <div className="language-dropdown-menu">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-option ${
                      i18n.language === lang.code ? 'current' : ''
                    }`}
                    onClick={() => changeLang(lang.code)}
                  >
                    <span>{lang.label}</span>
                    <span className="check-mark">✓</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <button
          className={`mobile-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}