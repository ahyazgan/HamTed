import { useState } from "react";
import { loadAddresses, saveAddresses } from "../utils/storage";
import { useToast } from "./Toast";
import { validateForm } from "../utils/validation";

const FIELDS = [
  { key: "title", label: "Adres Basligi *", type: "text", placeholder: "Orn: Fabrika, Depo...", required: true },
  { key: "name", label: "Ad Soyad *", type: "text", placeholder: "Yetkili adi", required: true },
  { key: "tel", label: "Telefon *", type: "tel", placeholder: "05XX XXX XX XX", required: true },
  { key: "city", label: "Sehir *", type: "text", placeholder: "Istanbul", required: true },
  { key: "address", label: "Adres *", type: "text", placeholder: "Tam adres", required: true },
];

export default function AddressBook({ onSelect, onClose }) {
  const toast = useToast();
  const [addresses, setAddresses] = useState(() => loadAddresses());
  const [showForm, setShowForm] = useState(false);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const handleSave = () => {
    const { valid, errors: errs } = validateForm(FIELDS, values);
    if (!valid) { setErrors(errs); return; }
    const newAddr = { ...values, id: Date.now() };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    saveAddresses(updated);
    setShowForm(false);
    setValues({});
    toast("Adres kaydedildi", "success");
  };

  const handleDelete = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    saveAddresses(updated);
    toast("Adres silindi", "info");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">{"\u2715"}</button>
        <h3 className="modal-title">Adres Defteri</h3>
        <div className="modal-supplier">Teslimat adreslerinizi yonetin</div>

        {addresses.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-ter)" }}>Kayitli adres yok</div>
        )}

        {addresses.map(a => (
          <div key={a.id} className="address-card">
            <div className="address-card-head">
              <div className="address-title">{a.title}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {onSelect && <button onClick={() => { onSelect(a); onClose(); }} className="btn-sm btn-outline">Sec</button>}
                <button onClick={() => handleDelete(a.id)} className="cart-remove-btn">{"\u2715"}</button>
              </div>
            </div>
            <div className="address-detail">{a.name} · {a.tel}</div>
            <div className="address-detail">{a.address}, {a.city}</div>
          </div>
        ))}

        {showForm ? (
          <div className="address-form">
            {FIELDS.map(f => (
              <div key={f.key} className="form-group">
                <label className="field-label-sm">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={values[f.key] || ""} onChange={e => handleChange(f.key, e.target.value)}
                  className={`form-input ${errors[f.key] ? "form-input-error" : ""}`} />
                {errors[f.key] && <div className="field-error">{errors[f.key]}</div>}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}>Kaydet</button>
              <button onClick={() => setShowForm(false)} className="btn-sm btn-outline">Iptal</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="btn-primary btn-full" style={{ marginTop: 16 }}>+ Yeni Adres Ekle</button>
        )}
      </div>
    </div>
  );
}
