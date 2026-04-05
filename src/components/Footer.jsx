import { Link } from "react-router-dom";
import { C } from "../utils/theme";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <div className="logo-icon logo-icon-sm">H</div>
              <span className="logo-text" style={{ fontSize: 16 }}>HamTed</span>
            </div>
            <div className="footer-desc">Turkiye'nin B2B hammadde tedarik platformu. KOBi'lere toptan fiyatla, guvenli ve hizli tedarik.</div>
          </div>
          <div>
            <div className="footer-title">Platform</div>
            <Link to="/" className="footer-link">Urun Katalogu</Link>
            <Link to="/nasil-calisir" className="footer-link">Nasil Calisir</Link>
            <Link to="/tedarikci" className="footer-link">Tedarikci Ol</Link>
            <Link to="/piyasa" className="footer-link">Canli Piyasa</Link>
            <Link to="/talep-tahtasi" className="footer-link">Talep Tahtasi</Link>
          </div>
          <div>
            <div className="footer-title">Kaynaklar</div>
            <Link to="/ansiklopedi" className="footer-link">Ansiklopedi</Link>
            <Link to="/haberler" className="footer-link">Haberler</Link>
            <Link to="/sezonsal" className="footer-link">Sezonsal Analiz</Link>
            <Link to="/blog" className="footer-link">Blog</Link>
          </div>
          <div>
            <div className="footer-title">Sirket</div>
            <Link to="/hakkimizda" className="footer-link">Hakkimizda</Link>
            <Link to="/iletisim" className="footer-link">Iletisim</Link>
            <Link to="/rapor" className="footer-link">Satin Alma Raporu</Link>
          </div>
          <div>
            <div className="footer-title">Yasal</div>
            {["Gizlilik Politikasi", "Kullanim Kosullari", "KVKK Aydinlatma", "Mesafeli Satis Sozlesmesi"].map(t => (
              <div key={t} className="footer-link">{t}</div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <div>&copy; 2026 HamTed Teknoloji A.S. — Tum haklari saklidir.</div>
          <div>ETBIS kayitli · KEP: hamted@hs01.kep.tr</div>
        </div>
      </div>
    </footer>
  );
}
