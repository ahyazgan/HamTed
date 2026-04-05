import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LANG_OPTIONS } from "../utils/i18n";
import NotificationCenter from "./NotificationCenter";

export default function Header({ cart, showCart, setShowCart, admin, setAdmin, onLoginClick, darkMode, toggleDark, favCount, compareCount, lang, setLang, t, onShowCalc }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMega, setShowMega] = useState(false);
  const navigate = useNavigate();

  const NAV_ITEMS = [
    { label: t.nav.howItWorks, to: "/nasil-calisir" },
    { label: t.nav.supplier, to: "/tedarikci" },
    { label: t.nav.about, to: "/hakkimizda" },
    { label: t.nav.contact, to: "/iletisim" },
  ];

  const SECTOR_ITEMS = [
    { label: "\uD83D\uDCC8 Canli Piyasa", to: "/piyasa" },
    { label: "\uD83D\uDCDA Ansiklopedi", to: "/ansiklopedi" },
    { label: "\uD83D\uDCF0 Haberler", to: "/haberler" },
    { label: "\uD83D\uDCC5 Sezonsal Analiz", to: "/sezonsal" },
    { label: "\uD83D\uDCCB Talep Tahtasi", to: "/talep-tahtasi" },
    { label: "\uD83D\uDCE6 Stok Takip", to: "/stok-takip" },
    { label: "\uD83D\uDCDD Kontratlar", to: "/kontratlar" },
  ];

  const handleNav = (to) => { setMobileMenu(false); setShowMega(false); navigate(to); };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo-link">
          <div className="logo-icon">H</div>
          <div>
            <div className="logo-text">HamTed</div>
            <div className="logo-sub">HAMMADDE TEDARIK</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.label} to={item.to} className="nav-link">{item.label}</Link>
          ))}

          {/* Sector mega menu */}
          <div className="mega-menu-wrap" onMouseEnter={() => setShowMega(true)} onMouseLeave={() => setShowMega(false)}>
            <button className="nav-link" style={{ cursor: "pointer" }}>Sektor {"\u25BE"}</button>
            {showMega && (
              <div className="mega-menu">
                {SECTOR_ITEMS.map(item => (
                  <Link key={item.to} to={item.to} className="mega-menu-item" onClick={() => setShowMega(false)}>{item.label}</Link>
                ))}
              </div>
            )}
          </div>

          <div className="lang-toggle">
            {LANG_OPTIONS.map(l => (
              <button key={l.id} onClick={() => setLang(l.id)} className={`lang-btn ${lang === l.id ? "lang-active" : ""}`}>{l.flag}</button>
            ))}
          </div>

          <button onClick={toggleDark} className="theme-toggle" aria-label="Tema">{darkMode ? "\u2600" : "\u263E"}</button>

          <button onClick={onShowCalc} className="nav-btn" title="Maliyet Hesaplayici">{"\uD83E\uDDEE"}</button>

          <button onClick={() => setShowNotifs(!showNotifs)} className="nav-btn" style={{ position: "relative" }}>
            {"\uD83D\uDD14"}<span className="notif-badge-dot" />
          </button>

          <Link to="/karsilastir" className="nav-btn">
            {"\u2194"}{compareCount > 0 && <span className="cart-badge" style={{ background: "var(--blue)" }}>{compareCount}</span>}
          </Link>

          <Link to="/favoriler" className="nav-btn">
            {"\u2661"}{favCount > 0 && <span className="cart-badge">{favCount}</span>}
          </Link>

          <button onClick={() => setShowCart(!showCart)} className={`nav-btn ${showCart ? "nav-btn-active" : ""}`}>
            {t.nav.cart}{cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>

          <button onClick={onLoginClick} className="btn-primary" style={{ marginLeft: 4 }}>{t.nav.login}</button>
          <button onClick={setAdmin} className={`admin-toggle ${admin ? "admin-on" : ""}`}>{admin ? "ADM" : "Adm"}</button>
        </nav>

        {/* Mobile nav */}
        <div className="mobile-nav">
          <div className="lang-toggle">
            {LANG_OPTIONS.map(l => (
              <button key={l.id} onClick={() => setLang(l.id)} className={`lang-btn ${lang === l.id ? "lang-active" : ""}`}>{l.flag}</button>
            ))}
          </div>
          <button onClick={toggleDark} className="theme-toggle">{darkMode ? "\u2600" : "\u263E"}</button>
          <button onClick={() => setShowCart(!showCart)} className="nav-btn">
            {t.nav.cart}{cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="hamburger-btn">{mobileMenu ? "\u2715" : "\u2630"}</button>
        </div>
      </div>

      {mobileMenu && (
        <div className="mobile-dropdown">
          {NAV_ITEMS.map(item => (
            <button key={item.label} onClick={() => handleNav(item.to)} className="mobile-menu-item">{item.label}</button>
          ))}
          {SECTOR_ITEMS.map(item => (
            <button key={item.to} onClick={() => handleNav(item.to)} className="mobile-menu-item">{item.label}</button>
          ))}
          <button onClick={() => handleNav("/favoriler")} className="mobile-menu-item">{"\u2661"} {t.nav.favorites}</button>
          <button onClick={() => handleNav("/karsilastir")} className="mobile-menu-item">{"\u2194"} {t.nav.compare}</button>
          <button onClick={() => { onLoginClick(); setMobileMenu(false); }} className="mobile-menu-item mobile-menu-login">{t.nav.login}</button>
        </div>
      )}

      {showNotifs && (
        <div className="notif-overlay" onClick={() => setShowNotifs(false)}>
          <div onClick={e => e.stopPropagation()}>
            <NotificationCenter onClose={() => setShowNotifs(false)} t={t} />
          </div>
        </div>
      )}
    </header>
  );
}
