import { useParams, Link } from "react-router-dom";
import SEO from "../components/SEO";

const LEGAL_PAGES = {
  "gizlilik": {
    title: "Gizlilik Politikasi",
    content: `HamTed Teknoloji A.S. ("HamTed") olarak, kullanicilarimizin gizliligine onem veriyoruz. Bu politika, kisisel verilerinizin nasil toplandigi, kullanildigi ve korundugu hakkinda bilgi vermektedir.

## 1. Toplanan Veriler

Platform uzerinden asagidaki kisisel veriler toplanabilir:

- **Kimlik Bilgileri:** Ad, soyad, firma unvani, vergi numarasi
- **Iletisim Bilgileri:** E-posta adresi, telefon numarasi, adres
- **Islem Bilgileri:** Siparis gecmisi, odeme bilgileri, teslimat adresleri
- **Teknik Veriler:** IP adresi, tarayici bilgisi, cerez verileri
- **Kullanim Verileri:** Platform icindeki etkilesimler, arama gecmisi

## 2. Verilerin Kullanim Amaci

Toplanan veriler asagidaki amaclarla kullanilir:

- Siparis ve teslimat sureclerinin yonetimi
- Musteri hesaplarinin olusturulmasi ve yonetimi
- Odeme islemlerinin gerceklestirilmesi
- Musteri hizmetleri ve destek saglanmasi
- Platform iyilestirme ve analiz calismalari
- Yasal yukumluluklerin yerine getirilmesi

## 3. Verilerin Paylasilmasi

Kisisel verileriniz, asagidaki durumlar disinda ucuncu taraflarla paylasilmaz:

- Siparis teslimatini gerceklestiren lojistik firmalari
- Odeme islemlerini yuruten finansal kuruluslar
- Yasal zorunluluklar gerektirdiginde yetkili kurumlar

## 4. Veri Guvenligi

- 256-bit SSL sifreleme ile veri iletimi
- PCI DSS uyumlu odeme altyapisi
- Duzenli guvenlik denetimleri
- Erisim kontrolu ve yetkilendirme mekanizmalari

## 5. Cerez Politikasi

Platform, kullanici deneyimini iyilestirmek icin cerezler kullanir:

- **Zorunlu Cerezler:** Platform isleyisi icin gerekli
- **Analitik Cerezler:** Kullanim istatistikleri (Google Analytics)
- **Tercih Cerezleri:** Dil, tema gibi kullanici tercihleri

## 6. Haklariniz

6698 sayili KVKK kapsaminda asagidaki haklara sahipsiniz:

- Kisisel verilerinizin islenip islenmedigini ogrenme
- Islenen veriler hakkinda bilgi talep etme
- Verilerin duzeltilmesini veya silinmesini isteme
- Islemenin kisitlanmasini talep etme
- Verilerin tasinabilirligini talep etme

Basvurulariniz icin: kvkk@hamted.com.tr

## 7. Iletisim

HamTed Teknoloji A.S.
Buyukdere Cad. No:123 Kat:5, Levent, Istanbul
E-posta: info@hamted.com.tr
Telefon: +90 (212) 555 00 00`
  },
  "kullanim-kosullari": {
    title: "Kullanim Kosullari",
    content: `Bu kullanim kosullari, HamTed platformunu kullanan tum kullanicilar icin gecerlidir. Platformu kullanarak bu kosullari kabul etmis sayilirsiniz.

## 1. Tanimlar

- **Platform:** hamted.com.tr web sitesi ve mobil uygulamasi
- **Kullanici:** Platformu kullanan gercek veya tuzel kisi
- **Tedarikci:** Platform uzerinden urun satan isletme
- **Alici:** Platform uzerinden urun satin alan isletme

## 2. Uyelik Kosullari

- Platform B2B (isletmeler arasi) ticaret icin tasarlanmistir
- Uyelik icin gecerli bir vergi numarasi veya ticaret sicil numarasi gereklidir
- 18 yasindan kucukler platform kullanamazlar
- Yanlis veya yaniltici bilgi vermek uyeligin iptaline yol acar

## 3. Siparis ve Odeme

- Listelenen fiyatlar KDV haric olup aksi belirtilmedikce TL cinsindendir
- Siparis onaylandiktan sonra fiyat degisikligi yapilmaz
- Odeme havale/EFT veya kredi karti ile yapilir
- Fatura, siparis tamamlandiktan sonra e-fatura olarak kesilir

## 4. Teslimat

- Teslimat suresi, urun ve teslimat yontemine gore degisir
- Teslimat adresi, siparis sirasinda belirtilen adrestir
- Teslimatta hasar veya eksiklik durumunda 24 saat icinde bildirim yapilmalidir

## 5. Iade ve Iptal

- Kalite uygunsuzlugu durumunda 7 is gunu icinde iade kabul edilir
- Iade icin urunun orijinal ambalajinda ve kullanilmamis olmasi gerekir
- Ozel uretim veya kisisellestirilmis urunlerde iade kabul edilmez
- Iade onaylanan urunlerin bedeli 5 is gunu icinde iade edilir

## 6. Sorumluluk Sinirlamasi

- Platform, tedarikci ile alici arasinda aracilik yapar
- Urun kalitesi ve teslimat tedarikci sorumlulugundadir
- Platform, ucuncu taraf sitelere verilen linklerin iceriginden sorumlu degildir
- Mucbir sebepler nedeniyle olusan gecikmelerden sorumluluk kabul edilmez

## 7. Fikri Mulkiyet

- Platform uzerindeki tum icerik, tasarim ve yazilim HamTed'e aittir
- Izinsiz kopyalama, dagitma veya degistirme yasaktir

## 8. Uyusmazlik Cozumu

- Bu kosullar Turkiye Cumhuriyeti kanunlarina tabidir
- Uyusmazliklarda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir`
  },
  "kvkk": {
    title: "KVKK Aydinlatma Metni",
    content: `6698 Sayili Kisisel Verilerin Korunmasi Kanunu ("KVKK") uyarinca, HamTed Teknoloji A.S. olarak veri sorumlusu sifatiyla sizleri bilgilendirmek isteriz.

## 1. Veri Sorumlusu

HamTed Teknoloji A.S.
Mersis No: 0123456789012345
Adres: Buyukdere Cad. No:123 Kat:5, Levent, Istanbul

## 2. Kisisel Verilerin Islenmesi

Kisisel verileriniz, KVKK'nin 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanilarak asagidaki amaclarla islenmektedir:

- Satis ve satin alma sureclerinin yurutulmesi
- Sozlesmeden kaynaklanan yukumluluklerin yerine getirilmesi
- Musteri iliskileri yonetimi
- Lojistik ve teslimat faaliyetlerinin yurutulmesi
- Finans ve muhasebe islemlerinin yurutulmesi
- Hukuki sureclerin takibi
- Bilgi guvenligi sureclerinin yurutulmesi

## 3. Kisisel Verilerin Aktarimi

Kisisel verileriniz, yukarida belirtilen amaclar dogrultusunda:

- Is ortaklari ve tedarikci firmalara
- Bankalara ve odeme kuruluslarina
- Kargo ve lojistik firmalarina
- Yasal zorunluluk halinde yetkili kamu kurumlarina

KVKK'nin 8. ve 9. maddelerinde belirtilen kosullara uygun olarak aktarilabilir.

## 4. Veri Toplama Yontemi ve Hukuki Sebebi

Kisisel verileriniz;
- Web sitesi uyelik formu
- Siparis formu
- Iletisim formu
- Cerezler ve otomatik yontemler

araciligiyla, sozlesmenin ifasi, yasal yukumluluk ve meşru menfaat hukuki sebeplerine dayanilarak toplanmaktadir.

## 5. Veri Sahibi Haklari (KVKK Madde 11)

KVKK'nin 11. maddesi uyarinca;

a) Kisisel verilerinizin islenip islenmedigini ogrenme
b) Islenmisse buna iliskin bilgi talep etme
c) Isleme amacini ve amacina uygun kullanilip kullanilmadigini ogrenme
d) Yurt icinde veya yurt disinda aktarildigi ucuncu kisileri bilme
e) Eksik veya yanlis islenmisse duzeltilmesini isteme
f) KVKK'nin 7. maddesinde ongoren kosullar cercevesinde silinmesini/yok edilmesini isteme
g) Duzeltme ve silme islemlerinin aktarildigi ucuncu kisilere bildirilmesini isteme
h) Islenen verilerin munhasiran otomatik sistemler vasitasiyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya cikmasina itiraz etme
i) Kanuna aykiri olarak islenmesi sebebiyle zarara ugramaniz halinde zararin giderilmesini talep etme

haklarina sahipsiniz.

## 6. Basvuru Yontemi

Haklarinizi kullanmak icin:
- E-posta: kvkk@hamted.com.tr
- Posta: Buyukdere Cad. No:123 Kat:5, Levent, Istanbul
- KEP: hamted@hs01.kep.tr

Basvurular en gec 30 gun icinde sonuclandirilir.`
  },
  "mesafeli-satis": {
    title: "Mesafeli Satis Sozlesmesi",
    content: `## 1. Taraflar

**SATICI:**
HamTed Teknoloji A.S.
Adres: Buyukdere Cad. No:123 Kat:5, Levent, Istanbul
Telefon: +90 (212) 555 00 00
E-posta: info@hamted.com.tr

**ALICI:**
Siparis sirasinda belirtilen bilgiler gecerlidir.

## 2. Sozlesme Konusu

Isbu sozlesme, alicinin platform uzerinden elektronik ortamda siparis verdigi urunlerin satisi ve teslimatina iliskin taraflarin hak ve yukumluluklerini duzenler.

## 3. Urun Bilgileri

Urunlerin temel ozellikleri, fiyati ve odeme bilgileri siparis ozeti sayfasinda belirtilmistir. Urun fiyatlarina KDV dahil degildir.

## 4. Genel Hukumler

- Alici, siparis onayindan once urun ozelliklerini ve fiyatini incelemis ve onaylamistir
- Siparis onaylanana kadar fiyat degisikligi hakki saklidir
- Siparis sonrasi fiyat degisikligi yapilmaz

## 5. Teslimat

- Teslimat, siparis onayindan itibaren en gec 30 is gunu icinde yapilir
- Teslimat suresi, urun ve teslimat yontemine gore degisir
- Teslimat masraflari aliciya aittir (aksi belirtilmedikce)
- Teslimat, belirtilen adrese yapilir

## 6. Cayma Hakki

6502 sayili Tuketicinin Korunmasi Hakkinda Kanun uyarinca:
- B2B islemler cayma hakki kapsaminda degildir
- Ancak platform politikasi geregi, kalite uygunsuzlugu durumunda 7 is gunu icinde iade kabul edilir
- Ozel uretim urunlerde iade kabul edilmez

## 7. Temerrut ve Hukuki Sonuclari

Alicinin odeme yukumlululerini yerine getirmemesi halinde, satici siparisin iptaline karar verebilir. Gecikme faizi yasal oranlar uzerinden uygulanir.

## 8. Yetkili Mahkeme

Uyusmazliklarda Istanbul Mahkemeleri ve Icra Daireleri yetkilidir.

## 9. Yururluk

Bu sozlesme, siparisin onaylanmasi ile yururluge girer. Alici, siparis onayinda bu sozlesmeyi okumus ve kabul etmis sayilir.`
  }
};

export default function LegalPage() {
  const { slug } = useParams();
  const page = LEGAL_PAGES[slug];

  if (!page) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{"\uD83D\uDCDC"}</div>
          <div className="empty-title">Sayfa bulunamadi</div>
          <div className="empty-desc"><Link to="/" className="link-btn link-btn-bold">Ana sayfaya don</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <SEO title={page.title} description={page.title + " - HamTed Teknoloji A.S."} />
      <div className="legal-page">
        <h1 className="page-title" style={{ textAlign: "left", marginBottom: 8 }}>{page.title}</h1>
        <div className="legal-meta">Son guncelleme: 1 Ocak 2026 · HamTed Teknoloji A.S.</div>
        <div className="legal-content">
          {page.content.split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="legal-h2">{line.replace("## ", "")}</h2>;
            if (line.startsWith("- **")) {
              const parts = line.replace("- **", "").split(":**");
              return <div key={i} className="legal-item"><strong>{parts[0]}:</strong>{parts[1]}</div>;
            }
            if (line.startsWith("- ")) return <div key={i} className="legal-item">{line.replace("- ", "\u2022 ")}</div>;
            if (line.trim() === "") return <br key={i} />;
            return <p key={i} className="legal-p">{line}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
