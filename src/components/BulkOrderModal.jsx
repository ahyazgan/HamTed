import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { useToast } from "./Toast";

export default function BulkOrderModal({ onAddItems, onClose }) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState([]);

  const handleParse = () => {
    const lines = text.trim().split("\n").filter(Boolean);
    const items = [];
    for (const line of lines) {
      const parts = line.split(/[,;\t]+/).map(s => s.trim());
      if (parts.length < 2) continue;
      const name = parts[0];
      const qty = parseInt(parts[1]);
      if (!qty || qty <= 0) continue;
      const product = PRODUCTS.find(p =>
        p.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
      );
      items.push({ name, qty, product: product || null, matched: !!product });
    }
    setParsed(items);
  };

  const handleImport = () => {
    const matched = parsed.filter(p => p.matched);
    if (matched.length === 0) { toast("Eslesen urun bulunamadi", "error"); return; }
    const cartItems = matched.map(m => ({
      ...m.product,
      qty: Math.max(m.qty, m.product.minQty)
    }));
    onAddItems(cartItems);
    toast(`${matched.length} urun sepete eklendi`, "success");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">{"\u2715"}</button>
        <h3 className="modal-title">Toplu Siparis</h3>
        <div className="modal-supplier">CSV veya metin formatinda urun listesi yukleyin</div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="field-label">Urun listesi (urun adi, miktar)</label>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={"HRP Sac, 10\nPortland Cimento, 50\nHDPE Granul, 5"}
            rows={6} className="form-input form-textarea" />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={handleParse} className="btn-primary">Analiz Et</button>
          <label className="btn-sm btn-outline" style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            CSV Yukle
            <input type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => setText(ev.target.result);
                reader.readAsText(file);
              }
            }} />
          </label>
        </div>

        {parsed.length > 0 && (
          <>
            <div className="cart-section-title">Sonuclar ({parsed.filter(p => p.matched).length}/{parsed.length} eslesti)</div>
            {parsed.map((p, i) => (
              <div key={i} className="cart-item" style={{ borderBottom: "1px solid var(--border-light)", padding: "8px 0" }}>
                <div className="cart-item-info">
                  <div className="cart-item-name" style={{ color: p.matched ? "var(--text)" : "var(--red)" }}>
                    {p.matched ? "\u2713" : "\u2715"} {p.name}
                  </div>
                  <div className="cart-item-meta">
                    {p.matched ? `Eslesti: ${p.product.name} · ${p.qty} ${p.product.unit}` : "Urun bulunamadi"}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={handleImport} className="btn-primary btn-full btn-lg" style={{ marginTop: 16 }}>
              {parsed.filter(p => p.matched).length} Urunu Sepete Ekle
            </button>
          </>
        )}
      </div>
    </div>
  );
}
