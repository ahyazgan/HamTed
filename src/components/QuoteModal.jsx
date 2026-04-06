import { useState } from "react";
import { C } from "../utils/theme";
import { validateForm } from "../utils/validation";

const FIELDS = [
  { key: "qty", label: "Miktar *", type: "number", required: true },
  { key: "firma", label: "Firma Adi *", type: "text", placeholder: "Sirket unvaniniz", required: true },
  { key: "tel", label: "Telefon *", type: "tel", placeholder: "05XX XXX XX XX", required: true },
  { key: "email", label: "E-posta", type: "email", placeholder: "ornek@firma.com", required: false },
  { key: "not", label: "Not (opsiyonel)", type: "text", placeholder: "Ozel kalite, boyut veya teslimat talebi...", required: false },
];

export default function QuoteModal({ product, admin, onClose }) {
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ qty: product.minQty + " " + product.unit });
  const [errors, setErrors] = useState({});

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const handleSubmit = () => {
    const { valid, errors: errs } = validateForm(FIELDS, values);
    if (!valid) { setErrors(errs); return; }
    setSent(true);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close" aria-label="Kapat">{"\u2715"}</button>

        <div className="section-badge" style={{ background: C.blueBg, color: C.blue }}>Teklif Talebi</div>
        <h3 className="modal-title" style={{ fontSize: 20 }}>{product.name}</h3>
        <div className="modal-supplier">{product.supplier} · {product.desc}</div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div className="success-icon">{"\u2713"}</div>
            <div className="success-title">Talebiniz alindi!</div>
            <div className="success-desc">En gec 2 saat icinde guncel fiyat teklifiniz<br />e-posta ve SMS ile gonderilecektir.</div>
          </div>
        ) : (
          <>
            {FIELDS.map(f => (
              <div key={f.key} className="form-group">
                <label className="field-label-sm">{f.label}</label>
                <input type={f.type}
                  placeholder={f.placeholder || ""}
                  value={values[f.key] || ""}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className={`form-input ${errors[f.key] ? "form-input-error" : ""}`} />
                {errors[f.key] && <div className="field-error">{errors[f.key]}</div>}
              </div>
            ))}
            <button onClick={handleSubmit} className="btn-primary btn-full" style={{ background: C.blue, marginTop: 8, boxShadow: `0 4px 16px ${C.blue}30` }}>Teklif Iste</button>
            <div className="form-hint">Distributorumazden anlik fiyat alip size teklif gonderecegiz.</div>
            {admin && <div className="admin-info" style={{ marginTop: 10 }}>Teklif gelince distributor fiyatina %5-8 marj ekleyip gondereceksiniz. Risk: {"\u20BA"}0.</div>}
          </>
        )}
      </div>
    </div>
  );
}
