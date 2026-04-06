import { PRODUCTS } from "../data/products";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

export default function FavoritesPage({ admin, onOpenProduct, favs, toggleFav }) {
  const favProducts = PRODUCTS.filter(p => favs.includes(p.id));

  return (
    <div className="page-content">
      <SEO title="Favorilerim" description="Favori hammadde urunlerinizi goruntuleyin." />
      <div className="page-header">
        <h1 className="page-title">{"\u2665"} Favorilerim</h1>
        <p className="page-desc">{favProducts.length} urun favorilerinizde</p>
      </div>

      {favProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{"\u2661"}</div>
          <div className="empty-title">Henuz favori urun eklemediniz</div>
          <div className="empty-desc">
            <Link to="/" className="link-btn link-btn-bold">Urunlere goz at</Link>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {favProducts.map(p => (
            <ProductCard key={p.id} product={p} admin={admin} onOpen={onOpenProduct}
              isFav={true} onToggleFav={() => toggleFav(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
