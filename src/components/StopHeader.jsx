import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

export default function MiniHeader() {
  const { i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const langRef = useRef(null);

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    { code: 'jp', name: '日本語' },
    { code: 'zh', name: '繁體中文' },
    { code: 'en', name: 'English' },
  ];

  const langDisplay = {
    jp: '日本語',
    zh: '繁體中文',
    en: 'English',
  };

  return (
    <header
      className={`header ${scrolled ? 'scrolled' : ''}`}
      style={{ zIndex: 9999 }}
    >
      <div className="nav-container">
        <NavLink to="/" className="logo">
          <img src="../images/logo.png" alt="NIGHTFOX" className="logo-img" />
        </NavLink>

        <div
          className="custom-language-selector"
          ref={langRef}
          style={{ position: 'relative', zIndex: 10000 }}
        >
          <div
            className={`selected-language ${langOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setLangOpen(!langOpen);
            }}
          >
            <span className="language-icon">🌐</span>
            <span className="selected-text">
              {langDisplay[i18n.language] || '日本語'}
            </span>
            <span className="dropdown-arrow">▼</span>
          </div>

          {langOpen && (
            <div
              className="language-dropdown-menu"
              style={{ zIndex: 10001 }}
            >
              {languages.map((lng) => (
                <a
                  key={lng.code}
                  href="#"
                  className={`language-option ${
                    i18n.language === lng.code ? 'current' : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
      </div>
    </header>
  );
}