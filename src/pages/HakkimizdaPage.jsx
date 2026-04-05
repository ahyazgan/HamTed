import { C } from "../utils/theme";

export default function HakkimizdaPage() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div className="section-badge" style={{ background: C.blueBg, borderColor: C.blue+"30", color: C.blue }}>
          Biz Kimiz?
        </div>
        <h1 className="page-title">Hakkimizda</h1>
      </div>

      <div className="about-grid">
        <div className="about-mission">
          <h2 className="section-title">Misyonumuz</h2>
          <p className="about-text">
            HamTed, Turkiye'deki KOBi'lerin hammadde tedarik surecini dijitallestirerek kolaylastirmayi hedefler.
            Geleneksel tedarik zincirindeki aracilari azaltarak, uretici ile aliciyi dogrudan bulusturuyoruz.
          </p>
          <p className="about-text">
            Seffaf fiyatlandirma, kalite garantisi ve hizli teslimat ile hammadde tedarikte yeni bir standart belirliyoruz.
          </p>

          <h2 className="section-title" style={{ marginTop: 32 }}>Vizyonumuz</h2>
          <p className="about-text">
            Turkiye'nin en buyuk dijital hammadde pazaryeri olarak, her olcekteki isletmenin
            kaliteli hammaddeye hizli ve uygun fiyatla ulasabilecegi bir ekosistem olusturmak.
          </p>
        </div>

        <div className="about-cards">
          {[
            ["\uD83C\uDFE2", "Istanbul merkezli", "Merkez ofisimiz Istanbul'da, lojistik agimiz Turkiye genelinde."],
            ["\uD83D\uDCC8", "Hizli buyume", "2024'ten bu yana 500+ firma ile calisiyoruz."],
            ["\uD83E\uDD1D", "Guvenilir ag", "50+ dogrulanmis tedarikci ile kaliteli urun garantisi."],
            ["\uD83D\uDD12", "Guvenli alisveris", "256-bit SSL, 3D Secure ve KVKK uyumlu altyapi."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="about-card">
              <div className="about-card-icon">{icon}</div>
              <div>
                <div className="about-card-title">{title}</div>
                <div className="about-card-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rakamlar */}
      <div style={{ marginTop: 48 }}>
        <h2 className="section-title" style={{ textAlign: "center" }}>Rakamlarla HamTed</h2>
        <div className="numbers-grid">
          {[
            ["500+", "Aktif Firma"],
            ["50+", "Tedarikci"],
            ["16+", "Urun Cesidi"],
            ["6", "Kategori"],
            ["81", "Il Teslimat"],
            ["%99.5", "Musteri Memnuniyeti"],
          ].map(([num, label]) => (
            <div key={label} className="number-card">
              <div className="number-value">{num}</div>
              <div className="number-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
