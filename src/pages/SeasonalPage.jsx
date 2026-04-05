import { SEASONAL_DATA } from "../data/market";
import SEO from "../components/SEO";

const LEVEL_STYLE = {
  dusuk: { bg: "var(--green-bg)", color: "var(--green)", label: "Dusuk" },
  dusme: { bg: "var(--green-bg)", color: "var(--green)", label: "\u2193 Dusme" },
  normal: { bg: "var(--bg)", color: "var(--text-sec)", label: "Normal" },
  yukselis: { bg: "var(--amber-bg)", color: "var(--amber)", label: "\u2191 Yukselis" },
  yuksek: { bg: "#B0423A12", color: "var(--red)", label: "Yuksek" },
};

function LevelBadge({ level }) {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.normal;
  return <span className="stock-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function SeasonalPage() {
  const currentMonth = new Date().getMonth();

  return (
    <div className="page-content">
      <SEO title="Sezonsal Analiz" description="Hammadde fiyat sezonsal analiz takvimi" />
      <div className="page-header">
        <div className="section-badge" style={{ background: "var(--green-bg)", borderColor: "var(--green)", color: "var(--green)" }}>Takvim</div>
        <h1 className="page-title">Sezonsal Fiyat Analizi</h1>
        <p className="page-desc">Hangi donemde hangi hammadde uygun fiyatli?</p>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Ay</th><th>{"\u2699\uFE0F"} Celik</th><th>{"\uD83C\uDFD7\uFE0F"} Cimento</th><th>{"\uD83E\uDDEA"} Kimyasal</th><th>{"\u26A1"} Enerji</th><th>Not</th></tr>
          </thead>
          <tbody>
            {SEASONAL_DATA.map((s, i) => (
              <tr key={s.month} style={{ background: i === currentMonth ? "var(--accent-bg)" : undefined, fontWeight: i === currentMonth ? 700 : 400 }}>
                <td className="admin-td-name">{s.month} {i === currentMonth && "\u25C0"}</td>
                <td><LevelBadge level={s.celik} /></td>
                <td><LevelBadge level={s.cimento} /></td>
                <td><LevelBadge level={s.kimyasal} /></td>
                <td><LevelBadge level={s.enerji} /></td>
                <td style={{ fontSize: 12, color: "var(--text-sec)", maxWidth: 280 }}>{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="seasonal-legend">
        <h3 className="section-title" style={{ marginTop: 32 }}>Renk Kodlari</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {Object.entries(LEVEL_STYLE).map(([key, s]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span className="stock-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
              <span style={{ color: "var(--text-ter)" }}>= {key === "dusuk" ? "Alim icin uygun" : key === "yuksek" ? "Fiyatlar yuksek" : key === "yukselis" ? "Fiyatlar artmakta" : key === "dusme" ? "Fiyatlar dusmekte" : "Normal seviye"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
