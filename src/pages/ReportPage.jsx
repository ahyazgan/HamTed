import { loadOrders } from "../utils/storage";
import { CATS } from "../data/categories";
import { fmt } from "../utils/format";
import { exportOrders } from "../utils/exportExcel";
import SEO from "../components/SEO";

export default function ReportPage() {
  const orders = loadOrders();
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalItems = orders.reduce((s, o) => s + o.items.length, 0);

  // Category breakdown
  const catTotals = {};
  orders.forEach(o => o.items.forEach(it => {
    const cat = it.cat || "diger";
    catTotals[cat] = (catTotals[cat] || 0) + it.price * it.qty;
  }));

  // Monthly breakdown
  const monthlyTotals = {};
  orders.forEach(o => {
    const month = new Date(o.date).toLocaleDateString("tr-TR", { year: "numeric", month: "long" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + o.total;
  });

  return (
    <div className="page-content">
      <SEO title="Satin Alma Raporu" description="Satin alma harcama ozeti ve analizler" />
      <div className="page-header" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">{"\uD83D\uDCCA"} Satin Alma Raporu</h1>
          <p className="page-desc">Harcama ozeti ve kategori bazli analiz</p>
        </div>
        {orders.length > 0 && (
          <button onClick={() => exportOrders(orders)} className="btn-primary">{"\uD83D\uDCC1"} Excel'e Aktar</button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">{"\uD83D\uDCCA"}</div><div className="empty-title">Henuz siparis vermediniz</div></div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card"><div className="admin-stat-icon">{"\uD83D\uDCB0"}</div><div className="admin-stat-label">Toplam Harcama</div><div className="admin-stat-value" style={{ color: "var(--accent)" }}>{"\u20BA"}{fmt(totalSpent)}</div></div>
            <div className="admin-stat-card"><div className="admin-stat-icon">{"\uD83D\uDCE6"}</div><div className="admin-stat-label">Siparis Sayisi</div><div className="admin-stat-value" style={{ color: "var(--blue)" }}>{orders.length}</div></div>
            <div className="admin-stat-card"><div className="admin-stat-icon">{"\uD83D\uDECD"}</div><div className="admin-stat-label">Toplam Urun</div><div className="admin-stat-value" style={{ color: "var(--green)" }}>{totalItems}</div></div>
            <div className="admin-stat-card"><div className="admin-stat-icon">{"\uD83D\uDCC8"}</div><div className="admin-stat-label">Ort. Siparis</div><div className="admin-stat-value" style={{ color: "var(--amber)" }}>{"\u20BA"}{fmt(totalSpent / orders.length)}</div></div>
          </div>

          {Object.keys(catTotals).length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 className="section-title">Kategori Bazli Harcama</h2>
              <div className="admin-stats-grid">
                {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => {
                  const c = CATS.find(cc => cc.id === cat);
                  return (
                    <div key={cat} className="admin-stat-card">
                      <div className="admin-stat-icon">{c?.icon || "\uD83D\uDCE6"}</div>
                      <div className="admin-stat-label">{c?.name || cat}</div>
                      <div className="admin-stat-value" style={{ color: c?.clr || "var(--text)", fontSize: 18 }}>{"\u20BA"}{fmt(total)}</div>
                      <div style={{ fontSize: 11, color: "var(--text-ter)" }}>%{Math.round(total / totalSpent * 100)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <h2 className="section-title">Siparis Gecmisi</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Siparis No</th><th>Tarih</th><th>Urun</th><th>Toplam</th><th>Durum</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="admin-td-name">{o.id}</td>
                      <td>{new Date(o.date).toLocaleDateString("tr-TR")}</td>
                      <td>{o.items.length} urun</td>
                      <td style={{ fontWeight: 700, color: "var(--accent)" }}>{"\u20BA"}{fmt(o.total)}</td>
                      <td><span className={`status-badge status-${o.status}`}>{o.status === "processing" ? "Hazirlaniyor" : o.status === "shipped" ? "Kargoda" : "Teslim"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
