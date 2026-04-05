import { useParams, Link } from "react-router-dom";
import { loadOrders } from "../utils/storage";
import { fmt } from "../utils/format";

export default function OrderConfirmPage({ t }) {
  const { orderId } = useParams();
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{"\u2298"}</div>
          <div className="empty-title">Siparis bulunamadi</div>
          <div className="empty-desc"><Link to="/" className="link-btn link-btn-bold">{t.order.backHome}</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="order-confirm-card">
        <div className="success-icon" style={{ width: 72, height: 72, fontSize: 32, marginBottom: 20 }}>{"\u2713"}</div>
        <h1 className="page-title" style={{ color: "var(--green)" }}>{t.order.confirmed}</h1>
        <p style={{ color: "var(--text-sec)", marginTop: 8 }}>Siparisleriniz basariyla alindi.</p>

        <div className="order-info-grid">
          <div className="order-info-cell">
            <div className="info-label">{t.order.orderNo}</div>
            <div className="info-value" style={{ color: "var(--accent)" }}>{order.id}</div>
          </div>
          <div className="order-info-cell">
            <div className="info-label">{t.order.date}</div>
            <div className="info-value">{new Date(order.date).toLocaleDateString("tr-TR")}</div>
          </div>
          <div className="order-info-cell">
            <div className="info-label">{t.order.status}</div>
            <div className="info-value"><span className="status-badge status-processing">{t.order.processing}</span></div>
          </div>
          <div className="order-info-cell">
            <div className="info-label">{t.cart.grand}</div>
            <div className="info-value" style={{ fontSize: 20, fontWeight: 900, color: "var(--accent)" }}>{"\u20BA"}{fmt(order.total)}</div>
          </div>
        </div>

        <div className="order-items">
          <h3 className="section-title">Siparis Detayi</h3>
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

        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Link to={`/siparis-takip/${order.id}`} className="btn-primary btn-lg">{t.order.track}</Link>
          <Link to="/" className="btn-primary btn-lg" style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", boxShadow: "none" }}>{t.order.backHome}</Link>
        </div>
      </div>
    </div>
  );
}
