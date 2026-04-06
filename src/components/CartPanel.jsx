import { useState } from "react";
import { SHIP } from "../data/shipping";
import { fmt } from "../utils/format";
import { loadOrders } from "../utils/storage";
import CouponInput, { calculateDiscount } from "./CouponInput";

export default function CartPanel({ cart, setCart, ship, setShip, admin, onClose, onOrder, onShowAddress, onShowBulk, onRepeatOrder, t }) {
  const [coupon, setCoupon] = useState(null);

  const subT = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totW = cart.reduce((s, c) => s + c.qty, 0);
  const sh = SHIP.find(s => s.id === ship);
  const shC = coupon?.type === "shipping" ? 0 : (sh?.price || 0) * totW;
  const discount = calculateDiscount(coupon, subT);
  const grand = Math.max(0, subT + shC - discount);
  const tM = cart.reduce((s, c) => s + (c.price - c.cost) * c.qty, 0);
  const lM = (sh ? (sh.price - sh.cost) : 0) * totW;

  const changeQty = (id, delta, minQty) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(minQty, c.qty + delta) } : c));
  };

  const pastOrders = loadOrders();

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h3>{t.cart.title}</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {onShowBulk && <button onClick={onShowBulk} className="btn-sm btn-outline" title="Toplu siparis" aria-label="Toplu siparis">{"\uD83D\uDCCB"}</button>}
            {onShowAddress && <button onClick={onShowAddress} className="btn-sm btn-outline" title="Adres defteri" aria-label="Adres defteri">{"\uD83D\uDCCD"}</button>}
            <button onClick={onClose} className="modal-close-sm" aria-label="Sepeti kapat">{"\u2715"}</button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">{"\u2298"}</div>
            <div className="cart-empty-text">{t.cart.empty}</div>
            {pastOrders.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "var(--text-ter)", marginBottom: 8 }}>Gecmis siparislerden tekrarla:</div>
                {pastOrders.slice(0, 3).map(o => (
                  <button key={o.id} onClick={() => onRepeatOrder?.(o)}
                    className="btn-sm btn-outline" style={{ margin: "2px 4px", fontSize: 11 }}>
                    {"\u21BB"} {o.id} ({o.items.length} urun)
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {cart.map(it => (
              <div key={it.id} className="cart-item" style={{ flexDirection: "column", gap: 8, alignItems: "stretch" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{it.name}</div>
                    <div className="cart-item-meta">{it.supplier}</div>
                  </div>
                  <button onClick={() => setCart(cart.filter(c => c.id !== it.id))} className="cart-remove-btn">{"\u2715"}</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="qty-row" style={{ gap: 4 }}>
                    <button className="qty-btn" style={{ width: 28, height: 28, fontSize: 14 }} onClick={() => changeQty(it.id, -it.minQty, it.minQty)} aria-label="Miktari azalt">{"\u2212"}</button>
                    <span style={{ padding: "0 8px", fontSize: 14, fontWeight: 700, minWidth: 40, textAlign: "center" }}>{it.qty} {it.unit}</span>
                    <button className="qty-btn" style={{ width: 28, height: 28, fontSize: 14 }} onClick={() => changeQty(it.id, it.minQty, it.minQty)} aria-label="Miktari artir">+</button>
                  </div>
                  <div className="cart-item-price">{"\u20BA"}{fmt(it.price * it.qty)}</div>
                </div>
              </div>
            ))}

            {/* Coupon */}
            <div style={{ margin: "12px 0" }}>
              <CouponInput subtotal={subT} appliedCoupon={coupon} onApply={setCoupon} onRemove={() => setCoupon(null)} />
            </div>

            <div className="cart-section">
              <div className="cart-section-title">{t.cart.delivery}</div>
              {SHIP.map(s => (
                <div key={s.id} onClick={() => setShip(s.id)} className={`ship-option ${ship === s.id ? "ship-active" : ""}`}>
                  <div className="ship-row">
                    <div className={`ship-name ${ship === s.id ? "ship-name-active" : ""}`}>{s.name} <span className="ship-days">· {s.days}</span></div>
                    <div className={`ship-price ${s.price === 0 || coupon?.type === "shipping" ? "ship-free" : ""}`}>
                      {s.price === 0 || coupon?.type === "shipping" ? t.cart.free : `\u20BA${fmt(s.price)}/ton`}
                    </div>
                  </div>
                  {admin && s.price > 0 && <div className="admin-info" style={{ marginTop: 4, padding: "2px 0" }}>Maliyet: {"\u20BA"}{fmt(s.cost)} {"\u2192"} Marj: {"\u20BA"}{fmt(s.price - s.cost)}/ton</div>}
                </div>
              ))}
            </div>

            <div className="cart-totals">
              <div className="cart-total-row"><span>{t.cart.products}</span><span>{"\u20BA"}{fmt(subT)}</span></div>
              {shC > 0 && <div className="cart-total-row"><span>{t.cart.deliveryFee} ({totW} ton)</span><span>{"\u20BA"}{fmt(shC)}</span></div>}
              {discount > 0 && <div className="cart-total-row" style={{ color: "var(--green)" }}><span>Indirim ({coupon.code})</span><span>-{"\u20BA"}{fmt(discount)}</span></div>}
              <div className="cart-total-row" style={{ color: "var(--text-ter)", fontStyle: "italic" }}><span>{t.cart.deferred}</span><span>{t.cart.soon}</span></div>
              <div className="cart-grand-row"><span>{t.cart.grand}</span><span style={{ color: "var(--accent)" }}>{"\u20BA"}{fmt(grand)}</span></div>
            </div>

            {admin && (
              <div className="admin-earnings">
                <div className="admin-earnings-title">{t.cart.yourRevenue}</div>
                <div className="admin-row" style={{ color: "var(--green)" }}><span>{t.cart.tradeMargin}</span><span>{"\u20BA"}{fmt(tM)}</span></div>
                <div className="admin-row" style={{ color: "var(--amber)" }}><span>{t.cart.logisticsMargin}</span><span>{"\u20BA"}{fmt(lM)}</span></div>
                <div className="admin-total"><span>{t.cart.totalEarnings}</span><span>{"\u20BA"}{fmt(tM + lM)}</span></div>
              </div>
            )}

            <button onClick={() => onOrder(grand, shC)} className="btn-primary btn-full btn-lg" style={{ marginTop: 16 }}>{t.cart.confirm}</button>
            <div className="form-hint">{t.cart.paymentNote}</div>
          </>
        )}
      </div>
    </div>
  );
}
