import { useParams, Link } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import { SUPPLIER_RATINGS } from "../data/market";
import { fmt } from "../utils/format";
import SupplierRating from "../components/SupplierRating";
import SEO from "../components/SEO";

export default function SupplierProfilePage() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const rating = SUPPLIER_RATINGS[decodedName];
  const products = PRODUCTS.filter(p => p.supplier === decodedName);

  if (!rating) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{"\uD83C\uDFE2"}</div>
          <div className="empty-title">Tedarikci bulunamadi</div>
          <div className="empty-desc"><Link to="/" className="link-btn link-btn-bold">Ana sayfaya don</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <SEO title={decodedName} description={`${decodedName} tedarikci profili - ${products.length} urun`} />

      <div className="breadcrumb">
        <Link to="/">Ana Sayfa</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{decodedName}</span>
      </div>

      <div className="supplier-profile-header">
        <div className="supplier-avatar">{decodedName.charAt(0)}</div>
        <div>
          <h1 className="page-title" style={{ textAlign: "left", marginBottom: 4 }}>{decodedName}</h1>
          <div className="supplier-profile-meta">
            <span>{"\u2605"} {rating.overall}</span>
            <span>·</span>
            <span>{rating.orderCount} siparis</span>
            <span>·</span>
            <span>%{rating.onTimeRate} zamaninda teslimat</span>
            <span>·</span>
            <span>{products.length} urun</span>
          </div>
        </div>
      </div>

      <div className="detail-grid" style={{ marginTop: 32 }}>
        <div>
          <h2 className="section-title">Urunler</h2>
          {products.map(p => (
            <Link key={p.id} to={`/urun/${p.id}`} className="supplier-product-item">
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-ter)" }}>{p.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {p.pt === "quote" ? (
                  <span className="stock-badge" style={{ background: "var(--blue-bg)", color: "var(--blue)" }}>Teklif</span>
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)" }}>{"\u20BA"}{fmt(p.price)}<span style={{ fontSize: 11, color: "var(--text-ter)" }}>/{p.unit}</span></span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="section-title">Degerlendirme</h2>
          <SupplierRating supplier={decodedName} />

          <div className="form-card" style={{ marginTop: 20 }}>
            <h3 className="form-card-title">Tedarikci Bilgileri</h3>
            <div className="detail-specs">
              <div className="spec-row"><span className="spec-label">Konum</span><span className="spec-value">Turkiye</span></div>
              <div className="spec-row"><span className="spec-label">Uye</span><span className="spec-value">2024</span></div>
              <div className="spec-row"><span className="spec-label">Sertifikalar</span><span className="spec-value" style={{ color: "var(--green)" }}>{"\u2713"} TSE · ISO 9001</span></div>
              <div className="spec-row"><span className="spec-label">Min Siparis</span><span className="spec-value">{Math.min(...products.map(p => p.minQty))} ton</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
