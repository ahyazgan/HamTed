import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { SHIP } from "../data/shipping";
import { getCurrencies } from "../data/market";
import { fmt } from "../utils/format";

const TAX_RATES = [
  { id: "kdv18", label: "KDV %18", rate: 0.18 },
  { id: "kdv10", label: "KDV %10", rate: 0.10 },
  { id: "kdv1", label: "KDV %1", rate: 0.01 },
  { id: "none", label: "KDV Haric", rate: 0 },
];

export default function CostCalculator({ onClose }) {
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [shipId, setShipId] = useState("std");
  const [taxId, setTaxId] = useState("kdv18");
  const [currency, setCurrency] = useState("try");

  const product = PRODUCTS.find(p => p.id === Number(productId));
  const ship = SHIP.find(s => s.id === shipId);
  const tax = TAX_RATES.find(t => t.id === taxId);
  const currencies = getCurrencies();
  const usdRate = currencies.find(c => c.id === "usd_try")?.price || 38.45;

  const quantity = Math.max(0, Number(qty) || 0);
  const productCost = product ? product.price * quantity : 0;
  const shipCost = ship ? ship.price * quantity : 0;
  const subtotal = productCost + shipCost;
  const taxAmount = subtotal * (tax?.rate || 0);
  const total = subtotal + taxAmount;
  const totalUsd = total / usdRate;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">{"\u2715"}</button>
        <h3 className="modal-title">{"\uD83E\uDDEE"} Maliyet Hesaplayici</h3>
        <div className="modal-supplier">Urun + kargo + vergi toplam maliyet</div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="field-label-sm">Urun</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} className="filter-select" style={{ width: "100%" }}>
            <option value="">Urun secin...</option>
            {PRODUCTS.filter(p => p.pt === "fixed").map(p => (
              <option key={p.id} value={p.id}>{p.name} — {"\u20BA"}{fmt(p.price)}/{p.unit}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="field-label-sm">Miktar ({product?.unit || "ton"})</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" className="form-input" />
          </div>
          <div className="form-group">
            <label className="field-label-sm">Teslimat</label>
            <select value={shipId} onChange={e => setShipId(e.target.value)} className="filter-select" style={{ width: "100%" }}>
              {SHIP.map(s => <option key={s.id} value={s.id}>{s.name} — {s.price === 0 ? "Ucretsiz" : `\u20BA${s.price}/ton`}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="field-label-sm">Vergi</label>
          <select value={taxId} onChange={e => setTaxId(e.target.value)} className="filter-select" style={{ width: "100%" }}>
            {TAX_RATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        {product && quantity > 0 && (
          <div className="calc-results">
            <div className="calc-row"><span>Urun tutari</span><span>{"\u20BA"}{fmt(productCost)}</span></div>
            <div className="calc-row"><span>Kargo</span><span>{"\u20BA"}{fmt(shipCost)}</span></div>
            <div className="calc-row"><span>{tax.label}</span><span>{"\u20BA"}{fmt(taxAmount)}</span></div>
            <div className="calc-total"><span>Toplam</span><span>{"\u20BA"}{fmt(total)}</span></div>
            <div className="calc-row" style={{ color: "var(--blue)", fontSize: 12 }}><span>USD karsiligi</span><span>${fmt(totalUsd)}</span></div>
            <div className="calc-row" style={{ color: "var(--text-ter)", fontSize: 11 }}><span>Birim maliyet</span><span>{"\u20BA"}{fmt(total / quantity)}/{product.unit}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
