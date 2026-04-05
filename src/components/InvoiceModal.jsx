import { fmt } from "../utils/format";

export default function InvoiceModal({ order, onClose, t }) {
  const handlePrint = () => {
    const el = document.getElementById("invoice-content");
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Fatura</title><style>
      body{font-family:Arial,sans-serif;padding:40px;color:#1A1918}
      h1{font-size:24px;margin-bottom:8px}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #ddd;padding:10px;text-align:left}
      th{background:#f5f5f5;font-size:12px}
      .total-row{font-weight:bold;font-size:16px}
      .header{display:flex;justify-content:space-between;align-items:start;margin-bottom:30px}
      .meta{font-size:13px;color:#666}
    </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  if (!order) return null;

  const subT = order.items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">{"\u2715"}</button>

        <div id="invoice-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 30 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>HamTed</h1>
              <div style={{ fontSize: 11, color: "#666" }}>Hammadde Tedarik Platformu</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Buyukdere Cad. No:123, Levent, Istanbul</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>{t.invoice.title}</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{t.invoice.invoiceNo}: {order.id}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{t.invoice.date}: {new Date(order.date).toLocaleDateString("tr-TR")}</div>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: 10, background: "#f5f5f5", textAlign: "left", fontSize: 12 }}>{t.invoice.product}</th>
                <th style={{ border: "1px solid #ddd", padding: 10, background: "#f5f5f5", textAlign: "center", fontSize: 12 }}>{t.invoice.qty}</th>
                <th style={{ border: "1px solid #ddd", padding: 10, background: "#f5f5f5", textAlign: "right", fontSize: 12 }}>{t.invoice.unitPrice}</th>
                <th style={{ border: "1px solid #ddd", padding: 10, background: "#f5f5f5", textAlign: "right", fontSize: 12 }}>{t.invoice.total}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ddd", padding: 10, fontSize: 13 }}>{it.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: 10, textAlign: "center", fontSize: 13 }}>{it.qty} {it.unit}</td>
                  <td style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", fontSize: 13 }}>{"\u20BA"}{fmt(it.price)}</td>
                  <td style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", fontSize: 13, fontWeight: 600 }}>{"\u20BA"}{fmt(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", fontWeight: 700 }}>{t.invoice.grandTotal}</td>
                <td style={{ border: "1px solid #ddd", padding: 10, textAlign: "right", fontSize: 18, fontWeight: 900, color: "#C85A24" }}>{"\u20BA"}{fmt(subT + (order.shipping || 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button onClick={handlePrint} className="btn-primary btn-full btn-lg">{t.invoice.download}</button>
      </div>
    </div>
  );
}
