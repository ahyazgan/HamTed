import { useState } from "react";
import { NEWS } from "../data/market";
import { CATS } from "../data/categories";
import SEO from "../components/SEO";

export default function NewsPage() {
  const [catFilter, setCatFilter] = useState(null);
  const filtered = catFilter ? NEWS.filter(n => n.cat === catFilter) : NEWS;

  return (
    <div className="page-content">
      <SEO title="Sektor Haberleri" description="Hammadde sektorunden guncel haberler ve analizler" />
      <div className="page-header">
        <div className="section-badge" style={{ background: "var(--amber-bg)", borderColor: "var(--amber)", color: "var(--amber)" }}>Guncel</div>
        <h1 className="page-title">Sektor Haberleri</h1>
      </div>

      <div className="cat-row">
        <button onClick={() => setCatFilter(null)} className={`cat-btn ${!catFilter ? "cat-active" : ""}`}>Tumu</button>
        {CATS.map(c => <button key={c.id} onClick={() => setCatFilter(c.id)} className={`cat-btn ${catFilter === c.id ? "cat-active" : ""}`}>{c.icon} {c.name}</button>)}
      </div>

      <div className="news-list">
        {filtered.map(n => {
          const cat = CATS.find(c => c.id === n.cat);
          return (
            <article key={n.id} className="news-card">
              <div className="news-meta">
                <span className="news-cat">{cat?.icon || "\uD83D\uDCF0"} {cat?.name || "Genel"}</span>
                <span className="news-date">{new Date(n.date).toLocaleDateString("tr-TR")}</span>
              </div>
              <h3 className="news-title">{n.title}</h3>
              <p className="news-summary">{n.summary}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
