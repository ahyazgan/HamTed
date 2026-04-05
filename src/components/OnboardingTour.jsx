import { useState, useEffect } from "react";

const STEPS = [
  { title: "HamTed'e Hosgeldiniz!", desc: "Turkiye'nin B2B hammadde tedarik platformu. Size kisa bir tur atalim.", position: "center" },
  { title: "Urunleri Kesfet", desc: "Katalogdan hammadde arayabilir, kategorilere gore filtreleyebilirsiniz.", position: "center" },
  { title: "Canli Piyasa Takibi", desc: "Ust barda celik, bakir, doviz gibi emtia fiyatlarini anlik takip edin.", position: "center" },
  { title: "Sepet ve Siparis", desc: "Urunleri sepete ekleyin, kupon kullanin, taksitli odeme seceneklerini gorun.", position: "center" },
  { title: "Sektor Araclari", desc: "Ansiklopedi, haberler, talep tahtasi, stok takip gibi profesyonel araclar kullanin.", position: "center" },
  { title: "Hazirsiniz!", desc: "Platformu kesfetmeye baslayin. Sorulariniz icin canli destek her zaman yaninda.", position: "center" },
];

const TOUR_KEY = "hamted_tour_done";

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setShow(true);
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, "1");
  };

  const handleNext = () => {
    if (step >= STEPS.length - 1) handleClose();
    else setStep(s => s + 1);
  };

  if (!show) return null;

  const s = STEPS[step];

  return (
    <div className="tour-overlay">
      <div className="tour-card">
        <div className="tour-progress">
          {STEPS.map((_, i) => (
            <div key={i} className={`tour-dot ${i === step ? "tour-dot-active" : i < step ? "tour-dot-done" : ""}`} />
          ))}
        </div>
        <h3 className="tour-title">{s.title}</h3>
        <p className="tour-desc">{s.desc}</p>
        <div className="tour-actions">
          <button onClick={handleClose} className="btn-sm btn-outline">Atla</button>
          <button onClick={handleNext} className="btn-primary">
            {step >= STEPS.length - 1 ? "Basla!" : "Sonraki"}
          </button>
        </div>
        <div className="tour-counter">{step + 1} / {STEPS.length}</div>
      </div>
    </div>
  );
}
