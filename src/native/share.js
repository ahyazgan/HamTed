// ╔══════════════════════════════════════════════════════════════════╗
// ║  Paylaşım — native (iOS/Android) gerçek paylaşım sayfası,           ║
// ║  web'de Web Share API, ikisi de yoksa panoya kopyala.              ║
// ║  Android WebView navigator.share desteklemez; native plugin şart.  ║
// ╚══════════════════════════════════════════════════════════════════╝

import { Capacitor } from "@capacitor/core";
import { fmtTL } from "../utils/payments";

// Paylaşılan/açık web adresinin kök adresi. Native kabukta window.location.origin
// "https://localhost" (Android) / "capacitor://localhost" (iOS) olur — bu adres
// başka cihazda AÇILMAZ. Bu yüzden native'de sabit public domain kullan.
const PUBLIC_BASE = "https://yuklet.co";
export function publicBase() {
  if (Capacitor.isNativePlatform()) return PUBLIC_BASE;
  if (typeof window !== "undefined" && /^https?:$/.test(window.location.protocol)) {
    return window.location.origin;
  }
  return PUBLIC_BASE;
}
// Bir ilanın paylaşılabilir public linki.
export function listingShareUrl(id) {
  return `${publicBase()}/ilan/${id}`;
}
// Davet linki: /?davet=KOD ile açılır, App.jsx kodu saklar, giriş sonrası sahiplenir.
export function inviteShareUrl(code) {
  return `${publicBase()}/?davet=${encodeURIComponent(code)}`;
}

// ── WhatsApp'a hazır ilan metni ─────────────────────────────────────
// Sahanın tamamı WhatsApp gruplarında dönüyor; oraya yapıştırılan şey
// çıplak bir link değil, TEK BAKIŞTA OKUNAN bir ilan kartı olmalı.
// Kısa tut: damperci telefonda 4-6 satır okur.
const FREQ_TXT = { gunluk: "Her gün", haftalik: "Her hafta", aylik: "Her ay" };

export function listingShareText(l) {
  if (!l) return "";
  const url = listingShareUrl(l.id);
  const rows = [];
  const yer = [l.il, l.ilce].filter(Boolean).join(", ");
  const yuk = [l.amount ? `${l.amount} ${l.unit || "ton"}` : "", l.material].filter(Boolean).join(" ");
  const fiyat = Number(l.price) > 0
    ? fmtTL(l.price) + (l.type === "urun" && l.priceUnit ? `/${l.priceUnit}` : "")
    : "Fiyat: teklif usulü";

  if (l.type === "urun") {
    rows.push(`📦 ${l.title || yuk || "Malzeme"}`);
    if (yuk) rows.push(yuk);
    rows.push([yer, fiyat].filter(Boolean).join(" · "));
    if (l.deliveryIncluded) rows.push("✅ Nakliye dahil");
  } else if (l.type === "arac") {
    rows.push(`🚚 ${l.title || l.vehicle || "Araç"}`);
    rows.push([l.vehicle, l.capacity].filter(Boolean).join(" · "));
    rows.push([yer, fiyat].filter(Boolean).join(" · "));
  } else {
    // İş ilanı — asıl gruba atılan şey bu: güzergâh + yük + fiyat.
    const rota = l.varisIl && l.varisIl !== l.il ? `${yer} → ${l.varisIl}` : yer;
    rows.push(`🚛 ${rota || l.title || "Yük"}`);
    if (yuk) rows.push([yuk, l.vehicle].filter(Boolean).join(" · "));
    rows.push(fiyat);
    if (l.dateText && l.dateText !== "Belirtilmedi") rows.push(`📅 ${l.dateText}`);
    if (l.recurring) rows.push(`↻ ${FREQ_TXT[l.recurringFreq] || "Düzenli iş"}`);
  }
  rows.push("");
  rows.push(`YÜKLET'te aç: ${url}`);
  return rows.filter((r) => r !== undefined && r !== null).join("\n").replace(/\n{3,}/g, "\n\n");
}

// ── Doğrudan WhatsApp ───────────────────────────────────────────────
// Native'de custom scheme (whatsapp://) BİLEREK kullanılır: http(s) adresi
// webview'a yüklenip uygulamadan çıkılma riski var; özel şemayı ise webview
// hiçbir koşulda yükleyemez, işletim sistemine devretmek ZORUNDA. WhatsApp
// kurulu değilse hiçbir şey olmaz — uygulama sağlam kalır (paylaş sayfası
// yedek yol olarak her ekranda duruyor). Web'de wa.me yeni sekmede açılır.
export function whatsappUrl(text) {
  const t = encodeURIComponent(String(text || ""));
  return Capacitor.isNativePlatform() ? `whatsapp://send?text=${t}` : `https://wa.me/?text=${t}`;
}

// Sonuç: "opened" | "failed"
export function shareToWhatsApp(text) {
  const url = whatsappUrl(text);
  try {
    if (Capacitor.isNativePlatform()) window.location.href = url;
    else window.open(url, "_blank", "noopener");
    return "opened";
  } catch {
    return "failed";
  }
}

// Sonuç: "shared" | "copied" | "failed"
export async function shareUrl({ title = "YÜKLET", text = "", url = "" } = {}) {
  // 1) Native (iOS/Android) → Capacitor Share (her iki platformda çalışır)
  if (Capacitor.isNativePlatform()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, url, dialogTitle: "Paylaş" });
      return "shared";
    } catch (e) {
      // Kullanıcı iptal ettiyse hata fırlatır — sessizce geç.
      if (String(e?.message || "").toLowerCase().includes("cancel")) return "shared";
      // Plugin hatası → panoya düş.
    }
  }

  // 2) Web Share API (mobil tarayıcı / iOS Safari)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "shared"; // kullanıcı iptal etti
    }
  }

  // 3) Panoya kopyala (masaüstü / desteklenmeyen)
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      /* noop */
    }
  }
  return "failed";
}
