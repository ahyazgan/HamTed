import { useState, useEffect } from "react";
import { getMarketPrices, getCurrencies, getTrendLabel } from "../data/market";
import { fmt } from "../utils/format";
import PriceChart from "../components/PriceChart";
import SEO from "../components/SEO";

export default function MarketPage() {
  const [prices, setPrices] = useState(() => getMarketPrices());
  const [currencies, setCurrencies] = useState(() => getCurrencies());
  const [selected, setSelected] = useState("steel_hrp");

  useEffect(() => {
    const iv = setInterval(() => { setPrices(getMarketPrices()); setCurrencies(getCurrencies()); }, 30000);
    return () => clearInterval(iv);
  }, []);

  const sel = prices.find(p => p.id === selected);

  return (
    <div className="page-content">
      <SEO title="Canli Piyasa" description="Hammadde ve doviz piyasalari canli fiyat takibi" />
      <div className="page-header">
        <div className="section-badge" style={{ background: "var(--accent-bg)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>Canli Veri</div>
        <h1 className="page-title">Piyasa Takibi</h1>
        <p className="page-desc">Hammadde ve doviz fiyatlarini anlik takip edin</p>
      </div>

      {/* Currencies */}
      <div className="market-currencies">
        {currencies.map(c => (
          <div key={c.id} className="currency-card">
            <div className="currency-flag">{c.icon}</div>
            <div>
              <div className="currency-name">{c.name}</div>
              <div className="currency-price">{c.price.toFixed(4)}</div>
            </div>
            <div className={`ticker-change ${c.change >= 0 ? "ticker-up" : "ticker-down"}`}>
              {c.change >= 0 ? "\u25B2" : "\u25BC"} {Math.abs(c.changePercent).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Commodities Table */}
      <h2 className="section-title" style={{ marginTop: 32 }}>Emtia Fiyatlari</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th></th><th>Emtia</th><th>Fiyat</th><th>Degisim</th><th>Trend</th><th></th></tr></thead>
          <tbody>
            {prices.map(p => {
              const tr = getTrendLabel(p.trend);
              return (
                <tr key={p.id} onClick={() => setSelected(p.id)} style={{ cursor: "pointer", background: selected === p.id ? "var(--accent-bg)" : undefined }}>
                  <td>{p.icon}</td>
                  <td className="admin-td-name">{p.name}</td>
                  <td style={{ fontWeight: 700 }}>{p.price.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} <span style={{ fontSize: 11, color: "var(--text-ter)" }}>{p.unit}</span></td>
                  <td><span className={`ticker-change ${p.change >= 0 ? "ticker-up" : "ticker-down"}`}>{p.change >= 0 ? "+" : ""}{p.changePercent.toFixed(2)}%</span></td>
                  <td style={{ color: tr.color, fontSize: 12, fontWeight: 600 }}>{tr.icon} {tr.text}</td>
                  <td><button onClick={() => setSelected(p.id)} className="btn-sm btn-outline" style={{ fontSize: 11 }}>Grafik</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      {sel && (
        <div style={{ marginTop: 32 }}>
          <h2 className="section-title">{sel.name} — Fiyat Grafigi</h2>
          <PriceChart history={sel.history} unit={sel.unit} trend={sel.trend} />
        </div>
      )}
    </div>
  );
}
