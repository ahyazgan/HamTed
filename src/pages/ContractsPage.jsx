import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { fmt } from "../utils/format";
import { useToast } from "../components/Toast";
import SEO from "../components/SEO";

const DEMO_CONTRACTS = [
  { id: 1, product: "HRP Sac", supplier: "Marmara Celik Servis", price: 17800, qty: 100, unit: "ton", period: "6 ay", startDate: "2026-01-15", endDate: "2026-07-15", status: "active", delivered: 45 },
  { id: 2, product: "Portland Cimento", supplier: "Bati Anadolu Yapi Malz.", price: 2700, qty: 500, unit: "ton", period: "12 ay", startDate: "2026-02-01", endDate: "2027-02-01", status: "active", delivered: 120 },
];

export default function ContractsPage() {
  const toast = useToast();
  const [contracts, setContracts] = useState(DEMO_CONTRACTS);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="page-content">
      <SEO title="Cerceve Anlasmalari" description="Sabit fiyat ve miktar ile uzun vadeli tedarik anlasmalari" />
      <div className="page-header" style={{ textAlign: "left" }}>
        <h1 className="page-title">{"\uD83D\uDCDD"} Cerceve Anlasmalari</h1>
        <p className="page-desc">Sabit fiyat ile 3-6-12 aylik tedarik anlasmalari</p>
      </div>

      <button onClick={() => setShowNew(!showNew)} className="btn-primary btn-lg" style={{ marginBottom: 24 }}>+ Yeni Anla\u015Fma Talebi</button>

      {showNew && (
        <div className="form-card" style={{ marginBottom: 24 }}>
          <h3 className="form-card-title">Yeni Cerceve Anlasmasi Talebi</h3>
          <div className="form-group"><label className="field-label-sm">Urun</label>
            <select className="filter-select" style={{ width: "100%" }}>
              <option value="">Urun secin...</option>
              {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group"><label className="field-label-sm">Toplam Miktar</label><input className="form-input" placeholder="Orn: 200 ton" /></div>
            <div className="form-group"><label className="field-label-sm">Sure</label>
              <select className="filter-select" style={{ width: "100%" }}>
                <option>3 ay</option><option>6 ay</option><option>12 ay</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="field-label-sm">Hedef Fiyat (opsiyonel)</label><input className="form-input" placeholder="Orn: 17.500 TL/ton" /></div>
          <button onClick={() => { setShowNew(false); toast("Anla\u015Fma talebiniz gonderildi!", "success"); }} className="btn-primary btn-full" style={{ marginTop: 8 }}>Talep Gonder</button>
        </div>
      )}

      {contracts.map(c => {
        const pct = Math.round((c.delivered / c.qty) * 100);
        return (
          <div key={c.id} className="contract-card">
            <div className="contract-head">
              <div>
                <span className={`status-badge ${c.status === "active" ? "status-processing" : "status-delivered"}`}>{c.status === "active" ? "Aktif" : "Tamamlandi"}</span>
                <span className="contract-period">{c.period}</span>
              </div>
            </div>
            <h4 className="contract-product">{c.product}</h4>
            <div className="contract-meta">{c.supplier} · {c.startDate} — {c.endDate}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "16px 0" }}>
              <div className="info-cell"><div className="info-label">Birim Fiyat</div><div className="info-value">{"\u20BA"}{fmt(c.price)}/{c.unit}</div></div>
              <div className="info-cell"><div className="info-label">Toplam Miktar</div><div className="info-value">{c.qty} {c.unit}</div></div>
              <div className="info-cell"><div className="info-label">Teslim Edilen</div><div className="info-value">{c.delivered} {c.unit}</div></div>
            </div>
            <div className="contract-progress">
              <div className="contract-progress-bar" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-ter)", marginTop: 6 }}>%{pct} tamamlandi · {c.qty - c.delivered} {c.unit} kaldi</div>
          </div>
        );
      })}
    </div>
  );
}
