import { useState } from "react";
import { CATS } from "../data/categories";
import SEO from "../components/SEO";

const BLOG_POSTS = [
  { id: 1, title: "Celik Sektorunde 2026 Trendleri", cat: "celik", date: "2026-04-01", readTime: "5 dk", image: "\u2699\uFE0F",
    content: "2026 yilinda celik sektorunde onemli gelismeler bekleniyor. Cin'in uretim politikalari, AB karbon sinir duzenlemesi ve Turkiye'nin artan altyapi yatirimlari fiyatlari dogrudan etkiliyor.\n\nSektorun gelecegine yonelik beklentiler:\n- Yesil celik uretimi artacak\n- Hurda celik talebi yukselecek\n- Dijital tedarik zincirleri yayginlasacak" },
  { id: 2, title: "KOBi'ler Icin Hammadde Tedarik Rehberi", cat: "genel", date: "2026-03-25", readTime: "8 dk", image: "\uD83D\uDCDA",
    content: "Kucuk ve orta olcekli isletmeler icin hammadde tedariki kritik bir surectir. Dogru tedarikci secimi, fiyat takibi ve stok yonetimi isletmenizin karliligini dogrudan etkiler.\n\nTemel adimlar:\n1. Ihtiyac analizi yapin\n2. Birden fazla tedarikci ile calismain\n3. Hacim indirimlerinden faydalanin\n4. Sezonsal fiyat hareketlerini takip edin\n5. Dijital platformlari kullanin" },
  { id: 3, title: "Polimer Fiyatlarini Etkileyen Faktorler", cat: "kimyasal", date: "2026-03-18", readTime: "6 dk", image: "\uD83E\uDDEA",
    content: "Polimer fiyatlari petrol fiyatlari, arz-talep dengesi ve kuresel lojistik maliyetlerinden dogrudan etkilenir.\n\nFiyatlari belirleyen ana faktorler:\n- Ham petrol fiyati (ana hammadde)\n- Cin ve Hindistan uretim kapasiteleri\n- Avrupa talep degisiklikleri\n- Deniz tasimaciligi maliyetleri\n- Mevsimsel talep dalgalanmalari" },
  { id: 4, title: "Insaat Sezonu ve Cimento Fiyatlari", cat: "cimento", date: "2026-03-10", readTime: "4 dk", image: "\uD83C\uDFD7\uFE0F",
    content: "Her yil mart-kasim arasi insaat sezonu cimento talebini ve fiyatlarini yukari ceker. Bu donemi iyi planlayan firmalar onemli tasarruf saglayabilir.\n\nOneriler:\n- Kis aylarinda stok yapin\n- Cerceve anlasmalari ile fiyat sabitleyin\n- Alternatif tedarikci listesi olusturun" },
  { id: 5, title: "Hammadde Depolamada Dikkat Edilecekler", cat: "genel", date: "2026-03-05", readTime: "5 dk", image: "\uD83D\uDCE6",
    content: "Yanlis depolama kosullari hammadde kayiplarina yol acabilir. Celik paslanir, cimento nem alir, kimyasallar bozulabilir.\n\nTemel kurallar:\n- Celik: Kapali, kuru, havalandirilmis ortam\n- Cimento: Palet uzerinde, nemden uzak\n- Kimyasallar: MSDS'e uygun sicaklik ve nem\n- Gida hammaddesi: HACCP uyumlu depo" },
];

export default function BlogPage() {
  const [selected, setSelected] = useState(null);
  const [catFilter, setCatFilter] = useState(null);

  const filtered = catFilter ? BLOG_POSTS.filter(p => p.cat === catFilter) : BLOG_POSTS;
  const post = BLOG_POSTS.find(p => p.id === selected);

  if (post) {
    return (
      <div className="page-content">
        <SEO title={post.title} description={post.content.slice(0, 150)} />
        <button onClick={() => setSelected(null)} className="link-btn" style={{ marginBottom: 16 }}>{"\u2190"} Tum Yazilar</button>
        <article className="blog-article">
          <div className="news-meta">
            <span className="news-cat">{post.image} {CATS.find(c => c.id === post.cat)?.name || "Genel"}</span>
            <span className="news-date">{new Date(post.date).toLocaleDateString("tr-TR")}</span>
            <span className="news-date">{post.readTime} okuma</span>
          </div>
          <h1 className="blog-title">{post.title}</h1>
          <div className="blog-content">{post.content.split("\n").map((line, i) => <p key={i}>{line}</p>)}</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-content">
      <SEO title="Blog" description="Hammadde sektoru hakkinda yazilar ve rehberler" />
      <div className="page-header">
        <div className="section-badge" style={{ background: "var(--accent-bg)", borderColor: "var(--accent-border)", color: "var(--accent)" }}>Blog</div>
        <h1 className="page-title">Yazilar & Rehberler</h1>
        <p className="page-desc">Hammadde sektoru hakkinda bilgi ve tavsiyeler</p>
      </div>

      <div className="cat-row">
        <button onClick={() => setCatFilter(null)} className={`cat-btn ${!catFilter ? "cat-active" : ""}`}>Tumu</button>
        {CATS.map(c => <button key={c.id} onClick={() => setCatFilter(c.id)} className={`cat-btn ${catFilter === c.id ? "cat-active" : ""}`}>{c.icon} {c.name}</button>)}
      </div>

      <div className="blog-grid">
        {filtered.map(p => (
          <div key={p.id} className="blog-card" onClick={() => setSelected(p.id)}>
            <div className="blog-card-icon">{p.image}</div>
            <div className="news-meta"><span className="news-date">{new Date(p.date).toLocaleDateString("tr-TR")}</span><span className="news-date">{p.readTime}</span></div>
            <h3 className="news-title" style={{ fontSize: 15 }}>{p.title}</h3>
            <p className="news-summary">{p.content.slice(0, 120)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
