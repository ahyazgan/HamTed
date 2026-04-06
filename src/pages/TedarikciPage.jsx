import { useState } from "react";
import { C } from "../utils/theme";
import { validateForm } from "../utils/validation";
import SEO from "../components/SEO";

const FIELDS = [
  { key: "firma", label: "Firma Adi *", type: "text", placeholder: "Sirket unvaniniz", required: true },
  { key: "yetkili", label: "Yetkili Adi *", type: "text", placeholder: "Ad Soyad", required: true },
  { key: "tel", label: "Telefon *", type: "tel", placeholder: "05XX XXX XX XX", required: true },
  { key: "email", label: "E-posta *", type: "email", placeholder: "ornek@firma.com", required: true },
  { key: "kategori", label: "Urun Kategorisi", type: "text", placeholder: "Orn: Celik, Kimyasal, Cimento...", required: false },
  { key: "aciklama", label: "Aciklama", type: "text", placeholder: "Urun cesitleriniz, kapasiteniz...", required: false },
];

const BENEFITS = [
  ["Genis musteri agi", "Turkiye genelinde binlerce aktif alici"],
  ["Dusuk komisyon", "%3-5 arasi satis komisyonu"],
  ["Hizli odeme", "Siparisler icin 7 gun icinde odeme"],
  ["Lojistik destek", "Teslimat ve depolama altyapisi"],
];

export default function TedarikciPage() {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

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
    <div className="page-content">
      <SEO title="Tedarikci Ol" description="HamTed'e tedarikci olarak katilarak binlerce aliciya ulasin." />
      <section className="tedarikci-hero">
        <div className="hero-bg-text" style={{ color: C.green }}>TED</div>
        <div className="tedarikci-grid">
          <div className="tedarikci-info">
            <div className="section-badge" style={{ background: C.greenBg, borderColor: C.green+"30", color: C.green }}>
              Tedarikci Agimiza Katilin
            </div>
            <h1 className="page-title" style={{ textAlign: "left" }}>
              Urunlerinizi binlerce<br /><span style={{ color: C.green }}>aliciya ulastirin.</span>
            </h1>
            <p className="tedarikci-desc">
              HamTed'e tedarikci olarak katilarak Turkiye genelindeki KOBi'lere ulasin. Komisyon bazli, risk yok.
            </p>
            <div className="benefits-list">
              {BENEFITS.map(([t, d]) => (
                <div key={t} className="benefit-item">
                  <div className="benefit-check">{"\u2713"}</div>
                  <div>
                    <div className="benefit-title">{t}</div>
                    <div className="benefit-desc">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-card">
            {sent ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div className="success-icon">{"\u2713"}</div>
                <div className="success-title">Basvurunuz alindi!</div>
                <div className="success-desc">Ekibimiz en kisa surede sizinle iletisime gececektir.</div>
              </div>
            ) : (
              <>
                <h3 className="form-card-title">Basvuru Formu</h3>
                {FIELDS.map(f => (
                  <div key={f.key} className="form-group">
                    <label className="field-label-sm">{f.label}</label>
                    <input type={f.type}
                      placeholder={f.placeholder}
                      value={values[f.key] || ""}
                      onChange={e => handleChange(f.key, e.target.value)}
                      className={`form-input ${errors[f.key] ? "form-input-error" : ""}`} />
                    {errors[f.key] && <div className="field-error">{errors[f.key]}</div>}
                  </div>
                ))}
                <button onClick={handleSubmit} className="btn-primary btn-full" style={{ background: C.green, marginTop: 8, boxShadow: `0 4px 16px ${C.green}30` }}>
                  Basvuru Gonder
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
