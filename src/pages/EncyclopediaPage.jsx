import { useState } from "react";
import { Link } from "react-router-dom";
import { ENCYCLOPEDIA, getMarketPrices, getTrendLabel } from "../data/market";
import { CATS } from "../data/categories";
import SEO from "../components/SEO";

export default function EncyclopediaPage() {
  const [selected, setSelected] = useState(null);
  const [catFilter, setCatFilter] = useState(null);
  const prices = getMarketPrices();

  const items = catFilter ? ENCYCLOPEDIA.filter(e => e.cat === catFilter) : ENCYCLOPEDIA;
  const item = ENCYCLOPEDIA.find(e => e.id === selected);
  const marketData = item ? prices.find(p => p.id === item.marketId) : null;

  return (
    <div className="page-content">
      <SEO title="Hammadde Ansiklopedisi" description="Hammaddeler hakkinda teknik bilgi, kullanim alanlari ve standartlar" />
      <div className="page-header">
        <div className="section-badge" style={{ background: "var(--blue-bg)", borderColor: "var(--blue)", color: "var(--blue)" }}>Bilgi Bankasi</div>
        <h1 className="page-title">Hammadde Ansiklopedisi</h1>
        <p className="page-desc">Teknik bilgi, kullanim alanlari ve standartlar</p>
      </div>

      <div className="cat-row">
        <button onClick={() => setCatFilter(null)} className={`cat-btn ${!catFilter ? "cat-active" : ""}`}>Tumu</button>
        {CATS.map(c => <button key={c.id} onClick={() => setCatFilter(c.id)} className={`cat-btn ${catFilter === c.id ? "cat-active" : ""}`}>{c.icon} {c.name}</button>)}
      </div>

      <div className="about-grid">
        <div className="ency-list">
          {items.map(e => (
            <div key={e.id} onClick={() => setSelected(e.id)} className={`ency-item ${selected === e.id ? "ency-item-active" : ""}`}>
              <div className="ency-item-cat">{CATS.find(c => c.id === e.cat)?.icon} {CATS.find(c => c.id === e.cat)?.name}</div>
              <div className="ency-item-title">{e.title}</div>
              <div className="ency-item-summary">{e.summary}</div>
            </div>
          ))}
        </div>

        {item ? (
          <div className="ency-detail">
            <h2 className="section-title">{item.title}</h2>
            <p className="about-text">{item.summary}</p>

            {marketData && (
              <div className="ency-market-card">
                <span>{"\uD83D\uDCC8"} Guncel piyasa: <strong>{marketData.price.toLocaleString("tr-TR")} {marketData.unit}</strong></span>
                <span className={`ticker-change ${marketData.change >= 0 ? "ticker-up" : "ticker-down"}`}>{marketData.change >= 0 ? "+" : ""}{marketData.changePercent.toFixed(2)}%</span>
                <Link to="/piyasa" className="link-btn">Detayli grafik {"\u2192"}</Link>
              </div>
            )}

            {[["Teknik Ozellikler", item.specs], ["Kullanim Alanlari", item.uses], ["Standartlar", item.standards], ["Depolama", item.storage]].map(([label, val]) => (
              <div key={label} className="ency-section">
                <h4 className="ency-section-title">{label}</h4>
                <p className="ency-section-text">{val}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><div className="empty-title">Bir madde secin</div></div>
        )}
      </div>
    </div>
  );
}
