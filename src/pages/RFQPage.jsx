import { useState } from "react";
import { CATS } from "../data/categories";
import { useToast } from "../components/Toast";
import { validateForm } from "../utils/validation";
import SEO from "../components/SEO";

const DEMO_RFQS = [
  { id: 1, title: "50 ton HRP Sac aranıyor", cat: "celik", qty: "50 ton", budget: "900.000 TL", deadline: "2026-04-15", status: "open", replies: 3 },
  { id: 2, title: "Portland Cimento - 200 ton", cat: "cimento", qty: "200 ton", budget: "550.000 TL", deadline: "2026-04-20", status: "open", replies: 5 },
  { id: 3, title: "HDPE Granul - 10 ton acil", cat: "kimyasal", qty: "10 ton", budget: "290.000 TL", deadline: "2026-04-10", status: "closed", replies: 8 },
];

const FIELDS = [
  { key: "title", label: "Talep Basligi *", type: "text", placeholder: "Orn: 30 ton Nervurlu Demir", required: true },
  { key: "cat", label: "Kategori *", type: "text", placeholder: "Celik, Cimento, Kimyasal...", required: true },
  { key: "qty", label: "Miktar *", type: "text", placeholder: "Orn: 50 ton", required: true },
  { key: "budget", label: "Butce", type: "text", placeholder: "Orn: 500.000 TL", required: false },
  { key: "deadline", label: "Son tarih *", type: "date", placeholder: "", required: true },
  { key: "desc", label: "Aciklama", type: "text", placeholder: "Kalite, teslimat tercihi, ozel gereksinimler...", required: false },
];

export default function RFQPage() {
  const toast = useToast();
  const [rfqs, setRfqs] = useState(DEMO_RFQS);
  const [showForm, setShowForm] = useState(false);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const handleSubmit = () => {
    const { valid, errors: errs } = validateForm(FIELDS, values);
    if (!valid) { setErrors(errs); return; }
    setRfqs([{ id: Date.now(), ...values, status: "open", replies: 0 }, ...rfqs]);
    setShowForm(false);
    setValues({});
    toast("Talep ilaniniz yayinlandi!", "success");
  };

  return (
    <div className="page-content">
      <SEO title="Talep Tahtasi (RFQ)" description="Hammadde talep ilaninizi olusturun, tedarikcilerden teklif alin" />
      <div className="page-header">
        <div className="section-badge" style={{ background: "var(--accent-bg)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>RFQ</div>
        <h1 className="page-title">Talep Tahtasi</h1>
        <p className="page-desc">Ihtiyacinizi ilan edin, tedarikciler size teklif versin</p>
      </div>

      <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-lg" style={{ marginBottom: 24 }}>
        {showForm ? "Iptal" : "+ Yeni Talep Olustur"}
      </button>

      {showForm && (
        <div className="form-card" style={{ marginBottom: 24 }}>
          <h3 className="form-card-title">Yeni Talep</h3>
          {FIELDS.map(f => (
            <div key={f.key} className="form-group">
              <label className="field-label-sm">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={values[f.key] || ""} onChange={e => handleChange(f.key, e.target.value)}
                className={`form-input ${errors[f.key] ? "form-input-error" : ""}`} />
              {errors[f.key] && <div className="field-error">{errors[f.key]}</div>}
            </div>
          ))}
          <button onClick={handleSubmit} className="btn-primary btn-full" style={{ marginTop: 8 }}>Talep Yayinla</button>
        </div>
      )}

      <div className="rfq-list">
        {rfqs.map(r => (
          <div key={r.id} className="rfq-card">
            <div className="rfq-card-head">
              <div>
                <span className={`status-badge ${r.status === "open" ? "status-processing" : "status-delivered"}`}>{r.status === "open" ? "Acik" : "Kapali"}</span>
                <span className="rfq-cat">{CATS.find(c => c.id === r.cat)?.icon || "\uD83D\uDCE6"}</span>
              </div>
              <span className="rfq-replies">{r.replies} teklif</span>
            </div>
            <h4 className="rfq-title">{r.title}</h4>
            <div className="rfq-meta">
              <span>{r.qty}</span>
              {r.budget && <span>· {r.budget}</span>}
              <span>· Son: {r.deadline}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
