import { PRODUCTS } from "../data/products";
import { CATS } from "../data/categories";
import { fmt } from "../utils/format";
import { Link } from "react-router-dom";

function StarRating({ val }) {
  return <span style={{ color: "var(--amber)", fontSize: 14 }}>{"★".repeat(Math.round(val))}{"☆".repeat(5 - Math.round(val))} <span style={{ color: "var(--text-sec)", fontSize: 12 }}>{val}</span></span>;
}

function StockBadge({ stock }) {
  if (stock <= 0) return <span className="stock-badge stock-out">Stok Yok</span>;
  if (stock <= 20) return <span className="stock-badge stock-low">Az Kaldi ({stock})</span>;
  return <span className="stock-badge stock-in">Stokta ({stock})</span>;
}

export default function ComparePage({ compareIds, removeCompare, t }) {
  const items = compareIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">{t.compare.title}</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">{"\u2194"}</div>
          <div className="empty-title">{t.compare.empty}</div>
          <div className="empty-desc"><Link to="/" className="link-btn link-btn-bold">Urunlere goz at</Link></div>
        </div>
      </div>
    );
  }

  const rows = [
    [t.compare.price, items.map(p => p.pt === "quote" ? "Teklif" : `\u20BA${fmt(p.price)}/${p.unit}`)],
    [t.compare.supplier, items.map(p => p.supplier)],
    [t.compare.delivery, items.map(p => p.delivery)],
    [t.compare.minOrder, items.map(p => `${p.minQty} ${p.unit}`)],
    [t.compare.rating, items.map(p => p.rating)],
    [t.product.stock, items.map(p => p.stock)],
    ["Aciklama", items.map(p => p.desc)],
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{t.compare.title}</h1>
        <p className="page-desc">{items.length} urun karsilastiriliyor</p>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th></th>
              {items.map(p => (
                <th key={p.id}>
                  <div className="compare-product-head">
                    <div className="product-cat">{CATS.find(c => c.id === p.cat)?.icon} {CATS.find(c => c.id === p.cat)?.name}</div>
                    <Link to={`/urun/${p.id}`} className="compare-product-name">{p.name}</Link>
                    <button onClick={() => removeCompare(p.id)} className="compare-remove">{t.compare.remove} {"\u2715"}</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, vals], i) => (
              <tr key={label}>
                <td className="compare-label">{label}</td>
                {vals.map((v, j) => (
                  <td key={j} className="compare-value">
                    {label === t.compare.rating ? <StarRating val={v} /> :
                     label === t.product.stock ? <StockBadge stock={v} /> : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
