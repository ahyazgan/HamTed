import { useState, useEffect } from "react";
import { CATS } from "../data/categories";
import { PRODUCTS } from "../data/products";
import { fmt } from "../utils/format";
import { loadSearchHistory, saveSearchHistory } from "../utils/storage";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

const SORT_OPTIONS_TR = [
  { id: "promo", label: "One Cikanlar" },
  { id: "price_asc", label: "Fiyat (Dusuk)" },
  { id: "price_desc", label: "Fiyat (Yuksek)" },
  { id: "name_asc", label: "A-Z" },
  { id: "name_desc", label: "Z-A" },
];

export default function HomePage({ admin, onOpenProduct, favs, toggleFav, compareIds, toggleCompare, t }) {
  const [cat, setCat] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("promo");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [heroVis, setHeroVis] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => loadSearchHistory());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVis(true), 100); }, []);

  const handleSearch = (val) => {
    setQ(val);
    setShowHistory(false);
    if (val.trim().length >= 2) {
      const updated = [val.trim(), ...searchHistory.filter(h => h !== val.trim())].slice(0, 8);
      setSearchHistory(updated);
      saveSearchHistory(updated);
    }
  };

  const clearHistory = () => { setSearchHistory([]); saveSearchHistory([]); };

  let prods = [...PRODUCTS]
    .filter(p => (!cat || p.cat === cat) && (!q || (p.name + p.supplier + p.desc).toLowerCase().includes(q.toLowerCase())));
  if (priceMin) prods = prods.filter(p => p.pt === "quote" || p.price >= Number(priceMin));
  if (priceMax) prods = prods.filter(p => p.pt === "quote" || p.price <= Number(priceMax));
  prods.sort((a, b) => {
    switch (sort) {
      case "price_asc": return (a.price || 0) - (b.price || 0);
      case "price_desc": return (b.price || 0) - (a.price || 0);
      case "name_asc": return a.name.localeCompare(b.name, "tr");
      case "name_desc": return b.name.localeCompare(a.name, "tr");
      default: return (b.promo ? 1 : 0) - (a.promo ? 1 : 0);
    }
  });

  return (
    <div className="page-content">
      <SEO title="Ana Sayfa" description="Turkiye'nin B2B hammadde tedarik platformu. Celik, cimento, kimyasal, tekstil ve daha fazlasi toptan fiyatla." />
      {/* Hero */}
      <section className={`hero ${heroVis ? "hero-visible" : ""}`}>
        <div className="hero-bg-text">HAM</div>
        <div className="hero-content">
          <div className="section-badge" style={{ background: "var(--accent-bg)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>{t.hero.badge}</div>
          <h1 className="hero-title">{t.hero.title1}<br /><span style={{ color: "var(--accent)" }}>{t.hero.title2}</span></h1>
          <p className="hero-desc">{t.hero.desc}</p>
          <div className="hero-stats">
            {[["16+", t.hero.products],["6", t.hero.categories],["50+", t.hero.suppliers],[t.hero.sameDay, t.hero.delivery]].map(([n, l]) =>
              <div key={l} className="stat-card"><span className="stat-num">{n}</span><span className="stat-label">{l}</span></div>
            )}
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="search-row">
        <div className="search-bar" style={{ flex: 1, position: "relative" }}>
          <span className="search-icon">&#x2315;</span>
          <input value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => searchHistory.length > 0 && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            onKeyDown={e => e.key === "Enter" && handleSearch(q)}
            placeholder={t.search.placeholder}
            className="search-input" />
          {showHistory && searchHistory.length > 0 && (
            <div className="search-history">
              <div className="search-history-header">
                <span>Son aramalar</span>
                <button onClick={clearHistory} className="link-btn">Temizle</button>
              </div>
              {searchHistory.map((h, i) => (
                <div key={i} className="search-history-item" onMouseDown={() => handleSearch(h)}>{h}</div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`filter-toggle ${showFilters ? "filter-toggle-active" : ""}`}>{"\u2630"} {t.search.filter}</button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label className="filter-label">{t.search.sort}</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className="filter-select">
              {SORT_OPTIONS_TR.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.search.minPrice} ({"\u20BA"})</label>
            <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" className="filter-input" />
          </div>
          <div className="filter-group">
            <label className="filter-label">{t.search.maxPrice} ({"\u20BA"})</label>
            <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="100.000" className="filter-input" />
          </div>
          <div className="filter-group">
            <button onClick={() => { setPriceMin(""); setPriceMax(""); setSort("promo"); }} className="filter-clear">{t.search.clear}</button>
          </div>
        </div>
      )}

      <div className="cat-row">
        <button onClick={() => setCat(null)} className={`cat-btn ${!cat ? "cat-active" : ""}`}>Tumu</button>
        {CATS.map(c =>
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`cat-btn ${cat === c.id ? "cat-active" : ""}`}
            style={cat === c.id ? { background: c.clr+"12", borderColor: c.clr+"50", color: c.clr } : {}}>
            {c.icon} {c.name}
          </button>
        )}
      </div>

      <div className="result-count">{prods.length} {t.search.results}</div>

      <div className="product-grid">
        {prods.map(p =>
          <ProductCard key={p.id} product={p} admin={admin} onOpen={onOpenProduct}
            isFav={favs.includes(p.id)} onToggleFav={() => toggleFav(p.id)}
            isCompare={compareIds.includes(p.id)} onToggleCompare={() => toggleCompare(p.id)} t={t} />
        )}
      </div>

      {prods.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">&#x2315;</div>
          <div className="empty-title">{t.search.noResult}</div>
          <div className="empty-desc">{t.search.tryAgain}</div>
        </div>
      )}

      <div className="trust-grid">
        {[
          ["\uD83D\uDD12", "Guvenli Odeme", "Kredi karti ve havale/EFT ile guvenli odeme. 256-bit SSL sifreleme."],
          ["\u2713", "Kalite Garantisi", "Tum urunler TSE/ISO sertifikali tedarikcilerden."],
          ["\u26A1", "Hizli Teslimat", "Ayni gun sevkiyat secenegi. Turkiye geneline teslimat."],
          ["\uD83D\uDCAC", "7/24 Destek", "WhatsApp ve telefon ile teknik destek."],
        ].map(([i, tt, d]) => (
          <div key={tt} className="trust-card"><div className="trust-icon">{i}</div><div className="trust-title">{tt}</div><div className="trust-desc">{d}</div></div>
        ))}
      </div>
    </div>
  );
}
