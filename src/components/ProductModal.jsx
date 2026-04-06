import { useState } from "react";
import { CATS } from "../data/categories";
import { fmt } from "../utils/format";

export default function ProductModal({ product, admin, onClose, onAddCart }) {
  const [qty, setQty] = useState(product.minQty);
  const ct = CATS.find(c => c.id === product.cat);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close" aria-label="Kapat">{"\u2715"}</button>

        <div className="product-cat">{ct?.icon} {ct?.name}</div>
        <h3 className="modal-title">{product.name}</h3>
        <div className="modal-supplier">{product.supplier}</div>
        <div className="modal-desc">{product.desc}</div>

        <div className="info-grid">
          {[
            ["Birim Fiyat", `\u20BA${fmt(product.price)}/${product.unit}`],
            ["Min. Siparis", `${product.minQty} ${product.unit}`],
            ["Teslimat", product.delivery],
            ["Odeme", "Pesin / Kredi Karti"],
          ].map(([l, v]) => (
            <div key={l} className="info-cell">
              <div className="info-label">{l}</div>
              <div className="info-value">{v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="field-label">Miktar ({product.unit})</label>
          <div className="qty-row">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(product.minQty, q - product.minQty))} aria-label="Miktari azalt">{"\u2212"}</button>
            <input type="number" className="qty-input" value={qty}
              onChange={e => setQty(Math.max(product.minQty, parseInt(e.target.value) || product.minQty))} aria-label="Miktar" />
            <button className="qty-btn" onClick={() => setQty(q => q + product.minQty)} aria-label="Miktari artir">+</button>
            <span className="qty-unit">{product.unit}</span>
          </div>
        </div>

        <div className="modal-footer">
          <div>
            <div className="total-label">Toplam Tutar</div>
            <div className="total-price">{"\u20BA"}{fmt(product.price * qty)}</div>
          </div>
          <button onClick={() => onAddCart(product, qty)} className="btn-primary btn-lg">Sepete Ekle</button>
        </div>

        {admin && (
          <div className="admin-info" style={{ marginTop: 12 }}>
            Marj: {"\u20BA"}{fmt((product.price - product.cost) * qty)} ({Math.round(((product.price - product.cost) / product.cost) * 100)}%)
          </div>
        )}
      </div>
    </div>
  );
}
