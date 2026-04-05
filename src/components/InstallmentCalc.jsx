import { calculateInstallments } from "../utils/pricing";
import { fmt } from "../utils/format";

export default function InstallmentCalc({ total, onClose }) {
  const options = calculateInstallments(total);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">{"\u2715"}</button>
        <h3 className="modal-title">Taksit Secenekleri</h3>
        <div className="modal-supplier">Toplam tutar: {"\u20BA"}{fmt(total)}</div>

        <div className="installment-list">
          {options.map(opt => (
            <div key={opt.months} className={`installment-row ${opt.months === 1 ? "installment-active" : ""}`}>
              <div className="installment-label">{opt.label}</div>
              <div className="installment-detail">
                {opt.months === 1 ? (
                  <span className="installment-monthly">{"\u20BA"}{fmt(opt.total)}</span>
                ) : (
                  <>
                    <span className="installment-monthly">{"\u20BA"}{fmt(opt.monthly)} <span style={{ fontSize: 11, color: "var(--text-ter)" }}>x {opt.months}</span></span>
                    <span className="installment-total">Toplam: {"\u20BA"}{fmt(opt.total)}</span>
                  </>
                )}
              </div>
              {opt.rate > 0 && <div className="installment-rate">+%{(opt.rate * 100).toFixed(1)} vade farki</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
