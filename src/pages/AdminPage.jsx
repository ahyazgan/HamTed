import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Lock, Ban, Flag, FileText, FileCheck2, Trash2, Eye, CheckCircle2, X, Check, Smartphone, Fuel, Scale, AlertTriangle, ScrollText, Activity, Phone, StickyNote, UserX, Link2, PlusCircle, Clock, Target, Search, RotateCw } from "lucide-react";
import { loadPricingConfig, savePricingConfig } from "../utils/storage";
import { seasonFactor } from "../utils/priceEstimate";
import { fmtTL } from "../utils/payments";
import SEO from "../components/SEO";
import { useToast } from "../components/Toast";
import { isSupabaseConfigured } from "../lib/supabase";
import { isAdmin, ADMIN_EMAILS } from "../utils/admin";
import { haulerCategory } from "../utils/haulerCategory";
import { isValidPhone } from "../lib/smsProvider";
import { prospectShareUrl, prospectShareText, shareUrl } from "../native/share";
import { PAYMENTS_ENABLED } from "../config/features";

// ── SAHA Admin / moderasyon paneli — şikayetler, belge doğrulama, kullanıcılar.
//    Sharp industrial: 2px ink frame, dark header + hazard, Archivo uppercase, Space Mono data.
//    Erişim: role==="admin" veya bilinen admin e-postası (utils/admin.js).
//    Tüm prop sözleşmesi ve işlevsellik korunur.

const C = {
  ink: "#0A0A0A",
  header: "#EAE3D6",
  yellow: "#FACC15",
  green: "#16803C",
  red: "#DC2626",
  bg: "#F1EDE5",
  card: "#FFFFFF",
  stone: "#F4F1EA",
  border: "#E3DDD0",
  sub: "#5A5852",
  muted: "#9A968D",
};
const MONO = "'Space Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const HEAD = "'Archivo', sans-serif";
const BODY = "'Plus Jakarta Sans', system-ui, sans-serif";

const HAZARD = "repeating-linear-gradient(45deg,#0A0A0A 0 9px,#FACC15 9px 18px)";

const fmt = (iso) => { try { return new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

const shortId = (id) => "YKL-" + String(id ?? "").slice(-4).toUpperCase().padStart(4, "0");

const TABS = [["pulse", "Pano"], ["saha", "Saha"], ["match", "Eşleştir"], ["talep", "Talep"], ["reports", "Şikayet"], ["disputes", "İtiraz"], ["listings", "İlan"], ["announce", "Duyuru"], ["users", "Üye"], ["docs", "Belge"], ["pricing", "Finans"], ["audit", "Kayıt"]];

// ── SAHA ADAY KAYDI ─────────────────────────────────────────────────
// Ziyaret edilen ama henüz üye OLMAYAN firmalar. profiles.id → auth.users FK
// olduğu için bunlara hesap açılamaz; ayrı tabloda dururlar, vitrin ilanları
// sahipsiz yayınlanır ve firma davet linkiyle hesabını açınca ona devredilir.
const PROSPECT_ROLES = [["tedarikci", "Satıcı (ocak)"], ["nakliyeci", "Nakliyeci"], ["isveren", "Alıcı"]];
const PROSPECT_STATUS = {
  taslak:       { label: "TASLAK",       bg: "#F4F1EA", fg: "#0A0A0A" },
  yayinda:      { label: "YAYINDA",      bg: "#16803C", fg: "#FFFFFF" },
  sahiplenildi: { label: "SAHİPLENİLDİ", bg: "#FACC15", fg: "#0A0A0A" },
  kapali:       { label: "KAPALI",       bg: "#E3DDD0", fg: "#5A5852" },
};
const BOS_ADAY = { name: "", role: "tedarikci", phone: "", email: "", il: "", ilce: "", tesisTuru: "", hakkinda: "", malzemeler: [], note: "" };

// "Son N gün içinde mi?" — tarihi olmayan satırlar (yerel mod tap'leri) sayılmaz.
const DAY = 86400000;
const within = (iso, days) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && Date.now() - t < days * DAY;
};
// Bugünden kaç gün önce? (yoksa null)
const daysAgo = (iso) => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.floor((Date.now() - t) / DAY) : null;
};
// Aktiflik damgası: son giriş yoksa KAYIT tarihine düş. Migration 2026-07-29'da
// koşulduğu için o ana kadarki tüm üyelerin last_seen'i boş — damgasızı "uyuyor"
// saymak dünkü üyeyi bile kaçmış gösterirdi. Haftalık özet SQL'i de aynı
// coalesce(last_seen, created_at) tanımını kullanır; ikisi tutarlı olmalı.
const aktiflik = (u) => u?.lastSeen || u?.createdAt || null;
// "Son giriş" etiketi — damga yoksa kayıt tarihiyle dürüst cümle kurar.
const sonGorulme = (u) => {
  const d = daysAgo(u?.lastSeen);
  if (d != null) return d <= 0 ? "bugün girdi" : `${d} gün önce girdi`;
  const k = daysAgo(u?.createdAt);
  if (k == null) return "giriş kaydı yok";
  return k <= 0 ? "bugün kaydoldu, henüz girmedi" : `${k} gün önce kaydoldu, giriş kaydı yok`;
};
const ROL_ETIKET = { isveren: "Alıcı", tedarikci: "Satıcı", nakliyeci: "Nakliyeci" };
// "Aracım bugün müsait" — damga gün sonuna yazılır, geçmişse müsaitlik düşmüştür.
// Beyan edilmiş boş kapasite; eşleştirmede tahminlerin hepsinden değerli sinyal.
const musaitMi = (u) => Boolean(u?.availableUntil) && new Date(u.availableUntil).getTime() > Date.now();

// ── İlan kalite bayrakları — "telefonla arayıp düzelttirilecek" listesi ──
// Fotoğraf alanı ilan modelinde YOK; o yüzden bayraklanmaz.
const kaliteBayraklari = (l, ownerById) => {
  const f = [];
  if (!(Number(l.price) > 0)) f.push("fiyat yok");
  if (String(l.desc || "").trim().split(/\s+/).filter(Boolean).length < 3) f.push("açıklama yetersiz");
  if (l.type !== "urun" && !(Number(l.amount) > 0)) f.push("miktar yok");
  if (!String(l.ilce || "").trim()) f.push("ilçe yok");
  const o = ownerById[String(l.ownerId)];
  if (o && !isValidPhone(o.phone)) f.push("telefon yok");
  return f;
};

// Duyuru hedef rolleri (app_config.announcement.roles içinde saklanır).
const ANN_ROLES = [["isveren", "Alıcı"], ["tedarikci", "Satıcı"], ["nakliyeci", "Nakliyeci"]];

const PAY_BADGE = {
  bloke: { label: "EMANETTE", bg: "#FACC15", fg: "#0A0A0A" },
  serbest: { label: "ÖDENDİ", bg: "#16803C", fg: "#fff" },
  iade: { label: "İADE", bg: "#DC2626", fg: "#fff" },
};

// Report status badge config: label, bg, fg.
const REPORT_STATUS = {
  acik: { label: "Açık", bg: C.red, fg: "#fff" },
  inceleniyor: { label: "İnceleniyor", bg: C.yellow, fg: C.ink },
  kapali: { label: "Kapalı", bg: C.sub, fg: "#fff" },
};

const shell = {
  margin: "0 auto", width: "100%", maxWidth: 460, minHeight: "100vh",
  background: C.bg, display: "flex", flexDirection: "column",
  color: C.ink, fontFamily: BODY,
};

// Base button: 2px ink frame, Archivo uppercase, no soft shadow.
const btnBase = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  cursor: "pointer", background: C.card, color: C.ink,
  border: `2px solid ${C.ink}`, borderRadius: 5, padding: "8px 11px",
  fontFamily: HEAD, fontSize: 11, fontWeight: 800, textTransform: "uppercase",
  letterSpacing: "-0.01em", lineHeight: 1, whiteSpace: "nowrap",
};

