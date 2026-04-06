import { C } from "../utils/theme";
import SEO from "../components/SEO";

const STEPS = [
  { num: "1", title: "Urun Secin", desc: "Katalogdan ihtiyaciniz olan hammaddeyi secin veya teklif isteyin.", clr: C.accent },
  { num: "2", title: "Miktar Belirleyin", desc: "Ihtiyaciniza uygun miktari girin. Minimum siparis miktarlarimiz uygundur.", clr: C.blue },
  { num: "3", title: "Siparis Verin", desc: "Guvenli odeme ile siparisini tamamlayin. Kredi karti veya havale/EFT.", clr: C.green },
  { num: "4", title: "Teslimat Alin", desc: "Sectiginiz teslimat yontemi ile hammaddeniz kapiniza gelsin.", clr: C.amber },
];

export default function NasilCalisirPage() {
  return (
    <div className="page-content">
      <SEO title="Nasil Calisir" description="HamTed nasil calisir? 4 adimda toptan hammadde tedarikinizi tamamlayin." />
      <div className="page-header">
        <div className="section-badge" style={{ background: C.accentBg, borderColor: C.accentBorder, color: C.accent }}>
          Adim Adim
        </div>
        <h1 className="page-title">Nasil Calisir?</h1>
        <p className="page-desc">4 basit adimda toptan hammadde tedarik edin.</p>
      </div>

      <div className="steps-grid">
        {STEPS.map(s => (
          <div key={s.num} className="step-card">
            <div className="step-num" style={{ background: s.clr + "12", borderColor: s.clr + "30", color: s.clr }}>{s.num}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* SSS */}
      <div style={{ marginTop: 48 }}>
        <h2 className="section-title">Sikca Sorulan Sorular</h2>
        <div className="faq-list">
          {[
            ["Minimum siparis miktari ne kadar?", "Her urunun minimum siparis miktari urun detay sayfasinda belirtilmistir. Genellikle 1-25 ton araligindadir."],
            ["Teslimat suresi ne kadar?", "Standart teslimat 5-7 is gunu, hizli teslimat 2-3 is gunudur. Fabrikadan teslim secenegi de mevcuttur."],
            ["Odeme yontemleri nelerdir?", "Kredi karti, havale/EFT ile odeme yapabilirsiniz. Vadeli odeme secenegi yakinda eklenecektir."],
            ["Iade ve degisim politikaniz nedir?", "Kalite uygunsuzlugu durumunda 7 is gunu icinde iade veya degisim yapilir. Detaylar icin mesafeli satis sozlesmesini inceleyiniz."],
            ["Fatura kesiyor musunuz?", "Evet, tum siparisler icin e-fatura kesilmektedir. Kurumsal fatura bilgilerinizi siparis sirasinda girebilirsiniz."],
          ].map(([q, a]) => (
            <div key={q} className="faq-item">
              <div className="faq-question">{q}</div>
              <div className="faq-answer">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
