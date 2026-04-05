import { useState } from "react";
import { useToast } from "../components/Toast";
import { fmt } from "../utils/format";
import SEO from "../components/SEO";

const DEMO_INVENTORY = [
  { id: 1, name: "HRP Sac", unit: "ton", current: 12, reorderAt: 5, reorderQty: 20, lastOrder: "2026-03-28" },
  { id: 2, name: "Portland Cimento", unit: "ton", current: 45, reorderAt: 20, reorderQty: 100, lastOrder: "2026-04-01" },
  { id: 3, name: "HDPE Granul", unit: "ton", current: 3, reorderAt: 5, reorderQty: 10, lastOrder: "2026-03-15" },
  { id: 4, name: "Nervurlu Demir", unit: "ton", current: 28, reorderAt: 10, reorderQty: 50, lastOrder: "2026-03-20" },
];

export default function InventoryPage() {
  const toast = useToast();
  const [items, setItems] = useState(DEMO_INVENTORY);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", unit: "ton", current: "", reorderAt: "", reorderQty: "" });

  const handleAdd = () => {
    if (!newItem.name || !newItem.current) { toast("Urun adi ve mevcut stok zorunlu", "error"); return; }
    setItems([...items, { ...newItem, id: Date.now(), current: Number(newItem.current), reorderAt: Number(newItem.reorderAt) || 0, reorderQty: Number(newItem.reorderQty) || 0, lastOrder: "-" }]);
    setShowAdd(false);
    setNewItem({ name: "", unit: "ton", current: "", reorderAt: "", reorderQty: "" });
    toast("Urun eklendi", "success");
  };

  return (
    <div className="page-content">
      <SEO title="Stok Takip" description="Depo stok seviyelerinizi takip edin" />
      <div className="page-header" style={{ textAlign: "left" }}>
        <h1 className="page-title">{"\uD83D\uDCE6"} Stok Takip Paneli</h1>
        <p className="page-desc">Depo stok seviyelerinizi takip edin, otomatik yeniden siparis kurallari belirleyin</p>
      </div>

      <button onClick={() => setShowAdd(!showAdd)} className="btn-primary" style={{ marginBottom: 20 }}>+ Urun Ekle</button>

      {showAdd && (
        <div className="filters-panel" style={{ marginBottom: 20 }}>
          <div className="filter-group"><label className="filter-label">Urun Adi</label><input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="form-input" placeholder="Orn: HRP Sac" /></div>
          <div className="filter-group"><label className="filter-label">Mevcut Stok</label><input type="number" value={newItem.current} onChange={e => setNewItem({ ...newItem, current: e.target.value })} className="filter-input" /></div>
          <div className="filter-group"><label className="filter-label">Yeniden Siparis Seviyesi</label><input type="number" value={newItem.reorderAt} onChange={e => setNewItem({ ...newItem, reorderAt: e.target.value })} className="filter-input" /></div>
          <div className="filter-group"><label className="filter-label">Siparis Miktari</label><input type="number" value={newItem.reorderQty} onChange={e => setNewItem({ ...newItem, reorderQty: e.target.value })} className="filter-input" /></div>
          <div className="filter-group"><button onClick={handleAdd} className="btn-primary">Ekle</button></div>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Urun</th><th>Mevcut Stok</th><th>Yeniden Siparis</th><th>Siparis Miktari</th><th>Son Siparis</th><th>Durum</th></tr></thead>
          <tbody>
            {items.map(it => {
              const needsReorder = it.reorderAt > 0 && it.current <= it.reorderAt;
              return (
                <tr key={it.id} style={{ background: needsReorder ? "#B0423A08" : undefined }}>
                  <td className="admin-td-name">{it.name}</td>
                  <td style={{ fontWeight: 700 }}>{it.current} {it.unit}</td>
                  <td>{it.reorderAt > 0 ? `${it.reorderAt} ${it.unit}` : "-"}</td>
                  <td>{it.reorderQty > 0 ? `${it.reorderQty} ${it.unit}` : "-"}</td>
                  <td>{it.lastOrder}</td>
                  <td>
                    {needsReorder ? (
                      <button onClick={() => toast(`${it.reorderQty} ${it.unit} ${it.name} siparisi olusturuldu`, "success")} className="btn-sm" style={{ background: "var(--red)", fontSize: 11 }}>
                        {"\u26A0"} Siparis Ver
                      </button>
                    ) : (
                      <span className="stock-badge stock-in">Yeterli</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
