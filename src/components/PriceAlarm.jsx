import { useState } from "react";
import { loadPriceAlarms, savePriceAlarms } from "../utils/storage";
import { useToast } from "./Toast";
import { fmt } from "../utils/format";

export default function PriceAlarm({ product }) {
  const toast = useToast();
  const alarms = loadPriceAlarms();
  const existing = alarms.find(a => a.productId === product.id);
  const [targetPrice, setTargetPrice] = useState(existing?.targetPrice || "");
  const [show, setShow] = useState(false);

  const handleSet = () => {
    const price = Number(targetPrice);
    if (!price || price <= 0) { toast("Gecerli bir fiyat girin", "error"); return; }
    const updated = alarms.filter(a => a.productId !== product.id);
    updated.push({ productId: product.id, productName: product.name, targetPrice: price, createdAt: new Date().toISOString() });
    savePriceAlarms(updated);
    toast(`Fiyat alarmi kuruldu: \u20BA${fmt(price)}`, "success");
    setShow(false);
  };

  const handleRemove = () => {
    savePriceAlarms(alarms.filter(a => a.productId !== product.id));
    toast("Fiyat alarmi kaldirildi", "info");
    setTargetPrice("");
  };

  if (product.pt === "quote") return null;

  return (
    <div className="price-alarm">
      {existing ? (
        <div className="price-alarm-set">
          <span>{"\uD83D\uDD14"} Alarm: {"\u20BA"}{fmt(existing.targetPrice)}</span>
          <button onClick={handleRemove} className="link-btn">Kaldir</button>
        </div>
      ) : (
        <>
          <button onClick={() => setShow(!show)} className="fav-detail-btn">
            {"\uD83D\uDD14"} Fiyat Alarmi Kur
          </button>
          {show && (
            <div className="price-alarm-form">
              <label className="field-label-sm">Hedef fiyat ({"\u20BA"}/{product.unit})</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={targetPrice} onChange={e => setTargetPrice(e.target.value)}
                  placeholder={`Mevcut: ${fmt(product.price)}`} className="form-input" style={{ flex: 1 }} />
                <button onClick={handleSet} className="btn-primary">Kur</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
