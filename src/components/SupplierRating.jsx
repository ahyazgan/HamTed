import { SUPPLIER_RATINGS } from "../data/market";

function RatingBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label}</span>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar-value">{value.toFixed(1)}</span>
    </div>
  );
}

export default function SupplierRating({ supplier }) {
  const rating = SUPPLIER_RATINGS[supplier];
  if (!rating) return null;

  return (
    <div className="supplier-rating-card">
      <div className="supplier-rating-header">
        <h4 className="supplier-rating-name">{supplier}</h4>
        <div className="supplier-overall">
          <span className="supplier-overall-score">{"\u2605"} {rating.overall}</span>
          <span className="supplier-overall-count">{rating.orderCount} siparis</span>
        </div>
      </div>
      <RatingBar label="Teslimat" value={rating.delivery} />
      <RatingBar label="Kalite" value={rating.quality} />
      <RatingBar label="Fiyat" value={rating.price} />
      <div className="supplier-ontime">
        <span>Zamaninda teslimat orani</span>
        <span className="supplier-ontime-pct">%{rating.onTimeRate}</span>
      </div>
    </div>
  );
}
