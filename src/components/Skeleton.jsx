export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-sm" style={{ width: "40%" }} />
      <div className="skeleton-line skeleton-lg" style={{ width: "80%" }} />
      <div className="skeleton-line skeleton-sm" style={{ width: "50%" }} />
      <div className="skeleton-line" style={{ width: "100%", height: 48 }} />
      <div className="skeleton-line skeleton-lg" style={{ width: "45%" }} />
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-sm" style={{ width: "60%" }} />
        <div className="skeleton-line" style={{ width: 80, height: 32, borderRadius: 8 }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
