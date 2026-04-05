import { useState } from "react";
import { useToast } from "./Toast";

const COUPONS = [
  { code: "HOSGELDIN", discount: 10, type: "percent", minOrder: 10000, desc: "%10 Hosgeldin Indirimi" },
  { code: "TOPTAN500", discount: 500, type: "fixed", minOrder: 50000, desc: "500 TL Indirim" },
  { code: "KARGO", discount: 100, type: "shipping", minOrder: 0, desc: "Ucretsiz Kargo" },
];

export default function CouponInput({ subtotal, appliedCoupon, onApply, onRemove }) {
  const [code, setCode] = useState("");
  const toast = useToast();

  const handleApply = () => {
    const coupon = COUPONS.find(c => c.code === code.trim().toUpperCase());
    if (!coupon) { toast("Gecersiz kupon kodu", "error"); return; }
    if (subtotal < coupon.minOrder) { toast(`Min. siparis tutari: \u20BA${coupon.minOrder.toLocaleString("tr-TR")}`, "error"); return; }
    onApply(coupon);
    toast(coupon.desc + " uygulandi!", "success");
    setCode("");
  };

  if (appliedCoupon) {
    return (
      <div className="coupon-applied">
        <div className="coupon-applied-info">
          <span className="coupon-badge">{appliedCoupon.code}</span>
          <span className="coupon-desc">{appliedCoupon.desc}</span>
        </div>
        <button onClick={onRemove} className="coupon-remove">{"\u2715"}</button>
      </div>
    );
  }

  return (
    <div className="coupon-row">
      <input value={code} onChange={e => setCode(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleApply()}
        placeholder="Kupon kodu" className="coupon-input" />
      <button onClick={handleApply} className="coupon-btn">Uygula</button>
    </div>
  );
}

export function calculateDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.type === "percent") return Math.round(subtotal * coupon.discount / 100);
  if (coupon.type === "fixed") return coupon.discount;
  return 0;
}
