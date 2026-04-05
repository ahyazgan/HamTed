import { useState } from "react";
import { Link } from "react-router-dom";
import { validateForm } from "../utils/validation";

const FIELDS = [
  { key: "firma", label: "Firma Adi *", type: "text", placeholder: "Sirket unvaniniz", required: true },
  { key: "yetkili", label: "Yetkili Ad Soyad *", type: "text", placeholder: "Ad Soyad", required: true },
  { key: "email", label: "E-posta *", type: "email", placeholder: "ornek@firma.com", required: true },
  { key: "tel", label: "Telefon *", type: "tel", placeholder: "05XX XXX XX XX", required: true },
  { key: "taxNo", label: "Vergi No", type: "text", placeholder: "Vergi numaraniz", required: false },
  { key: "city", label: "Sehir *", type: "text", placeholder: "Istanbul", required: true },
  { key: "address", label: "Adres", type: "text", placeholder: "Sirket adresi", required: false },
  { key: "password", label: "Sifre *", type: "password", placeholder: "En az 6 karakter", required: true },
  { key: "passwordConfirm", label: "Sifre Tekrar *", type: "password", placeholder: "Sifrenizi tekrarlayin", required: true },
];

export default function RegisterPage({ t }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const handleChange = (key, val) => {
    setValues(v => ({ ...v, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateForm(FIELDS, values);
    if (values.password && values.password.length < 6) errs.password = "En az 6 karakter olmali";
    if (values.password !== values.passwordConfirm) errs.passwordConfirm = "Sifreler eslesmiyor";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="page-content">
        <div className="order-confirm-card">
          <div className="success-icon" style={{ width: 72, height: 72, fontSize: 32, marginBottom: 20 }}>{"\u2713"}</div>
          <h1 className="page-title" style={{ color: "var(--green)" }}>Kayit Basarili!</h1>
          <p style={{ color: "var(--text-sec)", marginTop: 8, marginBottom: 24 }}>Hesabiniz olusturuldu. Artik giris yapabilirsiniz.</p>
          <Link to="/" className="btn-primary btn-lg">Ana Sayfaya Don</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="register-container">
        <div className="page-header">
          <div className="login-logo">H</div>
          <h1 className="page-title">{t.auth.registerTitle}</h1>
          <p className="page-desc">{t.auth.registerDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-grid">
            {FIELDS.map(f => (
              <div key={f.key} className={`form-group ${f.key === "address" ? "form-group-full" : ""}`}>
                <label className="field-label-sm">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={values[f.key] || ""}
                  onChange={e => handleChange(f.key, e.target.value)}
                  className={`form-input ${errors[f.key] ? "form-input-error" : ""}`} />
                {errors[f.key] && <div className="field-error">{errors[f.key]}</div>}
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary btn-full btn-lg" style={{ marginTop: 16 }}>{t.auth.freeRegister}</button>
        </form>

        <div className="login-register" style={{ marginTop: 24 }}>
          <span>{t.auth.hasAccount} </span>
          <Link to="/" className="link-btn link-btn-bold">{t.auth.loginNow}</Link>
        </div>
      </div>
    </div>
  );
}
