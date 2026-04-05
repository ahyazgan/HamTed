import { fmt } from "./format";

// Simple CSV export (no library needed)
export function exportToCSV(data, columns, filename = "export.csv") {
  const header = columns.map(c => c.label).join(";");
  const rows = data.map(row => columns.map(c => {
    const val = typeof c.getter === "function" ? c.getter(row) : row[c.key];
    return String(val ?? "").replace(/;/g, ",");
  }).join(";"));
  const csv = "\uFEFF" + [header, ...rows].join("\n"); // BOM for Turkish chars
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOrders(orders) {
  exportToCSV(orders, [
    { label: "Siparis No", key: "id" },
    { label: "Tarih", getter: o => new Date(o.date).toLocaleDateString("tr-TR") },
    { label: "Urun Sayisi", getter: o => o.items.length },
    { label: "Toplam (TL)", getter: o => fmt(o.total) },
    { label: "Durum", key: "status" },
  ], "siparisler.csv");
}

export function exportProducts(products) {
  exportToCSV(products, [
    { label: "Urun", key: "name" },
    { label: "Kategori", key: "cat" },
    { label: "Fiyat (TL)", getter: p => p.pt === "quote" ? "Teklif" : fmt(p.price) },
    { label: "Birim", key: "unit" },
    { label: "Min Siparis", key: "minQty" },
    { label: "Stok", key: "stock" },
    { label: "Tedarikci", key: "supplier" },
  ], "urunler.csv");
}

export function exportInventory(items) {
  exportToCSV(items, [
    { label: "Urun", key: "name" },
    { label: "Mevcut Stok", key: "current" },
    { label: "Birim", key: "unit" },
    { label: "Yeniden Siparis", key: "reorderAt" },
    { label: "Son Siparis", key: "lastOrder" },
  ], "stok.csv");
}
