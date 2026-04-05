import { Link } from "react-router-dom";
import { CATS } from "../data/categories";
import { fmt } from "../utils/format";

function StockIndicator({ stock }) {
  if (stock <= 0) return <span className="stock-badge stock-out">Stok Yok</span>;
  if (stock <= 20) return <span className="stock-badge stock-low">Az Kaldi</span>;
  return <span className="stock-badge stock-in">Stokta</span>;
}

export default function ProductCard({ product, admin, onOpen, isFav, onToggleFav, isCompare, onToggleCompare, t }) {
  const ct = CATS.find(c => c.id === product.cat);
  const isQ = product.pt === "quote";

  return (
    <div className="product-card" onClick={() => onOpen(product)}>
      {product.promo && <div className="promo-badge">{t?.product?.featured || "One Cikan"}</div>}

      <div className="card-actions">
        <button className={`fav-btn ${isFav ? "fav-active" : ""}`}
          onClick={e => { e.stopPropagation(); onToggleFav?.(); }}
          aria-label="Favori">{isFav ? "\u2665" : "\u2661"}</button>
        {onToggleCompare && (
          <button className={`fav-btn ${isCompare ? "fav-active" : ""}`}
            onClick={e => { e.stopPropagation(); onToggleCompare(); }}
            aria-label="Karsilastir" style={{ color: isCompare ? "var(--blue)" : undefined, borderColor: isCompare ? "var(--blue)" : undefined }}>
            {"\u2194"}
          </button>
        )}
      </div>

      <div className="product-cat">{ct?.icon} {ct?.name}</div>
      <div className="product-name" style={{ paddingRight: 70 }}>{product.name}</div>
      <div className="product-supplier">{product.supplier}</div>

      {/* Stock + Rating */}
      <div className="product-indicators">
        <StockIndicator stock={product.stock} />
        <span className="product-rating">{"\u2605"} {product.rating} <span className="rating-count">({product.reviewCount})</span></span>
      </div>

      <div className="product-desc">{product.desc}</div>

      {isQ ? (
        <div className="quote-badge">
          <span className="quote-text">{t?.product?.requestQuote || "Teklif Iste"}</span>
          <span className="quote-sub">{t?.product?.forCurrentPrice || "Guncel fiyat icin"}</span>
        </div>
      ) : (
        <div className="product-price">
          {"\u20BA"}{fmt(product.price)} <span className="product-unit">/ {product.unit}</span>
        </div>
      )}

      {admin && (
        <div className="admin-info">
          Alis: {"\u20BA"}{fmt(product.cost)} {"\u2192"} Marj: {"\u20BA"}{fmt(product.price - product.cost)}/{product.unit} ({Math.round(((product.price - product.cost) / product.cost) * 100)}%)
        </div>
      )}

      <div className="product-footer">
        <span className="product-meta">Min {product.minQty} {product.unit} · {product.delivery}</span>
        <Link to={`/urun/${product.id}`} onClick={e => e.stopPropagation()} className="btn-sm btn-outline">
          {t?.product?.detail || "Detay"}
        </Link>
        <button onClick={e => { e.stopPropagation(); onOpen(product); }}
          className="btn-sm" style={{ background: isQ ? "var(--blue)" : "var(--accent)" }}>
          {isQ ? (t?.product?.requestQuote || "Teklif Iste") : (t?.product?.addToCart || "Sepete Ekle")}
        </button>
      </div>
    </div>
  );
}
