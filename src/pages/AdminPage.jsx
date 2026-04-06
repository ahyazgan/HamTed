import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { CATS } from "../data/categories";
import { loadOrders } from "../utils/storage";
import { fmt } from "../utils/format";
import SEO from "../components/SEO";

export default function AdminPage({ t }) {
  const [tab, setTab] = useState("overview");
  const orders = loadOrders();

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalMargin = orders.reduce((s, o) => s + o.items.reduce((ss, it) => ss + (it.price - it.cost) * it.qty, 0), 0);

  const tabs = [
    { id: "overview", label: "Genel Bakis" },
    { id: "products", label: "Urunler" },
    { id: "orders", label: "Siparisler" },
    { id: "stats", label: "Istatistikler" },
  ];

  return (
    <div className="page-content">
      <SEO title="Admin Dashboard" description="HamTed admin paneli. Gelir, marj ve siparis yonetimi." />
      <div className="page-header" style={{ textAlign: "left" }}>
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`admin-tab ${tab === tb.id ? "admin-tab-active" : ""}`}>{tb.label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div>
          <div className="admin-stats-grid">
            {[
              ["\uD83D\uDCB0", "Toplam Ciro", `\u20BA${fmt(totalRevenue)}`, "var(--accent)"],
              ["\uD83D\uDCC8", "Toplam Marj", `\u20BA${fmt(totalMargin)}`, "var(--green)"],
              ["\uD83D\uDCE6", "Siparis Sayisi", orders.length, "var(--blue)"],
              ["\uD83D\uDECD", "Urun Sayisi", PRODUCTS.length, "var(--amber)"],
              ["\uD83C\uDFE2", "Tedarikci", [...new Set(PRODUCTS.map(p => p.supplier))].length, "var(--green)"],
              ["\u26A0", "Dusuk Stok", PRODUCTS.filter(p => p.stock <= 20).length, "var(--red)"],
            ].map(([icon, label, value, color]) => (
              <div key={label} className="admin-stat-card">
                <div className="admin-stat-icon">{icon}</div>
                <div className="admin-stat-label">{label}</div>
                <div className="admin-stat-value" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Low stock alerts */}
          <h3 className="section-title" style={{ marginTop: 32 }}>Dusuk Stok Uyarilari</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Urun</th><th>Stok</th><th>Kategori</th><th>Tedarikci</th></tr></thead>
              <tbody>
                {PRODUCTS.filter(p => p.stock <= 20).sort((a, b) => a.stock - b.stock).map(p => (
                  <tr key={p.id}>
                    <td className="admin-td-name">{p.name}</td>
                    <td><span className={`stock-badge ${p.stock <= 0 ? "stock-out" : "stock-low"}`}>{p.stock <= 0 ? "Stok Yok" : p.stock + " " + p.unit}</span></td>
                    <td>{CATS.find(c => c.id === p.cat)?.name}</td>
                    <td>{p.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products */}
      {tab === "products" && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Urun</th><th>Kategori</th><th>Alis</th><th>Satis</th><th>Marj</th><th>Stok</th><th>Puan</th></tr></thead>
            <tbody>
              {PRODUCTS.map(p => (
                <tr key={p.id}>
                  <td className="admin-td-name">{p.name}</td>
                  <td>{CATS.find(c => c.id === p.cat)?.icon}</td>
                  <td>{"\u20BA"}{fmt(p.cost)}</td>
                  <td>{p.pt === "quote" ? "Teklif" : `\u20BA${fmt(p.price)}`}</td>
                  <td style={{ color: "var(--green)" }}>{p.pt === "quote" ? "-" : `%${Math.round(((p.price - p.cost) / p.cost) * 100)}`}</td>
                  <td><span className={`stock-badge ${p.stock <= 0 ? "stock-out" : p.stock <= 20 ? "stock-low" : "stock-in"}`}>{p.stock}</span></td>
                  <td>{"\u2605"} {p.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        orders.length === 0 ? (
          <div className="empty-state"><div className="empty-title">Henuz siparis yok</div></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Siparis No</th><th>Tarih</th><th>Urun Sayisi</th><th>Toplam</th><th>Durum</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="admin-td-name">{o.id}</td>
                    <td>{new Date(o.date).toLocaleDateString("tr-TR")}</td>
                    <td>{o.items.length}</td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>{"\u20BA"}{fmt(o.total)}</td>
                    <td><span className={`status-badge status-${o.status}`}>{o.status === "processing" ? "Hazirlaniyor" : o.status === "shipped" ? "Kargoda" : "Teslim Edildi"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Stats */}
      {tab === "stats" && (
        <div>
          <h3 className="section-title">Kategori Bazli Urun Dagilimi</h3>
          <div className="admin-stats-grid">
            {CATS.map(c => {
              const catProds = PRODUCTS.filter(p => p.cat === c.id);
              const avgMargin = catProds.length > 0 ? Math.round(catProds.reduce((s, p) => s + ((p.price - p.cost) / p.cost) * 100, 0) / catProds.length) : 0;
              return (
                <div key={c.id} className="admin-stat-card">
                  <div className="admin-stat-icon">{c.icon}</div>
                  <div className="admin-stat-label">{c.name}</div>
                  <div className="admin-stat-value" style={{ color: c.clr }}>{catProds.length} urun</div>
                  <div style={{ fontSize: 11, color: "var(--green)", marginTop: 4 }}>Ort. marj: %{avgMargin}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
