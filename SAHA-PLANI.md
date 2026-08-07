# YÜKLET — Saha Planı (İlk Likidite)

> Amaç: TEK bölgede, elle, ilk gerçek tedarikçi + alıcı ağını kurmak.
> Schüttflix dersi: uygulama hazır; iş = ağ + operasyon. Yayılma yok, odak var.

## 1. Bölge seçimi

**Öneri: İzmir Kuzey aksı (Aliağa – Menemen – Bergama).**
Neden: kırma ocakları + demir-çelik/sanayi hafriyatı + liman dolgu işleri aynı
koridorda; seed verilerin zaten bu bölgeye göre kurulu, demo doğal durur.

Alternatifin varsa tek kritere göre seç: **ocak yoğunluğu + senin gidip
gelebileceğin mesafe.** Tanıdığının olduğu bölge her zaman öndedir.

## 2. Hedef sayılar (ilk 30 gün)

| Ne | Hedef | Neden |
|---|---|---|
| Ziyaret edilen ocak/santral | 15 | 10 vitrin çıkarmak için |
| Yayında vitrin (ürün ilanı girilmiş) | 10 | Alıcıya "boş uygulama" göstermemek |
| Kayıtlı nakliyeci | 10 | 2-3 aktif çıkar, yeter |
| İlk uçtan uca eşleşme (elle bile olsa) | 3 | Kanıt. Her şey bunun için |

## 3. Ocak ziyareti — oyun kitabı

