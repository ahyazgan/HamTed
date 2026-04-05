import { useParams, Link } from "react-router-dom";
import { loadOrders } from "../utils/storage";
import { fmt } from "../utils/format";

const STEPS = [
  { key: "confirmed", label: "Onaylandi", icon: "\u2713" },
  { key: "processing", label: "Hazirlaniyor", icon: "\u2699" },
  { key: "shipped", label: "Kargoda", icon: "\uD83D\uDE9A" },
  { key: "delivered", label: "Teslim Edildi", icon: "\uD83D\uDCE6" },
];

export default function OrderTrackPage({ t }) {
  const { orderId } = useParams();
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">{t.order.track}</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">{"\u2298"}</div>
          <div className="empty-title">Siparis bulunamadi</div>
          <div className="empty-desc">
            <Link to="/" className="link-btn link-btn-bold">{t.order.backHome}</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = STEPS.findIndex(s => s.key === order.status);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{t.order.track}</h1>
        <p className="page-desc">Siparis: <strong>{order.id}</strong></p>
      </div>

      {/* Progress */}
      <div className="track-progress">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`track-step ${i <= currentStep ? "track-step-done" : ""} ${i === currentStep ? "track-step-current" : ""}`}>
            <div className="track-icon">{s.icon}</div>
            <div className="track-label">{s.label}</div>
            {i < STEPS.length - 1 && <div className={`track-line ${i < currentStep ? "track-line-done" : ""}`} />}
          </div>
        ))}
      </div>

      {/* Order details */}
      <div className="detail-grid" style={{ marginTop: 40 }}>
        <div>
          <h3 className="section-title">Siparis Detayi</h3>
          <div className="detail-specs">
            <div className="spec-row"><span className="spec-label">{t.order.orderNo}</span><span className="spec-value">{order.id}</span></div>
            <div className="spec-row"><span className="spec-label">{t.order.date}</span><span className="spec-value">{new Date(order.date).toLocaleDateString("tr-TR")}</span></div>
            <div className="spec-row"><span className="spec-label">{t.cart.grand}</span><span className="spec-value" style={{ color: "var(--accent)", fontWeight: 800 }}>{"\u20BA"}{fmt(order.total)}</span></div>
          </div>
        </div>
        <div>
          <h3 className="section-title">Urunler</h3>
          {order.items.map((it, i) => (
            <div key={i} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{it.name}</div>
                <div className="cart-item-meta">{it.qty} {it.unit}</div>
              </div>
              <div className="cart-item-price">{"\u20BA"}{fmt(it.price * it.qty)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