export default function AdminPage({ user, reports = [], docs = [], users = [], listings = [], offers = [], onRequireAuth, onSetReportStatus, onReviewDoc, onUpdateUser, onResolveDispute, audit = [], onLog, onUpdateListing, announcement, onSaveAnnouncement, adminNotes = {}, onSaveAdminNote, tapStats = [], deletedAccounts = [], searchSignals = [], onRunRecurrences, prospects = [], onSaveProspect, onProspectConsent, onPublishProspect, sahaHatti = "", onSaveSahaHatti }) {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const toast = useToast();
  // Admin kullanıcı işlemi sarmalayıcı: sonucu kontrol et, hatayı toast ile göster.
  const doUserAction = async (userId, patch, okMsg) => {
    const res = await onUpdateUser?.(userId, patch);
    if (res && res.ok === false) { toast?.(res.error || "İşlem başarısız", "error"); return; }
    toast?.(okMsg, "success");
  };
  const [tab, setTab] = useState("pulse");
  // CRM notu: hangi üyenin not alanı açık + taslak (kaydedilene dek yerel).
  const [noteOpen, setNoteOpen] = useState(null);
  const [noteDraft, setNoteDraft] = useState({ note: "", nextCall: "" });
  const openNote = (u) => {
    const cur = adminNotes[String(u.id)] || {};
    setNoteDraft({ note: cur.note || "", nextCall: cur.nextCall || "" });
    setNoteOpen(String(u.id));
  };
  const saveNote = async (u) => {
    const res = await onSaveAdminNote?.(u.id, noteDraft);
    if (res && res.ok === false) { toast?.(res.error || "Not kaydedilemedi", "error"); return; }
    toast?.("Not kaydedildi", "success"); setNoteOpen(null);
  };
  const [fuelIndex, setFuelIndex] = useState(() => loadPricingConfig().fuelIndex || 1.0);
  const [feeRate, setFeeRate] = useState(() => loadPricingConfig().feeRate ?? 0.10);
  const [fuelSaved, setFuelSaved] = useState(false);
  const [lq, setLq] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(false);   // İlan sekmesi: kalite kuyruğu süzgeci
  const [uq, setUq] = useState("");                        // Üye arama
  const [uSeg, setUSeg] = useState("hepsi");               // Üye durum segmenti
  const [uRole, setURole] = useState("hepsi");             // Üye rol segmenti
  const [matchId, setMatchId] = useState(null);            // Eşleştir: seçili iş ilanı
  const [recurBusy, setRecurBusy] = useState(false);       // düzenli seferler işleniyor
  // ── Saha sekmesi ────────────────────────────────────────────────
  // adayForm: null = kapalı, {id:null,...} = yeni aday, {id:N,...} = düzenleme.
  const [adayForm, setAdayForm] = useState(null);
  const [adayBusy, setAdayBusy] = useState(false);
  const [hatDraft, setHatDraft] = useState(sahaHatti);
  useEffect(() => { setHatDraft(sahaHatti); }, [sahaHatti]);
  const kaydetAday = async () => {
    if (!adayForm?.name?.trim()) { toast?.("Firma adı zorunlu.", "error"); return; }
    setAdayBusy(true);
    const { id, ...patch } = adayForm;
    const res = await onSaveProspect?.(id || null, { ...patch, name: patch.name.trim() });
    setAdayBusy(false);
    if (res?.ok === false) { toast?.(res.error || "Kaydedilemedi", "error"); return; }
    toast?.(id ? "Aday kayıt güncellendi" : "Aday kayıt açıldı", "success");
    setAdayForm(null);
  };
  // Rıza: firma "evet" dedi. Yayın kapısının anahtarı bu — sunucu rıza damgası
  // olmadan 'yayinda' satırı yazdırmıyor (prospects_consent_chk).
  const rizaAl = async (p) => {
    const not = window.prompt("Rıza nasıl alındı? (örn: 12.08 ziyaret, WhatsApp onayı ekran görüntüsü)", p.consentNote || "");
    if (not === null) return;
    const res = await onProspectConsent?.(p.id, not);
    toast?.(res?.ok === false ? (res.error || "Kaydedilemedi") : "Rıza kaydedildi", res?.ok === false ? "error" : "success");
  };
  const yayinDegistir = async (p) => {
    const yayinla = p.status !== "yayinda";
    const res = await onPublishProspect?.(p.id, yayinla);
    toast?.(res?.ok === false ? (res.error || "İşlem başarısız") : (yayinla ? "Vitrin yayında" : "Vitrin geri alındı"), res?.ok === false ? "error" : "success");
  };
  const davetPaylas = async (p) => {
    const url = prospectShareUrl(p.token);
    const r = await shareUrl({ title: "YÜKLET", text: prospectShareText(p), url });
    toast?.(r === "copied" ? "Davet linki panoya kopyalandı" : r === "failed" ? "Paylaşılamadı" : "Paylaşıldı", r === "failed" ? "error" : "success");
  };
  // Düzenli sevkiyat: sırası gelmiş tüm seferleri aç. Sonucu DÜRÜST bildir —
  // "0 sefer" de bilgidir (sıra henüz gelmemiş ya da önceki sefer hâlâ açık).
  const runRecurrings = async () => {
    setRecurBusy(true);
    try {
      const res = await onRunRecurrences?.();
      if (res && res.ok === false) { toast?.(res.error || "İşlenemedi", "error"); return; }
      const n = res?.count ?? 0;
      toast?.(n > 0 ? `${n} düzenli sefer açıldı` : "Sırası gelen sefer yok", n > 0 ? "success" : "info");
    } finally { setRecurBusy(false); }
  };
  // Duyuru formu: admin DOKUNANA KADAR yayındaki duyuruyu aynalar (annDraft null).
  // SB'de duyuru app_config'ten ASENKRON gelir; snapshot state kullansaydık panel
  // erken açıldığında boş form görünür ve kaydedince yayındaki duyuruyu ezerdi.
  const [annDraft, setAnnDraft] = useState(null);
  const ann = annDraft || { active: false, text: "", tone: "promo", roles: [], iller: [], ...(announcement || {}) };
  const setAnn = (u) => setAnnDraft((cur) => (typeof u === "function" ? u(cur || ann) : u));
  const [annSaved, setAnnSaved] = useState(false);
  const toggleIn = (arr, v) => (arr || []).includes(v) ? (arr || []).filter((x) => x !== v) : [...(arr || []), v];
  // Duyuru kaydı: SB'de app_config'e yazar. Hata dönerse "KAYDEDİLDİ" YAZMA.
  const saveAnn = async () => {
    const res = await onSaveAnnouncement?.(ann);
    if (res && res.ok === false) { toast?.(res.error || "Duyuru kaydedilemedi", "error"); return; }
    setAnnSaved(true); setTimeout(() => setAnnSaved(false), 1500);
  };
  const ANN_TONES = [["promo", "Promosyon", C.ink, C.yellow], ["info", "Bilgi", C.yellow, C.ink], ["warn", "Uyarı", C.red, "#fff"]];
  const tone = ANN_TONES.find((t) => t[0] === ann.tone) || ANN_TONES[0];
  const saveFuel = (v, log) => { setFuelIndex(v); savePricingConfig({ ...loadPricingConfig(), fuelIndex: v }); setFuelSaved(true); setTimeout(() => setFuelSaved(false), 1500); if (log) onLog?.("config", `Yakıt endeksi → ×${v.toFixed(2)}`); };
  const saveFee = (v, log) => { setFeeRate(v); savePricingConfig({ ...loadPricingConfig(), feeRate: v }); setFuelSaved(true); setTimeout(() => setFuelSaved(false), 1500); if (log) onLog?.("config", `Komisyon → %${Math.round(v * 100)}`); };

  // Admin olmayan giriş yapmış kullanıcı: panelin varlığını ifşa etmeden
  // sessizce ana sayfaya yönlendir (kilit ekranı gösterme).
  // TEŞHİS KAPISI: /admin?tani=1 ile gelindiğinde sessizce yönlendirme YAPMA,
  // NEDEN reddedildiğini yaz. Sessiz yönlendirme paneli gizlemek için bilinçli
  // bir karardı ama teşhisi de imkânsız kılıyordu: doğru e-postayla girdiğini
  // sanan yönetici hiçbir ipucu görmeden ana sayfaya atılıyordu (birden fazla
  // hesabı varsa hangisiyle girdiğini anlamanın yolu yok). Gizlilik korunur:
  // yalnız bu parametre elle yazıldığında ve YALNIZ giriş yapmış kişiye görünür.
  const tani = sp.get("tani") === "1";
  const blocked = Boolean(user) && !isAdmin(user);
  useEffect(() => {
    if (blocked && !tani) navigate("/", { replace: true });
  }, [blocked, tani, navigate]);

  // ── Gate: giriş yok ──
  if (!user) {
    return (
      <div style={{ ...shell, alignItems: "center", justifyContent: "center", padding: "48px 20px", gap: 16, textAlign: "center" }}>
        <SEO title="Yönetim" />
        <div style={{ width: 66, height: 66, borderRadius: 6, background: C.ink, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "3px 3px 0 #0A0A0A" }}>
          <Lock size={28} color={C.yellow} strokeWidth={2.4} />
        </div>
        <h1 style={{ fontFamily: HEAD, fontSize: 21, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.15, margin: 0 }}>Yönetim için giriş yapın</h1>
        <button onClick={() => onRequireAuth?.()} style={{ ...btnBase, background: C.ink, color: C.yellow, fontSize: 13, padding: "12px 20px", marginTop: 4, boxShadow: "3px 3px 0 #0A0A0A" }}>Giriş yap</button>
      </div>
    );
  }

  // ── Gate: yetki yok → sessizce yönlendir; ?tani=1 ise nedenini yaz ──
  if (blocked) {
    if (!tani) return null;
    return (
      <div style={{ ...shell, padding: "48px 20px", gap: 14 }}>
        <SEO title="Yönetim" />
        <div style={{ background: C.card, border: `2px solid ${C.red}`, borderRadius: 6, padding: 16, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
          <h1 style={{ fontFamily: HEAD, fontSize: 17, fontWeight: 900, textTransform: "uppercase", color: C.ink, margin: "0 0 10px" }}>Bu hesap yönetici değil</h1>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.sub, lineHeight: 1.7 }}>
            Giriş yapılan e-posta:<br />
            <b style={{ color: C.red, fontSize: 13, wordBreak: "break-all" }}>{user.email || "(e-posta boş!)"}</b><br /><br />
            Rol: <b style={{ color: C.ink }}>{user.role || "(yok)"}</b><br />
            Kullanıcı no: <span style={{ fontSize: 10 }}>{String(user.id || "").slice(0, 8)}…</span>
          </div>
          <div style={{ marginTop: 14, background: C.stone, border: `2px solid ${C.border}`, borderRadius: 5, padding: "10px 12px", fontFamily: BODY, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
            Yönetim paneli yalnızca şu hesaplara açıktır: <b>{ADMIN_EMAILS.join(", ")}</b>.
            Yukarıdaki adres bunlardan biri değilse çıkış yapıp o hesapla gir.
            {!user.email && " E-posta BOŞ görünüyor — bu bir oturum sorunudur, çıkış yapıp tekrar gir."}
          </div>
        </div>
        <button onClick={() => navigate("/profil")} style={{ ...btnBase, justifyContent: "center", background: C.ink, color: C.yellow, padding: "13px 0", fontSize: 13 }}>Profile git (çıkış yapmak için)</button>
      </div>
    );
  }

  const openReports = reports.filter((r) => r.status !== "kapali").length;
  const pendingDocs = docs.filter((d) => (d.status || "beklemede") === "beklemede").length;
  const titleOf = (id) => listings.find((l) => String(l.id) === String(id))?.title || ("#" + id);
  // Üye kimliği → profil (kalite bayrakları + eşleştirme + duyuru erişimi için).
  const ownerById = {};
  for (const u of users) ownerById[String(u.id)] = u;
  // Kalite kuyruğu: bayraklı AKTİF ilanlar (kapalı/eşleşmiş ilanı düzelttirmenin anlamı yok).
  const flaggedListings = listings.filter((l) => l.status === "aktif" && kaliteBayraklari(l, ownerById).length > 0);

  // ── Para akışı (emanet/komisyon/iade) — listing.paymentStatus üzerinden ──
  const money = listings.reduce((a, l) => {
    const amt = Number(l.paymentAmount) || 0, fee = Number(l.paymentFee) || 0;
    if (l.paymentStatus === "bloke") { a.gmv += amt; a.escrow += amt; }
    else if (l.paymentStatus === "serbest") { a.gmv += amt; a.fee += fee + (Number(l.earlyPayFee) || 0); }
    else if (l.paymentStatus === "iade") { a.refund += amt; }
    return a;
  }, { gmv: 0, fee: 0, escrow: 0, refund: 0 });

  // ── Funnel: ilan → teklif → eşleşme ──
  const activeListings = listings.filter((l) => l.status === "aktif").length;
  const matched = listings.filter((l) => l.status === "eslesti" || l.status === "kapali").length;
  const acceptedOffers = offers.filter((o) => o.status === "kabul").length;
  const acceptRate = offers.length ? Math.round((acceptedOffers / offers.length) * 100) : 0;
  const disputes = listings.filter((l) => l.deliveryProof?.status === "itiraz").length;

  const STATS = [
    { label: "Açık Şikayet", value: openReports, red: true },
    { label: "Bekleyen Belge", value: pendingDocs },
    { label: "Kullanıcı", value: users.length || "—" },
  ];

  return (
    <div style={shell}>
      <SEO title="Yönetim Paneli" description="YÜKLET moderasyon paneli." />

      {/* ── Dark header + hazard ── */}
      <div style={{ position: "relative", background: C.ink, padding: "16px 18px", display: "flex", alignItems: "center", gap: 11, overflow: "hidden" }}>
        <span style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 14, backgroundImage: HAZARD }} />
        <span style={{ width: 38, height: 38, borderRadius: 6, background: C.yellow, border: "2px solid #FACC15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Shield size={20} color={C.ink} strokeWidth={2.4} />
        </span>
        <h1 style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff", margin: 0, lineHeight: 1 }}>Yönetim Paneli</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "16px 16px 96px" }}>
        {isSupabaseConfigured && (
          <div style={{ background: C.stone, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "11px 13px", fontFamily: BODY, fontSize: 12, fontWeight: 600, color: C.sub, lineHeight: 1.45 }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, color: C.red }}>! </span>
            Supabase modunda moderasyon için servis-rolü (admin API) gerekir. Şu an yerel görünüm; tam yetki gerçek admin entegrasyonunda açılacak.
          </div>
        )}

        {/* ── PARA AKIŞI — koyu blok: GMV + komisyon + emanet + iade (PAYMENTS_ENABLED ile gizli) ── */}
        {PAYMENTS_ENABLED && (
        <div style={{ position: "relative", overflow: "hidden", background: C.ink, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 16, boxShadow: "4px 4px 0 rgba(10,10,10,.18)" }}>
          <span style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 8, backgroundImage: HAZARD }} />
          <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A988E" }}>İŞLEM HACMİ (GMV)</div>
          <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: "#fff", marginTop: 3, lineHeight: 1 }}>{fmtTL(money.gmv)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14 }}>
            {[
              { label: "Komisyon geliri", value: fmtTL(money.fee), clr: "#4ADE80" },
              { label: "Emanette", value: fmtTL(money.escrow), clr: C.yellow },
              { label: "İade", value: fmtTL(money.refund), clr: money.refund ? "#F87171" : "#9A988E" },
            ].map((m) => (
              <div key={m.label} style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid #2A2A2A", borderRadius: 5, padding: "9px 8px" }}>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: m.clr }}>{m.value}</div>
                <div style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9A988E", marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ── FUNNEL: ilan → teklif → eşleşme ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {[
            { label: "Aktif İlan", value: activeListings },
            { label: "Teklif", value: offers.length },
            { label: "Kabul %", value: `${acceptRate}` },
            { label: "Eşleşme", value: matched, green: true },
          ].map((s) => (
            <div key={s.label} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "11px 6px", textAlign: "center", boxShadow: "3px 3px 0 rgba(10,10,10,.10)" }}>
              <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 700, lineHeight: 1, color: s.green ? C.green : C.ink }}>{s.value}</div>
              <div style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: C.muted, marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Moderasyon stat grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
          {[...STATS, ...(disputes ? [{ label: "Anlaşmazlık", value: disputes, red: true }] : [])].slice(0, 3).map((s) => (
            <div key={s.label} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "13px 8px", textAlign: "center", boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, lineHeight: 1, color: s.red ? C.red : C.ink }}>{s.value}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: C.muted, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Sekmeler: 2px frame, yatay kaydırılabilir ── */}
        <div style={{ display: "flex", border: `2px solid ${C.ink}`, borderRadius: 6, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {TABS.map(([k, lbl], i) => {
            const active = tab === k;
            return (
              <button key={k} onClick={() => setTab(k)}
                style={{
                  flex: "1 0 auto", cursor: "pointer", padding: "10px 12px", whiteSpace: "nowrap",
                  background: active ? C.ink : C.card,
                  color: active ? C.yellow : C.ink,
                  border: "none", borderLeft: i > 0 ? `2px solid ${C.ink}` : "none",
                  fontFamily: HEAD, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1,
                }}>
                {lbl}
              </button>
            );
          })}
        </div>

        {/* ── PANO: operasyon nabzı + arama analitiği ── */}
        {tab === "pulse" && (() => {
          const stat = (arr, get) => ({ today: arr.filter((x) => within(get(x), 1)).length, week: arr.filter((x) => within(get(x), 7)).length });
          const mUye = stat(users, (u) => u.createdAt);
          const mIlan = stat(listings, (l) => l.createdAt);
          const kabul = offers.filter((o) => o.status === "kabul");
          const mEs = stat(kabul, (o) => o.updatedAt || o.createdAt);
          const mTap = stat(tapStats, (t) => t.createdAt);
          // İlan başına arama + teklif sayıları (top-5 ve boşluk sinyali için).
          const tapsBy = {}; tapStats.forEach((t) => { const k = String(t.listingId); tapsBy[k] = (tapsBy[k] || 0) + 1; });
          const offersBy = {}; offers.forEach((o) => { const k = String(o.listingId); offersBy[k] = (offersBy[k] || 0) + 1; });
          const top = Object.entries(tapsBy).sort((a, b) => b[1] - a[1]).slice(0, 5);
          const gaps = listings.filter((l) => l.status === "aktif" && l.createdAt && !within(l.createdAt, 3) && !offersBy[String(l.id)] && !tapsBy[String(l.id)]).slice(0, 5);
          const silinen30 = deletedAccounts.filter((d) => within(d.deletedAt, 30)).length;
          // CRM: "sonraki arama" bugüne/geçmişe düşen üyeler.
          const bugunSonu = new Date(); bugunSonu.setHours(23, 59, 59, 999);
          const aranacak = users.filter((u) => { const nc = adminNotes[String(u.id)]?.nextCall; return nc && new Date(nc) <= bugunSonu; }).slice(0, 5);
          const KARTLAR = [
            { label: "Yeni Üye", ...mUye },
            { label: "Yeni İlan", ...mIlan },
            { label: "Eşleşme", ...mEs, green: true },
            { label: "Arama", ...mTap },
          ];
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* bugün / 7 gün kartları */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 9 }}>
                {KARTLAR.map((k) => (
                  <div key={k.label} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "12px 12px", boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, lineHeight: 1, color: k.green ? C.green : C.ink }}>{k.today}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.muted }}>bugün</span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: C.muted, marginTop: 6 }}>{k.label} · 7g: {k.week}</div>
                  </div>
                ))}
              </div>

              {/* ── HUNİ: kayıt → ilan → eşleşme ── */}
              {/* "Pano sayı verir, huni nerede tıkandığımızı verir." Likidite fazının asıl sorusu. */}
              {users.length > 0 && (() => {
                const ilanAcan = new Set(listings.map((l) => String(l.ownerId)));
                // Eşleşme ölçütü: gerçekten bir nakliyeciye gitmiş ilan. Yalnız
                // status='kapali'ye bakmak yanlıştı — admin bir ilanı GİZLEYİNCE de
                // durum 'kapali' oluyor ve sahibi anında "eşleşti" sayılıyordu.
                const eslesenIlan = listings.filter((l) => l.status === "eslesti" || Boolean(l.acceptedById));
                const eslesenUye = new Set();
                for (const l of eslesenIlan) {
                  eslesenUye.add(String(l.ownerId));
                  if (l.acceptedById) eslesenUye.add(String(l.acceptedById));
                }
                const nKayit = users.length;
                const nIlan = users.filter((u) => ilanAcan.has(String(u.id))).length;
                const nEs = users.filter((u) => eslesenUye.has(String(u.id))).length;
                const pct = (n) => (nKayit ? Math.round((n / nKayit) * 100) : 0);
                // nEs, nIlan'ı GEÇEBİLİR: hiç ilan açmamış bir nakliyeci iş kabul
                // edince eşleşmeye dokunmuş sayılır. Bu bir hata değil — huniyi
                // "genişliyor" gibi göstermek yerine ayrı bir satırla açıkla.
                const disaridanEslesen = Math.max(0, nEs - nIlan);
                const ADIM = [
                  { label: "Kayıt oldu", n: nKayit, clr: C.ink },
                  { label: "İlan açtı", n: nIlan, clr: C.yellow, kayip: nKayit - nIlan, kayipLbl: "hiç ilan açmadı" },
                  {
                    label: "Eşleşti", n: nEs, clr: C.green,
                    kayip: Math.max(0, nIlan - nEs), kayipLbl: "ilan açtı ama eşleşmedi",
                    not: disaridanEslesen ? `${disaridanEslesen} kişi ilan açmadan iş aldı (kabul eden nakliyeci)` : "",
                  },
                ];
                return (
                  <div>
                    <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, margin: "2px 0 4px" }}>Huni</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginBottom: 9 }}>Kayıt → ilan → eşleşme. En büyük düşüş nerede ise saha turu oraya.</div>
                    <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 13, boxShadow: "3px 3px 0 rgba(10,10,10,.12)", display: "flex", flexDirection: "column", gap: 11 }}>
                      {ADIM.map((a) => (
                        <div key={a.label}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontFamily: HEAD, fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: C.ink }}>{a.label}</span>
                            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.ink }}>{a.n} <span style={{ color: C.muted, fontSize: 10 }}>· %{pct(a.n)}</span></span>
                          </div>
                          <div style={{ height: 12, background: C.stone, border: `2px solid ${C.ink}`, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${Math.max(pct(a.n), a.n ? 3 : 0)}%`, height: "100%", background: a.clr }} />
                          </div>
                          {a.kayip > 0 && (
                            <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.red, marginTop: 4 }}>↓ {a.kayip} üye {a.kayipLbl}</div>
                          )}
                          {a.not && (
                            <div style={{ fontFamily: MONO, fontSize: 9.5, color: C.muted, marginTop: 4 }}>↗ {a.not}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* silinen hesap (30 gün) */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: silinen30 ? "#FDECEC" : C.stone, border: `2px solid ${silinen30 ? C.red : C.border}`, borderRadius: 6, padding: "10px 13px" }}>
                <UserX size={16} color={silinen30 ? C.red : C.muted} strokeWidth={2.4} />
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: silinen30 ? C.red : C.sub }}>Silinen hesap (30 gün): {silinen30}</span>
              </div>

              {/* aranacaklar (CRM sonraki arama) */}
              {aranacak.length > 0 && (
                <div>
                  <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, margin: "2px 0 9px" }}>Bugün Aranacaklar</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {aranacak.map((u) => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `2px solid ${C.yellow}`, borderRadius: 6, padding: "9px 12px", boxShadow: "3px 3px 0 #FACC15" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontFamily: HEAD, fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                          <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>{adminNotes[String(u.id)]?.nextCall} · {adminNotes[String(u.id)]?.note?.slice(0, 40) || "not yok"}</div>
                        </div>
                        {u.phone && (
                          <a href={`tel:${u.phone}`} style={{ ...btnBase, textDecoration: "none", background: C.green, color: "#fff", padding: "8px 10px" }}>
                            <Phone size={12} strokeWidth={2.6} /> Ara
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* en çok arananlar */}
              <div>
                <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, margin: "2px 0 9px" }}>En Çok Arananlar</div>
                {top.length === 0 ? <Empty icon={Phone} text="Henüz arama kaydı yok." /> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {top.map(([lid, n], i) => (
                      <div key={lid} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "9px 12px", boxShadow: "3px 3px 0 rgba(10,10,10,.10)" }}>
                        <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4, background: i === 0 ? C.yellow : C.stone, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.ink }}>{i + 1}</span>
                        <span style={{ flex: 1, minWidth: 0, fontFamily: BODY, fontSize: 12.5, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titleOf(lid)}</span>
                        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.green, flexShrink: 0 }}>{n} arama</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* boşluk sinyali: 3+ gündür aktif, 0 teklif + 0 arama */}
              <div>
                <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, margin: "2px 0 4px" }}>Boşluk Sinyali</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginBottom: 9 }}>3+ gündür açık, hiç teklif/arama almamış ilanlar — karşı taraf onboard edilmeli.</div>
                {gaps.length === 0 ? <Empty icon={CheckCircle2} text="Boşluk yok — tüm aktif ilanlar ilgi görüyor." /> : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {gaps.map((l) => (
                      <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `2px solid ${C.red}`, borderRadius: 6, padding: "9px 12px" }}>
                        <AlertTriangle size={14} color={C.red} strokeWidth={2.4} style={{ flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title || ("#" + l.id)}</div>
                          <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>{l.cat === "hafriyat" ? "Hafriyat" : "Silobas"} · {l.il || "—"} · {l.owner || "—"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── SAHA: aday firma kaydı — "önce değer, sonra hesap" ── */}
        {/* Ocakçıya "önce uygulamaya kaydol" demek saha turunu öldürüyor.
            Burada firma HENÜZ ÜYE DEĞİLKEN girilir, vitrini sahipsiz yayınlanır
            (iletişim saha hattı), değeri gördükten sonra davet linkiyle kendi
            hesabını açar ve her şey ona geçer. Rıza olmadan yayın YOK — bu
            kural panelde değil, veritabanı kısıtında (prospects_consent_chk). */}
        {tab === "saha" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Saha hattı: vitrin ilanlarında görünen numara. Boşsa vitrin
                ilanında aranacak numara HİÇ görünmez — bu yüzden en üstte. */}
            <div style={{ background: C.card, border: `2px solid ${sahaHatti ? C.ink : C.red}`, borderRadius: 6, padding: 14, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
              <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", marginBottom: 6 }}>SAHA HATTI (vitrin ilanlarında görünür)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={hatDraft} onChange={(e) => setHatDraft(e.target.value)} placeholder="05XX XXX XX XX" inputMode="tel"
                  style={{ flex: 1, minWidth: 0, boxSizing: "border-box", background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "9px 11px", fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.ink, outline: "none" }} />
                <button onClick={async () => { const r = await onSaveSahaHatti?.(hatDraft.trim()); toast?.(r?.ok === false ? (r.error || "Kaydedilemedi") : "Saha hattı kaydedildi", r?.ok === false ? "error" : "success"); }}
                  style={{ flexShrink: 0, cursor: "pointer", padding: "9px 14px", borderRadius: 5, border: `2px solid ${C.ink}`, background: C.ink, color: C.yellow, fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>KAYDET</button>
              </div>
              {!sahaHatti && (
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.red, marginTop: 6, lineHeight: 1.45 }}>
                  Numara girilmeden vitrin ilanlarında iletişim görünmez — alıcı arayamaz.
                </div>
              )}
            </div>

            {/* Yeni aday */}
            {!adayForm && (
              <button onClick={() => setAdayForm({ id: null, ...BOS_ADAY })}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", padding: "12px 0", borderRadius: 6, border: `2px solid ${C.ink}`, background: C.yellow, color: C.ink, fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", boxShadow: "3px 3px 0 rgba(10,10,10,.15)" }}>
                <PlusCircle size={16} strokeWidth={2.4} /> Aday firma ekle
              </button>
            )}

            {/* Aday formu */}
            {adayForm && (() => {
              const alan = (k, lbl, ph, opts = {}) => (
                <div>
                  <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", marginBottom: 5 }}>{lbl}</label>
                  {opts.area
                    ? <textarea value={adayForm[k] || ""} onChange={(e) => setAdayForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={ph}
                        style={{ width: "100%", boxSizing: "border-box", minHeight: 58, resize: "vertical", background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "9px 11px", fontFamily: BODY, fontSize: 13, fontWeight: 600, color: C.ink, outline: "none" }} />
                    : <input value={adayForm[k] || ""} onChange={(e) => setAdayForm((f) => ({ ...f, [k]: e.target.value }))} placeholder={ph} inputMode={opts.tel ? "tel" : undefined}
                        style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "9px 11px", fontFamily: BODY, fontSize: 13, fontWeight: 600, color: C.ink, outline: "none" }} />}
                </div>
              );
              return (
                <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 14, boxShadow: "3px 3px 0 rgba(10,10,10,.12)", display: "flex", flexDirection: "column", gap: 11 }}>
                  <div style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 900, textTransform: "uppercase", color: C.ink }}>{adayForm.id ? "Aday firmayı düzenle" : "Yeni aday firma"}</div>
                  {alan("name", "Firma adı *", "Aldur Madencilik")}
                  <div>
                    <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", marginBottom: 5 }}>ROL</label>
                    <div style={{ display: "flex", gap: 7 }}>
                      {PROSPECT_ROLES.map(([id, lbl]) => (
                        <button key={id} onClick={() => setAdayForm((f) => ({ ...f, role: id }))}
                          style={{ flex: 1, cursor: "pointer", padding: "9px 0", borderRadius: 5, border: `2px solid ${C.ink}`, background: adayForm.role === id ? C.ink : C.card, color: adayForm.role === id ? C.yellow : C.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>{lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                    {alan("il", "İl", "İzmir")}
                    {alan("ilce", "İlçe", "Aliağa")}
                  </div>
                  {alan("phone", "Telefon (yayınlanmaz)", "05XX XXX XX XX", { tel: true })}
                  {alan("tesisTuru", "Tesis türü", "Kırma ocağı (taş/mıcır)")}
                  {alan("hakkinda", "Hakkında", "Kısa tanıtım — firma profilinde görünür.", { area: true })}
                  {alan("note", "Saha notu (yalnız panel)", "Ziyaret notu, kiminle görüşüldü, ne konuşuldu.", { area: true })}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button disabled={adayBusy} onClick={kaydetAday}
                      style={{ flex: 1, cursor: adayBusy ? "wait" : "pointer", padding: "11px 0", borderRadius: 5, border: `2px solid ${C.ink}`, background: C.green, color: "#fff", fontFamily: MONO, fontSize: 12, fontWeight: 700, opacity: adayBusy ? 0.6 : 1 }}>
                      {adayBusy ? "KAYDEDİLİYOR…" : "KAYDET"}
                    </button>
                    <button onClick={() => setAdayForm(null)}
                      style={{ flexShrink: 0, cursor: "pointer", padding: "11px 16px", borderRadius: 5, border: `2px solid ${C.ink}`, background: C.card, color: C.ink, fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>VAZGEÇ</button>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
                    Aday daima TASLAK doğar. Firma “evet” demeden vitrin yayınlanamaz — sunucu reddeder.
                  </div>
                </div>
              );
            })()}

            {/* Aday listesi */}
            {prospects.length === 0 ? (
              <Empty icon={Target} text="Henüz aday firma yok. Saha turunda görüştüğün ocağı buradan ekle." />
            ) : prospects.map((p) => {
              const st = PROSPECT_STATUS[p.status] || PROSPECT_STATUS.taslak;
              const vitrin = listings.filter((l) => String(l.prospectId) === String(p.id));
              const sahiplenen = p.claimedBy ? users.find((u) => String(u.id) === String(p.claimedBy)) : null;
              const rolLbl = PROSPECT_ROLES.find(([id]) => id === p.role)?.[1] || p.role || "—";
              return (
                <div key={p.id} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "12px 13px", boxShadow: "3px 3px 0 rgba(10,10,10,.12)", display: "flex", flexDirection: "column", gap: 9 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 900, textTransform: "uppercase", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>
                        {[rolLbl, [p.il, p.ilce].filter(Boolean).join(" / "), `${vitrin.length} vitrin ilanı`].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <span style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 4, border: `2px solid ${C.ink}`, background: st.bg, color: st.fg, fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em" }}>{st.label}</span>
                  </div>

                  {/* Rıza durumu — yayının ön koşulu */}
                  <div style={{ display: "flex", alignItems: "center", gap: 7, background: p.consentAt ? "#EAF6EE" : C.stone, border: `2px solid ${p.consentAt ? C.green : C.border}`, borderRadius: 5, padding: "7px 9px" }}>
                    {p.consentAt ? <CheckCircle2 size={14} color={C.green} strokeWidth={2.4} /> : <AlertTriangle size={14} color={C.muted} strokeWidth={2.4} />}
                    <span style={{ flex: 1, minWidth: 0, fontFamily: MONO, fontSize: 10, color: p.consentAt ? C.green : C.muted, lineHeight: 1.4 }}>
                      {p.consentAt ? `Rıza alındı · ${fmt(p.consentAt)}${p.consentNote ? ` · ${p.consentNote}` : ""}` : "Rıza yok — vitrin yayınlanamaz"}
                    </span>
                    {!p.claimedBy && (
                      <button onClick={() => rizaAl(p)}
                        style={{ flexShrink: 0, cursor: "pointer", padding: "5px 9px", borderRadius: 4, border: `2px solid ${C.ink}`, background: p.consentAt ? C.card : C.yellow, color: C.ink, fontFamily: MONO, fontSize: 9.5, fontWeight: 700 }}>
                        {p.consentAt ? "DÜZENLE" : "RIZA ALINDI"}
                      </button>
                    )}
                  </div>

                  {p.note && <div style={{ fontFamily: BODY, fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{p.note}</div>}
                  {sahiplenen && (
                    <div style={{ fontFamily: MONO, fontSize: 10, color: C.green }}>
                      ↳ hesabını açtı: {sahiplenen.name} · {fmt(p.claimedAt)}
                    </div>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none", padding: "7px 10px", borderRadius: 4, border: `2px solid ${C.ink}`, background: C.green, color: "#fff", fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>
                        <Phone size={12} strokeWidth={2.6} /> ARA
                      </a>
                    )}
                    {!p.claimedBy && (
                      <button onClick={() => navigate(`/ilan-ver?aday=${p.id}`)}
                        style={{ cursor: "pointer", padding: "7px 10px", borderRadius: 4, border: `2px solid ${C.ink}`, background: C.card, color: C.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>+ VİTRİN İLANI</button>
                    )}
                    {!p.claimedBy && (
                      <button onClick={() => yayinDegistir(p)} disabled={!p.consentAt && p.status !== "yayinda"}
                        title={!p.consentAt && p.status !== "yayinda" ? "Önce rıza kaydı gerekir" : ""}
                        style={{ cursor: (!p.consentAt && p.status !== "yayinda") ? "not-allowed" : "pointer", opacity: (!p.consentAt && p.status !== "yayinda") ? 0.4 : 1, padding: "7px 10px", borderRadius: 4, border: `2px solid ${C.ink}`, background: p.status === "yayinda" ? C.card : C.ink, color: p.status === "yayinda" ? C.ink : C.yellow, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>
                        {p.status === "yayinda" ? "GERİ AL" : "YAYINLA"}
                      </button>
                    )}
                    {!p.claimedBy && (
                      <button onClick={() => davetPaylas(p)}
                        style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: "7px 10px", borderRadius: 4, border: `2px solid ${C.ink}`, background: C.card, color: C.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>
                        <Link2 size={12} strokeWidth={2.6} /> DAVET LİNKİ
                      </button>
                    )}
                    <button onClick={() => setAdayForm({ id: p.id, name: p.name, role: p.role, phone: p.phone, email: p.email, il: p.il, ilce: p.ilce, tesisTuru: p.tesisTuru, hakkinda: p.hakkinda, malzemeler: p.malzemeler, note: p.note })}
                      style={{ cursor: "pointer", padding: "7px 10px", borderRadius: 4, border: `2px solid ${C.ink}`, background: C.card, color: C.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>DÜZENLE</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── EŞLEŞTİR: "bu işi şu 3 nakliyeciye söyle" ── */}
        {/* Saha turunun hızlandırıcısı: açık iş ilanına, o güzergâh/kategoride
            uygun nakliyecileri puanlayıp telefonla arama sırası çıkarır. */}
        {tab === "match" && (() => {
          const openJobs = listings.filter((l) => l.type === "is" && l.status === "aktif");
          if (openJobs.length === 0) return <Empty icon={Link2} text="Açık iş ilanı yok — eşleştirilecek bir şey yok." />;
          const sel = openJobs.find((l) => String(l.id) === String(matchId)) || null;

          // Adaylar: nakliyeci rolü + banlı değil + taşıma türü çelişmiyor.
          // haulerCategory null dönerse (belirsiz/ikisi) aday listede kalır, puanı düşüktür.
          const adaylar = !sel ? [] : users
            .filter((u) => u.role === "nakliyeci" && u.status !== "banli")
            .map((u) => {
              const hc = haulerCategory({ user: u, listings });
              const bolge = Array.isArray(u.hizmetBolgeleri) ? u.hizmetBolgeleri : [];
              const iller = [sel.il, sel.varisIl].filter(Boolean);
              const ilUyum = iller.some((x) => u.sehir === x || bolge.includes(x));
              const teklifVerdi = offers.some((o) => String(o.listingId) === String(sel.id) && String(o.fromUserId) === String(u.id));
              // "Bugün müsaidim" diyen nakliyeci ARAMA LİSTESİNİN BAŞIDIR:
              // beyan edilmiş boş kapasite, tahmin edilen uygunluktan üstün.
              // Puanı tür+bölge toplamından (6) büyük tutuyoruz ki müsait olan
              // her koşulda üste çıksın.
              const musait = musaitMi(u);
              let score = 0;
              if (musait) score += 7;
              if (hc === sel.cat) score += 3; else if (!hc) score += 1;
              if (ilUyum) score += 3;
              if (u.verified) score += 1;
              if (within(aktiflik(u), 7)) score += 1;
              if (teklifVerdi) score -= 5;   // zaten teklif verdi, önce diğerlerini ara
              return { u, hc, ilUyum, teklifVerdi, musait, score };
            })
            .filter((c) => !c.hc || c.hc === sel.cat)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, lineHeight: 1.5 }}>
                Açık bir iş seç → o güzergâh ve kategoride uygun nakliyeciler puanlı sırayla gelir. Telefonla aracılık ettiğin turu hızlandırır.
              </div>

              {/* iş seçici */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {openJobs.slice(0, 30).map((l) => {
                  const active = String(l.id) === String(matchId);
                  return (
                    <button key={l.id} onClick={() => setMatchId(active ? null : l.id)}
                      style={{ textAlign: "left", cursor: "pointer", background: active ? C.ink : C.card, color: active ? "#fff" : C.ink, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "10px 12px", boxShadow: active ? "3px 3px 0 #FACC15" : "3px 3px 0 rgba(10,10,10,.10)" }}>
                      <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title || ("#" + l.id)}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: active ? "#B9B5AA" : C.muted, marginTop: 3 }}>
                        {l.cat === "hafriyat" ? "Hafriyat" : "Silobas"} · {l.il || "—"}{l.varisIl && l.varisIl !== l.il ? ` → ${l.varisIl}` : ""} · {l.owner || "—"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* aday listesi */}
              {sel && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, margin: "2px 0 9px" }}>Kimi Arayayım</div>
                  {adaylar.length === 0 ? (
                    <Empty icon={Target} text="Bu kategoride kayıtlı nakliyeci yok. Önce arz tarafını onboard et." />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {adaylar.map((c, i) => (
                        <div key={c.u.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `2px solid ${c.teklifVerdi ? C.border : c.musait ? C.green : C.ink}`, borderRadius: 6, padding: "9px 12px", boxShadow: c.teklifVerdi ? "none" : c.musait ? "3px 3px 0 #16803C" : "3px 3px 0 rgba(10,10,10,.10)", opacity: c.teklifVerdi ? 0.7 : 1 }}>
                          <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4, background: i === 0 && !c.teklifVerdi ? C.yellow : C.stone, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.ink }}>{i + 1}</span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ minWidth: 0, fontFamily: HEAD, fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.u.name || c.u.email}</span>
                              {c.musait && (
                                <span style={{ flexShrink: 0, background: C.green, color: "#fff", fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.04em", padding: "2px 5px", borderRadius: 3 }}>BUGÜN MÜSAİT</span>
                              )}
                            </div>
                            <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.hc === sel.cat ? "tür ✓" : "tür ?"} · {c.ilUyum ? "bölge ✓" : "bölge ?"} · {c.u.sehir || "il yok"} · {sonGorulme(c.u)}
                              {c.teklifVerdi ? " · zaten teklif verdi" : ""}
                            </div>
                          </div>
                          {c.u.phone ? (
                            <a href={`tel:${c.u.phone}`} style={{ ...btnBase, textDecoration: "none", background: C.green, color: "#fff", padding: "8px 10px" }}>
                              <Phone size={12} strokeWidth={2.6} /> Ara
                            </a>
                          ) : (
                            <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.red, flexShrink: 0 }}>tel yok</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── TALEP: "aradı ama bulamadı" — sonraki saha turunun adresi ── */}
        {/* Bu sekmenin verisi geriye dönük TOPLANAMAZ: kullanıcı arar, ekran
            boş gelir, bilgi buhar olur. Ne kadar erken başlanırsa o kadar
            kıymetli. "Bergama · mıcır · 14 arama" → o ocağı onboard et. */}
        {tab === "talep" && (() => {
          if (searchSignals.length === 0) {
            return <Empty icon={Search} text="Henüz sonuçsuz arama kaydı yok. (Migration koşulmadıysa da boş görünür.)" />;
          }
          const catAd = (c) => (c === "hafriyat" ? "Hafriyat" : c === "silobas" ? "Silobas" : "Tümü");
          // Gruplama: kategori + malzeme + il. Aynı boşluğu kaç FARKLI kişi
          // aradı da ayrıca sayılır — 14 aramanın 1 kişiden gelmesi başka şey.
          const grup = {};
          for (const s of searchSignals) {
            const k = [s.cat || "all", s.material || "", s.il || ""].join("|");
            if (!grup[k]) grup[k] = { cat: s.cat, material: s.material, il: s.il, n: 0, kisi: new Set(), sorgular: new Set(), son: s.createdAt };
            const g = grup[k];
            g.n += 1;
            g.kisi.add(String(s.userId || "anon-" + g.n));
            if (s.q) g.sorgular.add(s.q);
            if (!g.son || String(s.createdAt) > String(g.son)) g.son = s.createdAt;
          }
          const rows = Object.values(grup).sort((a, b) => b.n - a.n).slice(0, 30);
          const hafta = searchSignals.filter((s) => within(s.createdAt, 7)).length;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, lineHeight: 1.5 }}>
                Sonuçsuz aramalar. Her satır “bu bölgede bu malı arayan var ama arz yok” demektir — sıradaki ocak ziyaretinin adresi.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 9 }}>
                {[{ label: "Boş Arama · 7g", value: hafta }, { label: "Farklı Boşluk", value: Object.keys(grup).length }].map((k) => (
                  <div key={k.label} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "12px", boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
                    <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, lineHeight: 1, color: k.value ? C.red : C.ink }}>{k.value}</div>
                    <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: C.muted, marginTop: 6 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rows.map((g, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "10px 12px", boxShadow: "3px 3px 0 rgba(10,10,10,.10)" }}>
                    <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 4, background: i === 0 ? C.yellow : C.stone, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.ink }}>{i + 1}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: HEAD, fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {[g.il || "il farketmez", g.material || catAd(g.cat)].filter(Boolean).join(" · ")}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {catAd(g.cat)} · {g.kisi.size} kişi · son: {fmt(g.son)}
                        {g.sorgular.size ? ` · “${[...g.sorgular].slice(0, 2).join("”, “")}”` : ""}
                      </div>
                    </div>
                    <span style={{ flexShrink: 0, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.red }}>{g.n} arama</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── ŞİKAYETLER ── */}
        {tab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {reports.length === 0 ? <Empty icon={Flag} text="Şikayet yok." /> : reports.map((r) => {
              const st = REPORT_STATUS[r.status] || REPORT_STATUS.acik;
              // Hızlı aksiyon hedefleri: şikayete konu ilan / üye (backend hazır, tek dokunuş).
              const rl = r.listingId ? listings.find((l) => String(l.id) === String(r.listingId)) : null;
              const rlHidden = rl?.status === "kapali";
              const ru = r.type === "user" && r.targetId ? users.find((u) => String(u.id) === String(r.targetId)) : null;
              const ruBanned = ru?.status === "banli";
              return (
                <div key={r.id} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 14, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, lineHeight: 1.2 }}>{r.reason}</div>
                    <Badge bg={st.bg} fg={st.fg} dot>{st.label}</Badge>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.sub, marginTop: 7 }}>
                    {shortId(r.id)} · {({ user: "Kullanıcı", mola: "Mola", forum: "Sohbet" }[r.type] || "İlan")} · {r.fromName || "misafir"} · {fmt(r.createdAt)}
                  </div>
                  {r.description && (
                    <p style={{ margin: "10px 0 0", background: C.stone, border: `2px solid ${C.border}`, borderRadius: 5, padding: "9px 11px", fontFamily: BODY, fontSize: 13, color: C.ink, lineHeight: 1.45 }}>{r.description}</p>
                  )}
                  {r.listingId && (
                    <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 7 }}>İlgili ilan: {titleOf(r.listingId)}</div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                    {rl && (
                      <button onClick={() => { onUpdateListing?.(rl.id, { status: rlHidden ? "aktif" : "kapali" }); onLog?.("listing", `Şikayet ${shortId(r.id)}: "${rl.title || rl.id}" ${rlHidden ? "yayına alındı" : "GİZLENDİ"}`); toast?.(rlHidden ? "İlan yayına alındı" : "İlan gizlendi", "success"); }}
                        style={{ ...btnBase, background: rlHidden ? C.green : C.red, color: "#fff" }}>
                        {rlHidden ? <Eye size={13} strokeWidth={2.4} /> : <Trash2 size={13} strokeWidth={2.4} />} {rlHidden ? "İlanı Yayınla" : "İlanı Gizle"}
                      </button>
                    )}
                    {ru && (
                      <button onClick={() => { doUserAction(ru.id, { status: ruBanned ? "aktif" : "banli" }, ruBanned ? "Ban kaldırıldı" : "Üye banlandı"); onLog?.("user", `Şikayet ${shortId(r.id)}: ${ru.name} ${ruBanned ? "banı kaldırıldı" : "BANLANDI"}`); }}
                        style={{ ...btnBase, background: ruBanned ? C.green : C.red, color: "#fff" }}>
                        <Ban size={13} strokeWidth={2.4} /> {ruBanned ? "Banı Kaldır" : "Üyeyi Banla"}
                      </button>
                    )}
                    <button onClick={() => onSetReportStatus?.(r.id, "inceleniyor")} style={btnBase}>
                      <Eye size={13} strokeWidth={2.4} /> İncele
                    </button>
                    <button onClick={() => onSetReportStatus?.(r.id, "kapali")} style={{ ...btnBase, background: C.stone }}>
                      <CheckCircle2 size={13} strokeWidth={2.4} /> Kapat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BELGELER ── */}
        {tab === "docs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {docs.length === 0 ? <Empty icon={FileText} text="Yüklenmiş belge yok." /> : docs.map((d) => {
              const status = d.status || "beklemede";
              const isImg = String(d.dataUrl || d.url || "").startsWith("data:image");
              return (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 11, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 12, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
                  {isImg ? (
                    <img src={d.dataUrl || d.url} alt="" style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 5, border: `2px solid ${C.ink}`, objectFit: "cover" }} />
                  ) : (
                    <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 5, background: C.stone, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={20} color={C.ink} strokeWidth={2.2} />
                    </span>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.type}</div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                  </div>
                  {status === "dogrulandi" ? (
                    <Badge bg={C.green} fg="#fff"><Check size={11} strokeWidth={3} /> Onaylı</Badge>
                  ) : status === "red" ? (
                    <Badge bg={C.red} fg="#fff"><X size={11} strokeWidth={3} /> Reddedildi</Badge>
                  ) : (
                    <div style={{ display: "flex", flexShrink: 0, gap: 6 }}>
                      <button onClick={() => onReviewDoc?.(d.id, "dogrulandi")} style={{ ...btnBase, background: C.green, color: "#fff", padding: "8px 10px" }}>
                        <FileCheck2 size={13} strokeWidth={2.4} /> Doğrula
                      </button>
                      <button onClick={() => onReviewDoc?.(d.id, "red")} style={{ ...btnBase, background: C.red, color: "#fff", padding: "8px 10px" }}>
                        <X size={13} strokeWidth={2.6} /> Reddet
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── KULLANICILAR ── */}
        {/* ── İTİRAZ / ANLAŞMAZLIK KUYRUĞU ── */}
        {tab === "disputes" && (() => {
          const open = listings.filter((l) => l.deliveryProof?.status === "itiraz");
          if (open.length === 0) return <Empty icon={Scale} text="Açık anlaşmazlık yok." />;
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {open.map((l) => {
                const p = l.deliveryProof || {};
                const dev = l.amount && p.tonnage ? Math.round((p.tonnage - l.amount) / l.amount * 100) : null;
                return (
                  <div key={l.id} style={{ background: C.card, border: `2px solid ${C.red}`, borderRadius: 6, padding: 14, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 800, textTransform: "uppercase", color: C.ink, lineHeight: 1.2 }}>{l.title || ("#" + l.id)}</span>
                      <Badge bg={C.red} fg="#fff" dot>İTİRAZ</Badge>
                    </div>
                    <div style={{ background: C.stone, border: `2px solid ${C.border}`, borderRadius: 5, padding: "10px 12px", marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12 }}>
                        <span style={{ color: C.sub }}>Teslim edilen</span>
                        <span style={{ fontWeight: 700, color: C.ink }}>{p.tonnage} {(p.unit || "ton").toUpperCase()}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 12 }}>
                        <span style={{ color: C.sub }}>İlandaki miktar</span>
                        <span style={{ fontWeight: 700, color: dev && Math.abs(dev) > 5 ? C.red : C.ink }}>{l.amount} {(l.unit || "ton").toUpperCase()}{dev ? ` (${dev > 0 ? "+" : ""}${dev}%)` : ""}</span>
                      </div>
                      {p.ticketNo && <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>Kantar fişi: {p.ticketNo} · Nakliyeci: {p.byName}</div>}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.sub, margin: "11px 0 9px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <AlertTriangle size={13} color={C.red} /> Emanette {fmtTL(Number(l.paymentAmount) || 0)} · hakem kararı bekliyor
                    </div>
                    <div style={{ display: "flex", gap: 9 }}>
                      <button onClick={() => onResolveDispute?.(l, false)}
                        style={{ flex: 1, ...btnBase, justifyContent: "center", background: C.card, color: C.ink, padding: "11px 0" }}>
                        Alıcı lehine · İade
                      </button>
                      <button onClick={() => onResolveDispute?.(l, true)}
                        style={{ flex: 1, ...btnBase, justifyContent: "center", background: C.green, color: "#fff", padding: "11px 0" }}>
                        Nakliyeci lehine · Öde
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── İLAN MODERASYONU ── */}
        {tab === "listings" && (() => {
          const fq = lq.trim().toLowerCase();
          const base = onlyFlagged ? flaggedListings : listings;
          const rows = base.filter((l) => !fq || `${l.title || ""} ${l.il || ""} ${l.owner || ""}`.toLowerCase().includes(fq));
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "0 11px", height: 42 }}>
                <Eye size={16} color={C.sub} strokeWidth={2.4} />
                <input value={lq} onChange={(e) => setLq(e.target.value)} placeholder="Başlık · il · firma ara"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.ink }} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{rows.length}</span>
              </div>
              {/* DÜZENLİ SEFERLER — üye uygulamayı hiç açmasa da sırası gelen
                  tekrar açılsın. Sunucu zaten atomik; buradan tetiklemek saha
                  turunda "bu hafta ki seferler düştü mü" sorusunu 1 dokunuşa indirir. */}
              {onRunRecurrences && (
                <button onClick={runRecurrings} disabled={recurBusy}
                  style={{ ...btnBase, justifyContent: "center", padding: "10px 12px", opacity: recurBusy ? 0.6 : 1 }}>
                  <RotateCw size={13} strokeWidth={2.4} /> {recurBusy ? "İşleniyor…" : "Düzenli seferleri işlet"}
                </button>
              )}
              {/* KALİTE KUYRUĞU — eksik bilgili aktif ilanlar: telefonla arayıp düzelttirmek için */}
              <button onClick={() => setOnlyFlagged((v) => !v)}
                style={{ ...btnBase, justifyContent: "center", background: onlyFlagged ? C.red : C.card, color: onlyFlagged ? "#fff" : C.ink, padding: "10px 12px" }}>
                <AlertTriangle size={13} strokeWidth={2.4} /> Kalite kuyruğu ({flaggedListings.length})
              </button>
              {onlyFlagged && (
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, lineHeight: 1.5, marginTop: -4 }}>
                  Fiyatı/açıklaması/miktarı eksik ya da sahibinin telefonu olmayan AKTİF ilanlar. Ara, düzelttir, ilan işe yarasın.
                </div>
              )}
              {rows.length === 0 ? <Empty icon={FileText} text={!onlyFlagged ? "İlan bulunamadı." : fq ? "Aramaya uyan bayraklı ilan yok — aramayı temizle." : "Kuyruk temiz — eksik bilgili aktif ilan yok."} /> : rows.slice(0, 50).map((l) => {
                const hidden = l.status === "kapali";
                const flags = kaliteBayraklari(l, ownerById);
                const owner = ownerById[String(l.ownerId)];
                return (
                  <div key={l.id} style={{ background: C.card, border: `2px solid ${l.featured ? C.yellow : C.ink}`, borderRadius: 6, padding: 12, boxShadow: l.featured ? "3px 3px 0 #FACC15" : "3px 3px 0 rgba(10,10,10,.10)", opacity: hidden ? 0.6 : 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: HEAD, fontSize: 13.5, fontWeight: 800, textTransform: "uppercase", color: C.ink, lineHeight: 1.2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title || ("#" + l.id)}</span>
                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        {l.featured && <Badge bg={C.yellow} fg={C.ink} dot>SPONSORLU</Badge>}
                        {hidden && <Badge bg={C.sub} fg="#fff">GİZLİ</Badge>}
                      </div>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 6 }}>
                      {l.cat === "hafriyat" ? "Hafriyat" : "Silobas"} · {l.type === "arac" ? "Araç" : l.type === "urun" ? "Ürün" : "İş"} · {l.il || "—"} · {l.owner || "—"} · {shortId(l.id)}
                    </div>
                    {/* kalite bayrakları + sahibini tek dokunuşla ara */}
                    {flags.length > 0 && l.status === "aktif" && (
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 8 }}>
                        {flags.map((f) => (
                          <span key={f} style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", background: "#FDECEC", color: C.red, border: `1.5px solid ${C.red}`, borderRadius: 4, padding: "2px 6px" }}>{f}</span>
                        ))}
                        {owner?.phone && (
                          <a href={`tel:${owner.phone}`} style={{ ...btnBase, textDecoration: "none", background: C.green, color: "#fff", padding: "5px 8px", fontSize: 10 }}>
                            <Phone size={11} strokeWidth={2.6} /> Sahibini ara
                          </a>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 7, marginTop: 11, paddingTop: 10, borderTop: `1.5px solid ${C.border}` }}>
                      <button onClick={() => { onUpdateListing?.(l.id, { featured: !l.featured }); onLog?.("listing", `${l.title || l.id}: ${l.featured ? "öne çıkarma kaldırıldı" : "ÖNE ÇIKARILDI"}`); }}
                        style={{ ...btnBase, flex: 1, justifyContent: "center", background: l.featured ? C.yellow : C.card }}>
                        <Flag size={12} strokeWidth={2.4} /> {l.featured ? "Kaldır" : "Öne çıkar"}
                      </button>
                      <button onClick={() => { onUpdateListing?.(l.id, { status: hidden ? "aktif" : "kapali" }); onLog?.("listing", `${l.title || l.id}: ${hidden ? "yayına alındı" : "gizlendi"}`); }}
                        style={{ ...btnBase, flex: 1, justifyContent: "center", background: hidden ? C.green : C.card, color: hidden ? "#fff" : C.ink }}>
                        {hidden ? <Eye size={12} strokeWidth={2.4} /> : <Trash2 size={12} strokeWidth={2.4} />} {hidden ? "Yayınla" : "Gizle"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── DUYURU / KAMPANYA ── */}
        {tab === "announce" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 16, boxShadow: "3px 3px 0 rgba(10,10,10,.12)", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* aktif toggle */}
              <button type="button" onClick={() => setAnn((a) => ({ ...a, active: !a.active }))}
                style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontFamily: HEAD, fontSize: 15, fontWeight: 900, textTransform: "uppercase", color: ann.active ? C.green : C.ink }}>Ana sayfa duyurusu</span>
                  <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, color: C.muted, marginTop: 1 }}>Tüm ziyaretçilere ana sayfada gösterilir.</span>
                </span>
                <span style={{ width: 46, height: 26, flexShrink: 0, display: "flex", alignItems: "center", borderRadius: 999, border: `2px solid ${ann.active ? C.green : C.ink}`, background: ann.active ? C.green : C.card, padding: 2, justifyContent: ann.active ? "flex-end" : "flex-start" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: ann.active ? "#fff" : C.ink }} />
                </span>
              </button>

              <div>
                <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", marginBottom: 6 }}>METİN</label>
                <textarea value={ann.text} onChange={(e) => setAnn((a) => ({ ...a, text: e.target.value }))} maxLength={140}
                  placeholder="Örn: Bu ay tüm işlerde komisyon %5! Hemen ilan ver."
                  style={{ width: "100%", boxSizing: "border-box", minHeight: 64, resize: "vertical", background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "10px 12px", fontFamily: BODY, fontSize: 13, fontWeight: 600, color: C.ink, outline: "none" }} />
                <div style={{ textAlign: "right", fontFamily: MONO, fontSize: 9.5, color: C.muted, marginTop: 3 }}>{ann.text.length}/140</div>
              </div>

              <div>
                <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", marginBottom: 6 }}>TÜR</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {ANN_TONES.map(([id, lbl, bg, fg]) => (
                    <button key={id} onClick={() => setAnn((a) => ({ ...a, tone: id }))}
                      style={{ flex: 1, cursor: "pointer", padding: "9px 0", borderRadius: 5, border: `2px solid ${C.ink}`, background: ann.tone === id ? bg : C.card, color: ann.tone === id ? fg : C.ink, fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>{lbl}</button>
                  ))}
                </div>
              </div>

              {/* ── HEDEFLEME: rol + il. İkisi de boşsa duyuru HERKESE gider. ── */}
              {(() => {
                const roles = Array.isArray(ann.roles) ? ann.roles : [];
                const iller = Array.isArray(ann.iller) ? ann.iller : [];
                // İl seçenekleri gerçek veriden: üyelerin şehri + ilanların ili (81 il listesi
                // yerine sahada gerçekten var olanlar — İzmir fazında bu birkaç il demek).
                const ilSecenek = [...new Set([...users.map((u) => u.sehir), ...listings.map((l) => l.il)].filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
                // Erişim: hedefli duyuruyu yalnız giriş yapmış+eşleşen üye görür.
                const erisim = (!roles.length && !iller.length)
                  ? users.length
                  : users.filter((u) => (!roles.length || roles.includes(u.role)) && (!iller.length || iller.includes(u.sehir || ""))).length;
                return (
                  <div>
                    <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", marginBottom: 6 }}>KİME (boş = herkes)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ANN_ROLES.map(([id, lbl]) => {
                        const on = roles.includes(id);
                        return (
                          <button key={id} onClick={() => setAnn((a) => ({ ...a, roles: toggleIn(a.roles, id) }))}
                            style={{ cursor: "pointer", padding: "7px 11px", borderRadius: 5, border: `2px solid ${C.ink}`, background: on ? C.ink : C.card, color: on ? C.yellow : C.ink, fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>{lbl}</button>
                        );
                      })}
                    </div>
                    {ilSecenek.length > 0 && (
                      <>
                        <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.sub, display: "block", margin: "12px 0 6px" }}>HANGİ İL (boş = hepsi)</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {ilSecenek.map((il) => {
                            const on = iller.includes(il);
                            return (
                              <button key={il} onClick={() => setAnn((a) => ({ ...a, iller: toggleIn(a.iller, il) }))}
                                style={{ cursor: "pointer", padding: "7px 11px", borderRadius: 5, border: `2px solid ${C.ink}`, background: on ? C.yellow : C.card, color: C.ink, fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>{il}</button>
                            );
                          })}
                        </div>
                      </>
                    )}
                    {/* Erişim 0 ise SEBEBİNİ söyle: il seçenekleri ilan illerinden de üretiliyor,
                        o ilde ilan olsa bile profiline şehir yazmış üye olmayabilir. */}
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, background: (roles.length || iller.length) && erisim === 0 ? "#FDECEC" : C.stone, border: `2px solid ${(roles.length || iller.length) && erisim === 0 ? C.red : C.border}`, borderRadius: 5, padding: "8px 11px" }}>
                      <Target size={13} color={(roles.length || iller.length) && erisim === 0 ? C.red : C.sub} strokeWidth={2.4} />
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: (roles.length || iller.length) && erisim === 0 ? C.red : C.sub, lineHeight: 1.45 }}>
                        {!(roles.length || iller.length)
                          ? `Herkese görünür — ${users.length || "tüm"} üye + ziyaretçiler`
                          : erisim === 0
                            ? "Bu hedefte üye yok — duyuru KİMSEYE görünmez. (İl hedefi profilindeki şehre bakar; üyeler şehrini doldurmamış olabilir.)"
                            : `${erisim} üyeye görünür (hedefli — kayıtsız ziyaretçi görmez)`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* canlı önizleme */}
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginBottom: 6 }}>ÖNİZLEME</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: tone[2], border: `2px solid ${C.ink}`, borderRadius: 6, padding: "10px 12px" }}>
                  <span style={{ width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: tone[3], color: tone[2], fontFamily: HEAD, fontWeight: 900, fontSize: 12 }}>{ann.tone === "promo" ? "★" : ann.tone === "warn" ? "!" : "i"}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: tone[3] }}>{ann.text || "Duyuru metni burada görünür"}</span>
                </div>
              </div>

              <button onClick={saveAnn}
                style={{ ...btnBase, justifyContent: "center", background: C.ink, color: C.yellow, padding: "13px 0", fontSize: 13 }}>
                {annSaved ? "KAYDEDİLDİ ✓" : "DUYURUYU KAYDET"}
              </button>
            </div>
          </div>
        )}

        {tab === "users" && (() => {
          // ── SEGMENT + ARAMA: 50+ üyeden sonra kaydırarak bulmak imkânsızlaşır.
          //    CRM notunun değeri ancak filtreyle katlanır ("bugün kimi arayacağım").
          const uq2 = uq.trim().toLowerCase();
          const eslesmisIds = new Set();
          for (const l of listings) {
            if (l.status === "eslesti" || l.status === "kapali") {
              eslesmisIds.add(String(l.ownerId));
              if (l.acceptedById) eslesmisIds.add(String(l.acceptedById));
            }
          }
          const ilanAcanIds = new Set(listings.map((l) => String(l.ownerId)));
          const SEG = {
            hepsi: () => true,
            // Damgası olmayan üye "kaçmış" değildir: kayıt tarihine düşülür.
            uyuyan: (u) => !within(aktiflik(u), 7),
            ilansiz: (u) => !ilanAcanIds.has(String(u.id)),
            eslesmemis: (u) => ilanAcanIds.has(String(u.id)) && !eslesmisIds.has(String(u.id)),
            telsiz: (u) => !isValidPhone(u.phone),
            // Bugün boş kapasitesini BEYAN edenler — arama turunun ilk sırası.
            musait: (u) => musaitMi(u),
            banli: (u) => u.status === "banli",
          };
          const SEG_ETIKET = [["hepsi", "Hepsi"], ["musait", "Bugün müsait"], ["uyuyan", "7g girmedi"], ["ilansiz", "İlan açmadı"], ["eslesmemis", "Eşleşmedi"], ["telsiz", "Telefonsuz"], ["banli", "Banlı"]];
          // Çip sayıları rol filtresi + aramadan SONRAKİ küme üzerinden sayılır —
          // aksi halde çipte 12 yazarken listede 3 satır çıkıyordu.
          const havuz = users
            .filter((u) => uRole === "hepsi" || u.role === uRole)
            .filter((u) => !uq2 || `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.sehir || ""}`.toLowerCase().includes(uq2));
          const sayi = (k) => havuz.filter(SEG[k]).length;
          const rows = havuz.filter(SEG[uSeg] || SEG.hepsi);
          return (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {users.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "0 11px", height: 42 }}>
                  <Eye size={16} color={C.sub} strokeWidth={2.4} />
                  <input value={uq} onChange={(e) => setUq(e.target.value)} placeholder="Ad · e-posta · telefon · il ara"
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.ink }} />
                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{rows.length}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SEG_ETIKET.map(([k, lbl]) => {
                    const on = uSeg === k;
                    return (
                      <button key={k} onClick={() => setUSeg(k)}
                        style={{ cursor: "pointer", padding: "7px 10px", borderRadius: 5, border: `2px solid ${C.ink}`, background: on ? C.ink : C.card, color: on ? C.yellow : C.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>
                        {lbl} <span style={{ opacity: 0.65 }}>{sayi(k)}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["hepsi", "Tüm roller"], ...ANN_ROLES].map(([k, lbl]) => {
                    const on = uRole === k;
                    return (
                      <button key={k} onClick={() => setURole(k)}
                        style={{ flex: 1, cursor: "pointer", padding: "7px 0", borderRadius: 5, border: `2px solid ${C.ink}`, background: on ? C.yellow : C.card, color: C.ink, fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>{lbl}</button>
                    );
                  })}
                </div>
              </>
            )}
            {users.length === 0 ? <Empty icon={Shield} text="Kullanıcı listesi bu modda görünmüyor." />
              : rows.length === 0 ? <Empty icon={Shield} text="Bu süzgeçte üye yok." />
              : rows.map((u) => {
              const banned = u.status === "banli";
              const nListings = listings.filter((l) => String(l.ownerId) === String(u.id)).length;
              const nOffers = offers.filter((o) => String(o.fromUserId) === String(u.id)).length;
              const nextRole = { isveren: "tedarikci", tedarikci: "nakliyeci", nakliyeci: "isveren" };
              const getiren = u.invitedBy ? ownerById[String(u.invitedBy)] : null;
              const davetSayisi = users.filter((x) => String(x.invitedBy) === String(u.id)).length;
              return (
                <div key={u.id} style={{ background: C.card, border: `2px solid ${banned ? C.red : C.ink}`, borderRadius: 6, padding: 12, boxShadow: "3px 3px 0 rgba(10,10,10,.12)", opacity: banned ? 0.85 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 5, background: banned ? C.red : C.yellow, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontSize: 16, fontWeight: 900, color: banned ? "#fff" : C.ink }}>
                      {(u.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email} · {ROL_ETIKET[u.role] || "rolsüz"} · {nListings} ilan / {nOffers} teklif</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: within(aktiflik(u), 7) ? C.green : C.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} strokeWidth={2.6} /> {sonGorulme(u)}{u.sehir ? ` · ${u.sehir}` : ""}
                      </div>
                      {/* Davet zinciri: bu üyeyi kim getirdi. Saha turunda hangi
                          ocağın/nakliyecinin ağının çalıştığını gösterir. */}
                      {getiren && (
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.sub, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          ↳ getiren: <b style={{ color: C.ink }}>{getiren.name || getiren.email}</b>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexShrink: 0, flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      {banned && <Badge bg={C.red} fg="#fff" dot>BANLI</Badge>}
                      {u.verified && !banned && <Badge bg={C.green} fg="#fff"><Check size={11} strokeWidth={3} /> Onaylı</Badge>}
                      {musaitMi(u) && <Badge bg={C.green} fg="#fff">MÜSAİT</Badge>}
                      {davetSayisi > 0 && <Badge bg={C.yellow} fg={C.ink}>{davetSayisi} davet</Badge>}
                    </div>
                  </div>
                  {/* admin aksiyonları */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12, paddingTop: 11, borderTop: `1.5px solid ${C.border}` }}>
                    <button onClick={() => doUserAction(u.id, { verified: !u.verified }, u.verified ? "Onay kaldırıldı" : "Onaylandı")} style={{ ...btnBase, background: u.verified ? C.stone : C.card }}>
                      <Check size={12} strokeWidth={2.6} /> {u.verified ? "Onayı kaldır" : "Onayla"}
                    </button>
                    <button onClick={() => doUserAction(u.id, { role: nextRole[u.role] || "isveren" }, `Rol → ${nextRole[u.role] || "isveren"}`)} style={{ ...btnBase }}>
                      Rol: {u.role}
                    </button>
                    <button onClick={() => doUserAction(u.id, { status: banned ? "aktif" : "banli" }, banned ? "Ban kaldırıldı" : "Banlandı")}
                      style={{ ...btnBase, background: banned ? C.green : C.red, color: "#fff", border: `2px solid ${C.ink}` }}>
                      <Ban size={12} strokeWidth={2.6} /> {banned ? "Banı kaldır" : "Banla"}
                    </button>
                    {u.phone && (
                      <a href={`tel:${u.phone}`} style={{ ...btnBase, textDecoration: "none", background: C.green, color: "#fff" }}>
                        <Phone size={12} strokeWidth={2.6} /> Ara
                      </a>
                    )}
                    <button onClick={() => (noteOpen === String(u.id) ? setNoteOpen(null) : openNote(u))}
                      style={{ ...btnBase, background: adminNotes[String(u.id)]?.note || adminNotes[String(u.id)]?.nextCall ? C.yellow : C.card }}>
                      <StickyNote size={12} strokeWidth={2.4} /> Not
                    </button>
                    {/* ADINA İLAN — sahada "sen gir benim yerime" anı: onboarding'i
                        telefonda 5 dakikaya indirir. İlan üyenin adına açılır. */}
                    {u.role && !banned && (
                      <button onClick={() => navigate(`/ilan-ver?adina=${u.id}`)} style={{ ...btnBase, background: C.ink, color: C.yellow }}>
                        <PlusCircle size={12} strokeWidth={2.4} /> Adına ilan ver
                      </button>
                    )}
                  </div>
                  {/* CRM notu: satış/onboarding notu + sonraki arama tarihi (yalnız admin görür) */}
                  {noteOpen === String(u.id) && (
                    <div style={{ marginTop: 10, background: C.stone, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
                      <textarea value={noteDraft.note} onChange={(e) => setNoteDraft((d) => ({ ...d, note: e.target.value }))} maxLength={500}
                        placeholder="Görüşme notu: kim, ne konuşuldu, ne söz verildi…"
                        style={{ width: "100%", boxSizing: "border-box", minHeight: 64, resize: "vertical", background: C.card, border: `2px solid ${C.ink}`, borderRadius: 5, padding: "9px 11px", fontFamily: BODY, fontSize: 13, fontWeight: 600, color: C.ink, outline: "none" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.sub, flexShrink: 0 }}>Sonraki arama</label>
                        <input type="date" value={noteDraft.nextCall} onChange={(e) => setNoteDraft((d) => ({ ...d, nextCall: e.target.value }))}
                          style={{ flex: 1, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 5, padding: "7px 9px", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.ink, outline: "none" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => saveNote(u)} style={{ ...btnBase, flex: 1, justifyContent: "center", background: C.ink, color: C.yellow }}>Kaydet</button>
                        <button onClick={() => setNoteOpen(null)} style={{ ...btnBase, justifyContent: "center" }}>Vazgeç</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          );
        })()}

        {/* ── FİYAT: yakıt endeksi + mevsim ── */}
        {tab === "pricing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ── KOMİSYON ORANI (PAYMENTS_ENABLED ile gizli) ── */}
            {PAYMENTS_ENABLED && (
            <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 16, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 36, height: 36, borderRadius: 6, background: C.green, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, color: "#fff", fontSize: 13 }}>%</span>
                <div>
                  <h2 style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0, color: C.ink }}>Platform Komisyonu</h2>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, marginTop: 2 }}>Nakliyeci hakedişinden kesilir. Yeni emanet ödemelerine uygulanır.</div>
                </div>
              </div>
              <div style={{ textAlign: "center", margin: "14px 0 4px" }}>
                <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: C.ink }}>%{Math.round(feeRate * 100)}</span>
              </div>
              <input type="range" min="0.05" max="0.20" step="0.01" value={feeRate}
                onChange={(e) => saveFee(Number(e.target.value))}
                onPointerUp={(e) => saveFee(Number(e.target.value), true)}
                style={{ width: "100%", accentColor: C.ink, margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9.5, color: C.muted }}>
                <span>%5</span><span>%10</span><span>%15</span><span>%20</span>
              </div>
              <div style={{ marginTop: 12, background: C.stone, border: `2px solid ${C.border}`, borderRadius: 5, padding: "9px 11px", fontFamily: MONO, fontSize: 11, color: C.sub }}>
                Örn: ₺10.000 iş → komisyon <b style={{ color: C.ink }}>{fmtTL(10000 * feeRate)}</b> · nakliyeci <b style={{ color: C.green }}>{fmtTL(10000 * (1 - feeRate))}</b>
              </div>
            </div>
            )}

            <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 16, boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
                <span style={{ width: 36, height: 36, borderRadius: 6, background: C.yellow, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Fuel size={18} color={C.ink} strokeWidth={2.4} />
                </span>
                <div>
                  <h2 style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0, color: C.ink }}>Yakıt Endeksi</h2>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.muted, marginTop: 2 }}>Mazot pahalandıkça tüm mesafe maliyeti ölçeklenir.</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6, margin: "14px 0 4px" }}>
                <span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: C.ink }}>×{fuelIndex.toFixed(2)}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: fuelIndex > 1 ? C.red : fuelIndex < 1 ? C.green : C.muted }}>
                  {fuelIndex === 1 ? "nötr" : `${fuelIndex > 1 ? "+" : ""}${Math.round((fuelIndex - 1) * 100)}%`}
                </span>
              </div>

              <input type="range" min="0.8" max="1.4" step="0.01" value={fuelIndex}
                onChange={(e) => saveFuel(Number(e.target.value))}
                onPointerUp={(e) => saveFuel(Number(e.target.value), true)}
                style={{ width: "100%", accentColor: C.ink, margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9.5, color: C.muted }}>
                <span>0.80 ucuz</span><span>1.00</span><span>1.40 pahalı</span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                {[["Ucuz", 0.9], ["Nötr", 1.0], ["Yüksek", 1.15], ["Zam", 1.3]].map(([lbl, v]) => (
                  <button key={lbl} onClick={() => saveFuel(v, true)}
                    style={{ flex: 1, cursor: "pointer", padding: "9px 0", borderRadius: 5, border: `2px solid ${C.ink}`,
                      background: Math.abs(fuelIndex - v) < 0.005 ? C.ink : C.card, color: Math.abs(fuelIndex - v) < 0.005 ? C.yellow : C.ink,
                      fontFamily: MONO, fontSize: 10.5, fontWeight: 700 }}>{lbl}</button>
                ))}
              </div>

              {fuelSaved && (
                <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.green }}>
                  <Check size={13} strokeWidth={3} /> Kaydedildi — tüm akıllı fiyatlar güncellendi.
                </div>
              )}
            </div>

            {/* mevcut sezon endeksi (bilgi) */}
            <div style={{ background: C.stone, border: `2px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: C.muted, marginBottom: 10 }}>BU AYIN SEZON ENDEKSİ (OTOMATİK)</div>
              {["hafriyat", "silobas"].map((c) => {
                const sf = seasonFactor(c);
                return (
                  <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                    <span style={{ fontFamily: HEAD, fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", color: C.ink }}>{c === "hafriyat" ? "Hafriyat" : "Silobas"}</span>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: sf > 1 ? C.red : sf < 1 ? C.green : C.muted }}>
                      ×{sf.toFixed(2)} · {sf >= 1.02 ? "yoğun sezon" : sf <= 0.98 ? "sakin sezon" : "normal"}
                    </span>
                  </div>
                );
              })}
              <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>Sezon ay bazlı otomatik hesaplanır (inşaat/hasat takvimi). Yakıt endeksi elle ayarlanır.</div>
            </div>

            {/* ── EMANET / HAREKET LİSTESİ ── */}
            <div>
              <div style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink, margin: "4px 0 10px" }}>Ödeme Hareketleri</div>
              {(() => {
                const ledger = listings.filter((l) => l.paymentStatus && l.paymentStatus !== "yok");
                if (ledger.length === 0) return <Empty icon={FileText} text="Henüz emanet/ödeme hareketi yok." />;
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {ledger.map((l) => {
                      const b = PAY_BADGE[l.paymentStatus] || PAY_BADGE.bloke;
                      const amt = Number(l.paymentAmount) || 0, fee = Number(l.paymentFee) || 0;
                      return (
                        <div key={l.id} style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 12, boxShadow: "3px 3px 0 rgba(10,10,10,.10)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                            <span style={{ fontFamily: HEAD, fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: C.ink, lineHeight: 1.2, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title || ("#" + l.id)}</span>
                            <Badge bg={b.bg} fg={b.fg} dot>{b.label}</Badge>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontFamily: MONO, fontSize: 11.5 }}>
                            <span style={{ color: C.sub }}>Tutar <b style={{ color: C.ink }}>{fmtTL(amt)}</b></span>
                            <span style={{ color: C.sub }}>Komisyon <b style={{ color: C.green }}>{fmtTL(fee)}</b></span>
                            <span style={{ color: C.sub }}>{shortId(l.id)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── DENETİM KAYDI (AUDIT LOG) + silinen hesaplar ── */}
        {tab === "audit" && deletedAccounts.length > 0 && (
          <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: 13, boxShadow: "3px 3px 0 rgba(10,10,10,.10)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
              <UserX size={14} color={C.red} strokeWidth={2.4} />
              <span style={{ fontFamily: HEAD, fontSize: 12.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", color: C.ink }}>Silinen Hesaplar (PII'siz)</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {deletedAccounts.slice(0, 20).map((d) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: C.sub, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: C.ink }}>{d.role || "rol yok"}</span>
                  <span>{fmt(d.deletedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "audit" && (
          audit.length === 0 ? <Empty icon={ScrollText} text="Henüz admin işlemi kaydedilmedi." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {audit.map((a) => {
                const tone = a.action === "dispute" ? C.red : a.action === "config" ? C.green : a.action === "user" ? C.yellow : C.stone;
                const fg = a.action === "config" || a.action === "dispute" ? "#fff" : C.ink;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "10px 12px", boxShadow: "3px 3px 0 rgba(10,10,10,.10)" }}>
                    <span style={{ flexShrink: 0, marginTop: 1, fontFamily: MONO, fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", background: tone, color: fg, border: `2px solid ${C.ink}`, borderRadius: 4, padding: "3px 7px" }}>
                      {a.action}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{a.detail}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 3 }}>{a.adminName} · {fmt(a.at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// Status / state badge: mono uppercase, 2px ink frame.
function Badge({ children, bg, fg, dot }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
      background: bg, color: fg, border: `2px solid ${C.ink}`, borderRadius: 5,
      padding: "3px 7px", fontFamily: MONO, fontSize: 10, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 1, whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ fontSize: 9 }}>●</span>}
      {children}
    </span>
  );
}

function Empty({ icon: Icon, text }) {
  return (
    <div style={{ background: C.card, border: `2px solid ${C.ink}`, borderRadius: 6, padding: "44px 16px", textAlign: "center", boxShadow: "3px 3px 0 rgba(10,10,10,.12)" }}>
      {Icon && <Icon size={30} color={C.muted} strokeWidth={2} style={{ margin: "0 auto 10px", display: "block" }} />}
      <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>{text}</div>
    </div>
  );
}