**Gitmeden önce:** O ocağın vitrinini SEN kur (ad, malzeme, tahmini fiyat,
Google'dan/yerinde fotoğraf). Kapıya "uygulama indir" diye değil,
**"profiliniz hazır, bakın"** diye gidiyorsun.

**Kapıda söylenecek söz (30 saniye):**
> "İnşaatçıların malzeme + nakliyeyi tek fiyatla bulduğu bir uygulama
> yapıyorum. Sizin ocağı şimdiden ekledim — bakın böyle görünüyor.
> Fiyatları doğrulayalım, sipariş gelirse telefonunuza düşer.
> **Ücretsiz, komisyon yok.** Tek istediğim: fiyat güncel kalsın."

**Gösterilecek ekran sırası:**
1. "Malzeme Bul" → kendi vitrini (fiyat + **NAKLİYE DAHİL** rozeti)
2. Satıcı profili (mağaza görünümü)
3. Canlı takip ekranı ("kamyon nerede" — vay dedirten kısım)

**Kurucu üye teklifi:** İlk 10 tedarikçiye: "Öne çıkan ilan + ONAYLI rozeti
6 ay bedava, kurucu üyesiniz." (İleride paralı olacak kalemler — şimdi mıknatıs.)

**Ziyarette topla:** yetkili adı + cep, malzeme listesi + güncel ₺/ton,
nakliye dahil mi, hangi illere satıyor, çalıştığı nakliyeciler (→ sıradaki
nakliyeci adayların!).

## 4. Nakliyeci bağlama

Ocakların söylediği nakliyecilerden başla (sıcak referans). Söz:
> "X Ocağı'nın yükleri uygulamaya düşüyor. Boş dönüşte de güzergâhındaki
> yükleri gösteriyor (DÖNÜŞ sekmesi). Ücretsiz."

## 5. Alıcı bulma (talep tarafı)

- Bölgedeki 5-10 müteahhit / şantiye şefi — yine yüz yüze veya telefonla.
- İlk siparişlerde **sen köprü ol**: WhatsApp'la elle eşleştir, uygulamaya
  sonradan işle. Ölçeklenmeyen işler dönemi — normal ve doğru.

## 6. Yapma listesi

- ❌ İkinci il/bölge açma (ilk 3 eşleşme olmadan)
- ❌ Reklam harcaması
- ❌ Ücret/komisyon isteme — "Komisyon Yok" vaadi bozulmaz
- ❌ Yeni uygulama özelliği (saha bir şey isterse not al, haftada bir değerlendir)

## 7. Başarı ölçüsü

30 gün sonunda tek soru: **"Platformdan haberleşilmiş 3 gerçek sevkiyat
oldu mu?"** Olduysa → aynı bölgede derinleş. Olmadıysa → nedenini sahada
sor, ürünü değil önce bölgeyi/sözü değiştir.

---

## 8. Saha araçları (Yönetim Paneli) — 2026-07-29

Bu fazın işini hızlandırmak için panele eklenenler. Hepsi `/admin` altında.

| Sekme | Ne işe yarar |
|---|---|
| **Pano › Huni** | Kayıt → ilan → eşleşme dönüşümü. En büyük düşüş nerede ise saha turu oraya. Pano sayı verir, huni "nerede tıkanıyoruz"u verir. |
| **Eşleştir** | Açık bir iş ilanı seç → o kategoride/güzergâhta uygun nakliyeciler puanlı sırayla gelir (tür ✓ / bölge ✓ / son giriş), her satırda "Ara" düğmesi. Telefonla aracılık ettiğin turu hızlandırır. |
| **İlan › Kalite kuyruğu** | Fiyatı/açıklaması/miktarı/ilçesi eksik ya da sahibinin telefonu olmayan AKTİF ilanlar. "Sahibini ara" ile tek dokunuşta düzelttirilir. |
| **Duyuru › Hedefleme** | Duyuru artık **tüm cihazlara** gider (app_config). Rol ve/veya il seçilirse yalnız o üyeler görür; boş bırakılırsa herkese (ziyaretçi dahil). Kaydetmeden önce "kaç üyeye görünür" yazar. |
| **Üye › Segment + arama** | "7g girmedi / İlan açmadı / Eşleşmedi / Telefonsuz / Banlı" süzgeçleri + rol filtresi + ad/e-posta/telefon/il araması. Üye kartında **son giriş** görünür. |
| **Üye › Adına ilan ver** | Sahada "sen gir benim yerime" anı: `/ilan-ver?adina=<üyeId>` admin modu. Form hedef üyenin **rolüne** göre açılır, ilan **üyenin** olur (sahiplik, İlanlarım, düzenleme hep onda). Telefon/değerlendirme kapıları bu modda atlanır. |

---

## 9. Saha aday kaydı — "önce değer, sonra hesap" (2026-08-08)

§8'deki **Adına ilan ver** hedef üyenin **önceden kaydolmuş olmasını** şart koşuyordu
(`profiles.id → auth.users` FK). Oysa bu planın kendi kuralı bunun tersi: *"vitrin
taslağı ziyaretten ÖNCE hazırlanır"*. Aradaki boşluğu **Saha** sekmesi kapatır.

| Adım | Ne olur |
|---|---|
| **1. Aday firma ekle** | Panel › **Saha**. Firma adı, rol, il/ilçe, telefon (yayınlanmaz), tesis türü, saha notu. Hesap **açılmaz** — ayrı `prospects` tablosu. Aday daima TASLAK doğar. |
| **2. Vitrin ilanı** | `+ Vitrin ilanı` → `/ilan-ver?aday=<adayId>`. İlan **sahipsiz** doğar (`owner_id` null + `prospect_id`), taslak adayınki `kapali` durur. |
| **3. Rıza** | Ziyarette firma "evet" der → **Rıza alındı** (tarih + nasıl belgelendiği). Rıza olmadan **Yayınla** çalışmaz — kapı panelde değil, **veritabanı kısıtında** (`prospects_consent_chk`). |
| **4. Yayınla** | Vitrin panoya çıkar. İlanda firmanın numarası **değil**, `Saha hattı` görünür; kartta `SAHA KAYDI` rozeti; ilan **kabul edilemez** (`accept_job` sahipsiz ilanı reddediyor). Aracılığı sen yaparsın. |
| **5. Davet linki** | Değer görüldükten sonra `Davet linki` → WhatsApp. `/?firma=TOKEN` ile açılır; firma kendi hesabını açar (ad/rol ön-dolu, rol sorulmaz) ve `claim_prospect` **profili + tüm vitrin ilanlarını** o hesaba devreder. |

**Saha hattı numarası** Saha sekmesinin en üstünde girilir (`app_config.saha_hatti`).
Girilmezse vitrin ilanında iletişim **hiç görünmez** — sekme bunu kırmızı uyarır.

**Devir kapısı:** davet linki WhatsApp'ta dolaşabilir. Kendi ilanı olan ya da başka
bir firmayı zaten sahiplenmiş hesap devir **alamaz** — yalnız taze hesap sahiplenir.

### Çalıştırılacak SQL (canlı proje)

1. `supabase/migration-2026-07-saha-crm2.sql` — **ŞART.** `profiles.last_seen`
   + `touch_last_seen()`, `app_config` tablosu (duyuru), `listings_admin_insert`
   politikası (adına ilan). Bu koşmadan: son giriş boş görünür, duyuru yine
   yalnız kendi cihazında kalır, adına ilan RLS'e takılır.
2. `supabase/migration-2026-08-saha-aday.sql` — **ŞART (§9 için).** `prospects`
   tablosu + rıza kapısı, `listings.prospect_id`, `publish/unpublish_prospect`,
   `prospect_by_token`, `claim_prospect` ve `guard_driver_listing_update`'in
   **sahiplenme istisnası**. Bu koşmadan Saha sekmesi boş görünür ve davet linki
   çalışmaz. Dosyanın sonundaki kontrol sorgularını çalıştırıp doğrula.
3. `supabase/migration-2026-07-haftalik-ozet.sql` — **opsiyonel.** Pazartesi
   sabahı pano metriklerini mailine yollar (pg_cron + pg_net + Resend). Dosyanın
   sonundaki bloktan Resend anahtarını yazmadan mail gitmez.
