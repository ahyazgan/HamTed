# YENİ iOS APP KAYDI — co.yuklet.app (2026-07)

## Neden gerekli?
İlk uygulama kaydı (`com.yuklet.app`, Apple ID 6787767256) gönderim sırasında
yanlışlıkla **"Private — Apple Business Manager (custom app)"** dağıtım
yöntemiyle onaylandı. Apple, onaydan sonra dağıtım yöntemini DEĞİŞTİRMİYOR
(Destek Case 20000119261158, cevap: "another app record would have to be
submitted"). Bundle ID bir kayda bağlandıktan sonra yeniden kullanılamadığı
için yeni kayıt **yeni bundle ID** ile açılır: **`co.yuklet.app`**.

Kod tarafı hazır (bu commit): Xcode projesi + codemagic.yaml + AASA
`co.yuklet.app`'e geçti. Android (`com.yuklet.app`) ve derin bağlantı URL
şeması DEĞİŞMEDİ.

## Senin yapacakların (sırayla)

### 1. Eski uygulamanın adını boşalt (App Store Connect)
- appstoreconnect.apple.com → Apps → **YÜKLET — Hafriyat & Silobas** (eski)
- App Information → Name: **YUKLET OLD** yap → Save.
- Eski kaydı SİLME; arşiv olarak dursun (ekran görüntüleri/metadata'yı
  kopyalamak için lazım olacak).

### 2. Yeni App ID (developer.apple.com)
- Certificates, Identifiers & Profiles → **Identifiers → (+)** → App IDs → App
- Description: `YUKLET2` · Bundle ID (Explicit): `co.yuklet.app`
- Capabilities: **Sign in with Apple** ✓ ve **Associated Domains** ✓ → Register.
  (İkisi de App.entitlements'ta var; işaretlenmezse Codemagic imzalama düşer.)

### 3. Yeni uygulama kaydı (App Store Connect)
- Apps → (+) → **New App**
- Platform: iOS · Name: **YÜKLET — Hafriyat & Silobas** (1. adımda boşalttın)
- Primary Language: Turkish · Bundle ID: **co.yuklet.app** · SKU: `yuklet2`

### 4. KRİTİK — dağıtım yöntemi PUBLIC kalsın
- Yeni kayıtta **Pricing and Availability → App Distribution Methods**:
  **Public — Discoverable by anyone on the App Store** seçili olmalı
  (varsayılan budur; Private'a DOKUNMA).
- Price: **Free (0)** · App Availability: tüm ülkeler seçili kalsın.

### 5. Metadata'yı eski kayıttan kopyala
- Ekran görüntüleri: eski kayıt → Media Manager'dan indir → yeni kayda yükle
  (bilgisayarında da mevcutsa direkt yükle).
- Description, Keywords, Subtitle, Support URL (yuklet.co), Privacy Policy URL.
- **App Privacy** anketi: eski kayıttaki cevapların aynısı.
- Age Rating anketi (yeni sosyal medya soruları dahil) yeniden doldurulur.
- App Review bilgileri: demo hesap + notlar (eskisinin aynısı).

### 6. Supabase — Apple girişi için yeni bundle ID
- Supabase Dashboard → Authentication → Providers → **Apple** →
  **Client IDs** alanı: `co.yuklet.app,com.yuklet.app` (ikisi birden, virgüllü).

### 7. Yeni build (Codemagic — ayar değişikliği GEREKMEZ)
- codemagic.yaml zaten `co.yuklet.app`'e geçti; `fetch-signing-files` yeni
  bundle için profili otomatik üretir.
- **ios-appstore** workflow'unu çalıştır → build yeni kayda (TestFlight'a) düşer.
  - Build eski kayda düşerse panik yok: yükleme bundle ID ile eşleşir,
    otomatik olarak co.yuklet.app kaydına gider.

### 8. Gönderim
- Yeni kayıtta sürüm **1.0.2** → build'i seç → Add for Review → Submit.
  (Kaynak kod 1.0.2'de: `package.json`, `MARKETING_VERSION`, `app-version.json`.
  Yeni kayıt olduğu için build numarası 1'den başlar, sorun değil.)

### 9. Onaydan SONRA — unutulursa uygulama içi güncelleme linki kırık kalır
- Yeni kaydın Apple ID'sini al (App Store Connect → App Information → Apple ID).
- `public/app-version.json` içindeki `iosUrl` şu an ESKİ, artık yayında olmayan
  kayda işaret ediyor (`id6787767256`). Yeni ID ile değiştir ve push et:
  `"iosUrl": "https://apps.apple.com/app/id<YENI_ID>"`
- Supabase → Authentication → URL Configuration: derin bağlantı/redirect
  listesinde bir şey değişmedi, kontrol yeter.
- Hesap silme, UGC şikayet/engel, konum izin metinleri vb. geçen incelemeden
  geçen kodun aynısı — hızlı onay beklenir (1-2 gün).

### 9. Onay SONRASI (Claude'a yaptır)
- Yeni App Store ID'yi (apps.apple.com linkindeki id...) bana ver:
  - `public/app-version.json` → `iosUrl` güncellenecek.
  - Deep link kurulacaksa AASA'daki `REPLACE_TEAMID` de o gün yazılır.

## Değişmeyenler
- Android paketi `com.yuklet.app` (Play tarafı bu sorundan bağımsız).
- Derin bağlantı/OAuth URL şeması `com.yuklet.app://` (şema ≠ bundle ID).
- Google iOS OAuth client zaten ertelenmişti; kurulacağı gün `co.yuklet.app`
  ile açılır (KURULUM-GIRIS.md güncellendi).
