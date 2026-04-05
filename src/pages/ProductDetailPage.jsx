import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import { CATS } from "../data/categories";
import { getProductImage } from "../data/productImages";
import { fmt } from "../utils/format";
import { useToast } from "../components/Toast";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import PriceAlarm from "../components/PriceAlarm";
import SupplierRating from "../components/SupplierRating";
import SEO from "../components/SEO";

export default function ProductDetailPage({ admin, onAddCart, onOpenQuote, favs, toggleFav, compareIds, toggleCompare, t }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const product = PRODUCTS.find(p => p.id === Number(id));
  const [qty, setQty] = useState(product?.minQty || 1);

  if (!product) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{"\u2298"}</div>
          <div className="empty-title">Urun bulunamadi</div>
          <div className="empty-desc"><Link to="/" className="link-btn link-btn-bold">{t.order.backHome}</Link></div>
        </div>
      </div>
    );
  }

  const ct = CATS.find(c => c.id === product.cat);
  const isQ = product.pt === "quote";
  const isFav = favs.includes(product.id);
  const related = PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 3);

  const stockClass = product.stock <= 0 ? "stock-out" : product.stock <= 20 ? "stock-low" : "stock-in";
  const stockText = product.stock <= 0 ? t.product.outOfStock : product.stock <= 20 ? `${t.product.lowStock} (${product.stock})` : `${t.product.inStock} (${product.stock})`;

  const handleAdd = () => {
    if (product.stock <= 0) { toast("Bu urun stokta yok", "error"); return; }
    onAddCart(product, qty);
    toast(t.product.addToCart + ": " + product.name);
  };

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link to="/">Ana Sayfa</Link>
        <span className="breadcrumb-sep">/</span>
        <span>{ct?.name}</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <SEO title={product.name} description={`${product.name} - ${product.supplier}. ${product.desc}`} />

      <div className="detail-grid">
        <div className="detail-info">
          {/* Product Image */}
          <div className="detail-image" dangerouslySetInnerHTML={{ __html: getProductImage(product.cat) }} />
          <div className="detail-cat">{ct?.icon} {ct?.name}</div>
          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-supplier">{product.supplier}</div>

          <div className="product-indicators" style={{ marginBottom: 20 }}>
            <span className={`stock-badge ${stockClass}`}>{stockText}</span>
            <span className="product-rating">{"\u2605"} {product.rating} <span className="rating-count">({product.reviewCount} degerlendirme)</span></span>
          </div>

          <div className="detail-desc-box">
            <h3 className="detail-section-title">{t.product.specs}</h3>
            <p className="detail-desc">{product.desc}</p>
          </div>

          <div className="detail-specs">
            {[
              [t.product.deliveryTime, product.delivery],
              [t.product.minOrder, `${product.minQty} ${product.unit}`],
              [t.product.payment, t.product.cash],
              [t.product.unit, product.pt === "quote" ? "Teklif bazli" : `\u20BA${fmt(product.price)}/${product.unit}`],
              [t.compare.supplier, product.supplier],
              [t.product.stock, `${product.stock} ${product.unit}`],
            ].map(([l, v]) => (
              <div key={l} className="spec-row">
                <span className="spec-label">{l}</span>
                <span className="spec-value">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-action">
          <div className="detail-action-card">
            {isQ ? (
              <>
                <div className="quote-badge" style={{ marginBottom: 16 }}><span className="quote-text">Teklif Bazli Urun</span></div>
                <p style={{ fontSize: 13, color: "var(--text-sec)", lineHeight: 1.7, marginBottom: 20 }}>
                  Bu urunun fiyati piyasa kosullarina gore degismektedir. Guncel fiyat icin teklif talebinde bulunun.
                </p>
                <button onClick={() => onOpenQuote(product)} className="btn-primary btn-full btn-lg" style={{ background: "var(--blue)" }}>{t.product.requestQuote}</button>
              </>
            ) : (
              <>
                <div className="detail-price">{"\u20BA"}{fmt(product.price)}<span className="detail-price-unit">/ {product.unit}</span></div>
                {admin && <div className="admin-info" style={{ marginBottom: 16 }}>Alis: {"\u20BA"}{fmt(product.cost)} | Marj: %{Math.round(((product.price - product.cost) / product.cost) * 100)}</div>}
                <div style={{ marginBottom: 20 }}>
                  <label className="field-label">{t.product.quantity} ({product.unit})</label>
                  <div className="qty-row">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(product.minQty, q - product.minQty))}>{"\u2212"}</button>
                    <input type="number" className="qty-input" value={qty} onChange={e => setQty(Math.max(product.minQty, parseInt(e.target.value) || product.minQty))} />
                    <button className="qty-btn" onClick={() => setQty(q => q + product.minQty)}>+</button>
                    <span className="qty-unit">{product.unit}</span>
                  </div>
                </div>
                <div className="detail-total"><span>{t.product.total}:</span><span className="detail-total-price">{"\u20BA"}{fmt(product.price * qty)}</span></div>
                <button onClick={handleAdd} className="btn-primary btn-full btn-lg" style={{ marginTop: 16 }} disabled={product.stock <= 0}>{t.product.addToCart}</button>
              </>
            )}
            <button onClick={() => toggleFav(product.id)} className={`fav-detail-btn ${isFav ? "fav-detail-active" : ""}`}>
              {isFav ? "\u2665 Favorilerde" : "\u2661 Favorilere Ekle"}
            </button>
            <button onClick={() => toggleCompare(product.id)} className={`fav-detail-btn ${compareIds.includes(product.id) ? "fav-detail-active" : ""}`} style={{ color: compareIds.includes(product.id) ? "var(--blue)" : undefined }}>
              {"\u2194"} {compareIds.includes(product.id) ? "Karsilastirmada" : "Karsilastir"}
            </button>
            <PriceAlarm product={product} />
          </div>
        </div>
      </div>

      {/* Supplier Rating */}
      <div style={{ marginTop: 48 }}>
        <h2 className="section-title">Tedarikci Degerlendirmesi</h2>
        <SupplierRating supplier={product.supplier} />
      </div>

      {/* Lot / Batch Info */}
      <div style={{ marginTop: 32 }}>
        <h2 className="section-title">Parti / Lot Bilgisi</h2>
        <div className="detail-specs">
          <div className="spec-row"><span className="spec-label">Lot No</span><span className="spec-value">LOT-{product.id.toString().padStart(4,"0")}-{new Date().getFullYear()}</span></div>
          <div className="spec-row"><span className="spec-label">Uretim Tarihi</span><span className="spec-value">{new Date(Date.now() - 15*86400000).toLocaleDateString("tr-TR")}</span></div>
          <div className="spec-row"><span className="spec-label">Mense</span><span className="spec-value">Turkiye</span></div>
          <div className="spec-row"><span className="spec-label">Kalite Belgesi</span><span className="spec-value" style={{ color: "var(--green)" }}>{"\u2713"} TSE / ISO belgeli</span></div>
          <div className="spec-row"><span className="spec-label">Test Raporu</span><span className="spec-value" style={{ color: "var(--blue)" }}>{"\uD83D\uDCC4"} PDF Indir</span></div>
        </div>
      </div>

      {/* Reviews */}
      <div style={{ marginTop: 48 }}>
        <ReviewSection productId={product.id} t={t} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 className="section-title">{t.product.similar}</h2>
          <div className="product-grid">
            {related.map(p => (
              <ProductCard key={p.id} product={p} admin={admin}
                onOpen={() => navigate(`/urun/${p.id}`)}
                isFav={favs.includes(p.id)} onToggleFav={() => toggleFav(p.id)}
                isCompare={compareIds.includes(p.id)} onToggleCompare={() => toggleCompare(p.id)} t={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
