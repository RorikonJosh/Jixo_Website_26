import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import '../styles/header.css';

export default function Header() {
  const { t, i18n } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef(null);

  // change language
  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  // Scroll header effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close language menu when click outside
  useEffect(() => {
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const languages = [
    { code: 'JP', name: '日本語' },
    { code: 'TC', name: '繁體中文' },
    { code: 'EN', name: 'English' },
  ];

  const langDisplay = {
    JP: '日本語',
    TC: '繁體中文',
    EN: 'English',
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <NavLink to="/" className="logo">
          <img src="/logo.png" alt="NIGHTFOX" className="logo-img" />
        </NavLink>

        <nav className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" end className="nav-btn">{t('nav.home')}</NavLink>
          <NavLink to="/art" className="nav-btn">{t('nav.artworks')}</NavLink>
          <NavLink to="/commer" className="nav-btn">{t('nav.request')}</NavLink>
          <NavLink to="/contact" className="nav-btn">{t('nav.contact')}</NavLink>
        </nav>

        {/* Language Selector */}
        <div className="custom-language-selector" ref={langRef}>
          <div
            className={`selected-language ${langOpen ? 'active' : ''}`}
            onClick={() => setLangOpen(!langOpen)}
          >
            <span className="language-icon">🌐</span>
            <span className="selected-text">
              {langDisplay[i18n.language] || '日本語'}
            </span>
            <span className="dropdown-arrow">▼</span>
          </div>

          {langOpen && (
            <div className="language-dropdown-menu">
              {languages.map((lng) => (
                <a
                  key={lng.code}
                  href="#"
                  className={`language-option ${
                    i18n.language === lng.code ? 'current' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    changeLang(lng.code);
                  }}
                >
                  <span className="language-info">{lng.name}</span>
                  <span className="check-mark">✓</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <button
          className={`mobile-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}