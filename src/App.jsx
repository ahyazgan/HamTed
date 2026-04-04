import { useState, useEffect } from "react";

// ═══ DATA ═══
const CATS = [
  { id: "celik", name: "Celik / Demir", icon: "⚙️", clr: "#C85A24" },
  { id: "cimento", name: "Cimento / Insaat", icon: "🏗️", clr: "#3D8B4F" },
  { id: "kimyasal", name: "Kimyasal / Polimer", icon: "🧪", clr: "#2E6FA3" },
  { id: "tekstil", name: "Tekstil", icon: "🧵", clr: "#7B5090" },
  { id: "gida", name: "Gida Hammadde", icon: "🌾", clr: "#A07828" },
  { id: "enerji", name: "Enerji / Yakit", icon: "⚡", clr: "#B0423A" },
];

const PRODUCTS = [
  { id:1, cat:"celik", name:"HRP Sac — Sicak Haddelenmis", unit:"ton", cost:17200, price:18500, minQty:5, supplier:"Marmara Celik Servis", delivery:"3-5 is gunu", desc:"S235JR · 2-12mm kalinlik · 1500mm genislik · Rulo/levha", pt:"fixed", promo:true },
  { id:2, cat:"celik", name:"Nervurlu Insaat Demiri (TMT)", unit:"ton", cost:15100, price:16200, minQty:10, supplier:"Karadeniz Demir Ticaret", delivery:"2-4 is gunu", desc:"B420C · 8-32mm cap · 12m boy · TSE belgeli", pt:"fixed", promo:false },
  { id:3, cat:"celik", name:"Kutu Profil 40x40", unit:"ton", cost:19600, price:21000, minQty:3, supplier:"Marmara Celik Servis", delivery:"3-5 is gunu", desc:"S235JRH · 1.5-4mm et kalinligi · 6m boy", pt:"fixed", promo:false },
  { id:4, cat:"celik", name:"Galvanizli Sac Rulo", unit:"ton", cost:22800, price:24500, minQty:5, supplier:"Ege Metal Dagitim", delivery:"5-7 is gunu", desc:"DX51D+Z · Z100-Z275 · 0.3-2mm kalinlik", pt:"fixed", promo:true },
  { id:5, cat:"celik", name:"Paslanmaz Celik Levha 304", unit:"ton", cost:63500, price:68000, minQty:1, supplier:"Anadolu Paslanmaz", delivery:"7-10 is gunu", desc:"AISI 304 · 2B/BA finish · 1-6mm", pt:"quote", promo:false },
  { id:6, cat:"cimento", name:"Portland Cimento CEM I 42.5R", unit:"ton", cost:2600, price:2850, minQty:20, supplier:"Bati Anadolu Yapi Malz.", delivery:"1-3 is gunu", desc:"Dokme/torba 50kg · TSE belgeli · Yuksek erken dayanim", pt:"fixed", promo:true },
  { id:7, cat:"cimento", name:"Hazir Beton C30/37", unit:"m\u00B3", cost:2200, price:2400, minQty:8, supplier:"Merkez Beton", delivery:"Ayni gun", desc:"Transmikser · Pompa hizmeti · Istanbul ici", pt:"fixed", promo:false },
  { id:8, cat:"cimento", name:"Kuvars Kumu (Silika)", unit:"ton", cost:1050, price:1200, minQty:25, supplier:"Bati Anadolu Yapi Malz.", delivery:"3-5 is gunu", desc:"0.1-2mm tane · %99.2 SiO2 saflik", pt:"quote", promo:false },
  { id:9, cat:"kimyasal", name:"Polipropilen (PP) Granul", unit:"ton", cost:29800, price:32000, minQty:2, supplier:"Akdeniz Polimer", delivery:"3-5 is gunu", desc:"MH418 · MFI 4-25 · Enjeksiyon/ekstruzyon", pt:"fixed", promo:false },
  { id:10, cat:"kimyasal", name:"HDPE Granul", unit:"ton", cost:27500, price:29500, minQty:2, supplier:"Akdeniz Polimer", delivery:"3-5 is gunu", desc:"F00952 · Film/boru grade · Dogal renk", pt:"fixed", promo:true },
  { id:11, cat:"kimyasal", name:"Sodyum Hidroksit (Kostik)", unit:"ton", cost:7800, price:8500, minQty:5, supplier:"Ic Anadolu Kimya", delivery:"2-4 is gunu", desc:"%50 sivi · IBC tank veya tanker", pt:"fixed", promo:false },
  { id:12, cat:"kimyasal", name:"Epoksi Recine", unit:"ton", cost:42000, price:46000, minQty:1, supplier:"Ic Anadolu Kimya", delivery:"5-7 is gunu", desc:"Bisphenol A bazli · Dokum/kaplama · 20kg teneke", pt:"quote", promo:false },
  { id:13, cat:"tekstil", name:"Pamuk Ipligi Ne 30/1", unit:"ton", cost:135000, price:145000, minQty:1, supplier:"Cukurova Tekstil", delivery:"5-7 is gunu", desc:"Ring egirme · %100 pamuk · Beyaz", pt:"quote", promo:false },
  { id:14, cat:"gida", name:"Bugday Unu (Tip 650)", unit:"ton", cost:13200, price:14500, minQty:5, supplier:"Trakya Gida Hammadde", delivery:"2-3 is gunu", desc:"Ekmeklik kalite · 50kg cuval · TSE", pt:"fixed", promo:false },
  { id:15, cat:"enerji", name:"Fuel Oil No:4", unit:"ton", cost:20500, price:22000, minQty:10, supplier:"Akaryakit Tedarik", delivery:"3-5 is gunu", desc:"Kalorifer yakiti · Tanker teslimat", pt:"quote", promo:false },
  { id:16, cat:"celik", name:"DKP Sac — Soguk Hadde", unit:"ton", cost:21000, price:22500, minQty:3, supplier:"Marmara Celik Servis", delivery:"3-5 is gunu", desc:"DC01 · 0.4-3mm · Rulo/levha", pt:"fixed", promo:false },
];

const SHIP = [
  { id:"std", name:"Standart", days:"5-7 is gunu", cost:350, price:480 },
  { id:"exp", name:"Hizli", days:"2-3 is gunu", cost:600, price:850 },
  { id:"pick", name:"Fabrikadan Teslim", days:"Anlasmaya gore", cost:0, price:0 },
];

const fmt = n => new Intl.NumberFormat("tr-TR").format(Math.round(n));

// ═══ THEME — Light ═══
const C = {
  bg: "#FAFAF8", card: "#FFFFFF", border: "#E8E5DF", borderLight: "#F0EDE8",
  accent: "#C85A24", accentBg: "#C85A2410", accentBorder: "#C85A2435",
  text: "#1A1918", textSec: "#6B6860", textTer: "#A09E96",
  green: "#2E7D42", greenBg: "#E8F5E9", blue: "#2E6FA3", blueBg: "#E3F2FD",
  amber: "#A07828", amberBg: "#FFF8E1", red: "#B0423A",
  heroBg: "linear-gradient(135deg, #FDF6F0 0%, #FAFAF8 40%, #F0F7F2 100%)",
  shadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
  shadowHover: "0 8px 25px rgba(0,0,0,.08), 0 3px 10px rgba(0,0,0,.05)",
};

export default function App() {
  const [cat, setCat] = useState(null);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState([]);
  const [modal, setModal] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null);
  const [qtys, setQtys] = useState({});
  const [ship, setShip] = useState("std");
  const [admin, setAdmin] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [heroVis, setHeroVis] = useState(false);

  useEffect(() => { setTimeout(() => setHeroVis(true), 100); }, []);

  const prods = [...PRODUCTS]
    .filter(p => (!cat || p.cat === cat) && (!q || (p.name + p.supplier + p.desc).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.promo ? 1 : 0) - (a.promo ? 1 : 0));

  const addCart = p => {
    const qty = qtys[p.id] || p.minQty;
    const ex = cart.find(c => c.id === p.id);
    if (ex) setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + qty } : c));
    else setCart([...cart, { ...p, qty }]);
  };

  const subT = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const totW = cart.reduce((s, c) => s + c.qty, 0);
  const sh = SHIP.find(s => s.id === ship);
  const shC = (sh?.price || 0) * totW;
  const grand = subT + shC;
  const tM = cart.reduce((s, c) => s + (c.price - c.cost) * c.qty, 0);
  const lM = (sh ? (sh.price - sh.cost) : 0) * totW;

  const doOrder = () => { setOrdered(true); setTimeout(() => { setOrdered(false); setCart([]); setShowCart(false); }, 3000); };

  // ═══ RENDER ═══
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, color: C.text, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ══ HEADER ══ */}
      <header style={{ background: "#FFFFFFEE", borderBottom: `1px solid ${C.border}`, padding: "0 20px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(16px)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${C.accent}, #E8864A)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff" }}>H</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: -.5 }}>HamTed</div>
              <div style={{ fontSize: 7.5, color: C.textTer, letterSpacing: 3, fontWeight: 600 }}>HAMMADDE TEDARIK</div>
            </div>
          </div>
          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["Nasil Calisir", "Tedarikci Ol", "Hakkimizda", "Iletisim"].map(t =>
              <button key={t} style={{ background: "transparent", border: "none", color: C.textSec, padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
            )}
            <button onClick={() => setShowCart(!showCart)} style={{ background: showCart ? C.accentBg : "transparent", border: `1px solid ${showCart ? C.accentBorder : "transparent"}`, color: showCart ? C.accent : C.textSec, padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", position: "relative", marginLeft: 4 }}>
              Sepet{cart.length > 0 && <span style={{ background: C.accent, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 10, marginLeft: 5 }}>{cart.length}</span>}
            </button>
            <button style={{ background: C.accent, border: "none", color: "#fff", padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginLeft: 6 }}>Giris Yap</button>
            <button onClick={() => setAdmin(!admin)} style={{ background: admin ? C.greenBg : "transparent", border: `1px solid ${admin ? C.green+"40" : C.border}`, color: admin ? C.green : C.textTer, padding: "3px 8px", borderRadius: 6, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginLeft: 6 }}>{admin ? "ADM" : "Adm"}</button>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 20px 100px" }}>

        {/* ══ HERO ══ */}
        <div style={{ background: C.heroBg, border: `1px solid #E8DFD4`, borderRadius: 20, padding: "52px 44px", marginBottom: 32, position: "relative", overflow: "hidden", opacity: heroVis ? 1 : 0, transform: heroVis ? "none" : "translateY(14px)", transition: "all .7s ease" }}>
          <div style={{ position: "absolute", top: 10, right: 30, fontSize: 160, opacity: .04, fontWeight: 900, letterSpacing: -12, userSelect: "none", color: C.accent }}>HAM</div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", padding: "5px 16px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: 20, fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 18 }}>Turkiye'nin B2B Hammadde Platformu</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.05, color: C.text, maxWidth: 500, letterSpacing: -2, margin: 0 }}>
              Toptan hammadde,<br /><span style={{ color: C.accent }}>uygun fiyatla.</span>
            </h1>
            <p style={{ fontSize: 16, color: C.textSec, marginTop: 14, maxWidth: 420, lineHeight: 1.7 }}>
              Celikten cimentoya, kimyasaldan tekstile — distributor fiyatiyla, kapiniza teslim.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
              {[["16+","Urun"],["6","Kategori"],["50+","Tedarikci"],["Ayni gun","Teslimat"]].map(([n, l]) =>
                <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "10px 18px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadow }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{n}</span>
                  <span style={{ fontSize: 13, color: C.textSec }}>{l}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ SEARCH ══ */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: C.textTer }}>&#x2315;</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Urun, tedarikci veya malzeme ara..." style={{ width: "100%", boxSizing: "border-box", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px 14px 44px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxShadow: C.shadow, transition: "border .2s" }} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.border} />
        </div>

        {/* ══ CATEGORIES ══ */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          <button onClick={() => setCat(null)} style={{ background: !cat ? C.accent : "#fff", border: `1px solid ${!cat ? C.accent : C.border}`, color: !cat ? "#fff" : C.textSec, padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: !cat ? "none" : C.shadow }}>Tumu</button>
          {CATS.map(c =>
            <button key={c.id} onClick={() => setCat(c.id)} style={{ background: cat === c.id ? c.clr+"12" : "#fff", border: `1px solid ${cat === c.id ? c.clr+"50" : C.border}`, color: cat === c.id ? c.clr : C.textSec, padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: C.shadow }}>{c.icon} {c.name}</button>
          )}
        </div>

        {/* ══ PRODUCT GRID ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {prods.map(p => {
            const ct = CATS.find(c => c.id === p.cat);
            const isQ = p.pt === "quote";
            return (
              <div key={p.id} onClick={() => isQ ? setQuoteModal(p) : setModal(p)} style={{
                background: "#fff", border: `1px solid ${p.promo ? C.accentBorder : C.border}`, borderRadius: 16,
                padding: 22, position: "relative", transition: "all .25s", cursor: "pointer",
                boxShadow: C.shadow
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = C.shadowHover; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.accent; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = C.shadow; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = p.promo ? C.accentBorder : C.border; }}
              >
                {p.promo && <div style={{ position: "absolute", top: 14, right: 14 }}><span style={{ background: C.amberBg, color: C.amber, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>One Cikan</span></div>}
                <div style={{ fontSize: 11, color: C.textTer, letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>{ct?.icon} {ct?.name}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 4, paddingRight: p.promo ? 80 : 0 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.textTer, marginBottom: 10 }}>{p.supplier}</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</div>

                {isQ ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 20px", background: C.blueBg, border: `1px solid ${C.blue}25`, borderRadius: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>Teklif Iste</span>
                    <span style={{ fontSize: 11, color: C.blue+"99" }}>Guncel fiyat icin</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.accent, letterSpacing: -.5 }}>
                    {"\u20BA"}{fmt(p.price)} <span style={{ fontSize: 12, color: C.textTer, fontWeight: 400 }}>/ {p.unit}</span>
                  </div>
                )}

                {admin && (
                  <div style={{ marginTop: 8, padding: "5px 10px", background: C.greenBg, borderRadius: 6, fontSize: 10, color: C.green }}>
                    Alis: {"\u20BA"}{fmt(p.cost)} {"\u2192"} Marj: {"\u20BA"}{fmt(p.price - p.cost)}/{p.unit} ({Math.round(((p.price - p.cost) / p.cost) * 100)}%)
                    {p.promo && " · Reklam: \u20BA15.000/ay"}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.borderLight}` }}>
                  <span style={{ fontSize: 12, color: C.textTer }}>Min {p.minQty} {p.unit} · {p.delivery}</span>
                  <button onClick={e => { e.stopPropagation(); isQ ? setQuoteModal(p) : setModal(p); }} style={{ background: isQ ? C.blue : C.accent, color: "#fff", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {isQ ? "Teklif Iste" : "Sepete Ekle"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {prods.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: C.textTer }}>
            <div style={{ fontSize: 48, marginBottom: 12, opacity: .4 }}>&#x2315;</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Sonuc bulunamadi</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Farkli bir arama deneyin</div>
          </div>
        )}

        {/* ══ TRUST BAR ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 40 }}>
          {[
            ["Guvenli Odeme", "Kredi karti ve havale/EFT ile guvenli odeme. 256-bit SSL sifreleme.", "🔒"],
            ["Kalite Garantisi", "Tum urunler TSE/ISO sertifikali tedarikcilerden. Kalite belgesi dahil.", "✓"],
            ["Hizli Teslimat", "Ayni gun sevkiyat secenegi. Turkiye geneline teslimat.", "⚡"],
            ["7/24 Destek", "WhatsApp ve telefon ile teknik destek. Siparislerinizi anlik takip.", "💬"],
          ].map(([t, d, i]) => (
            <div key={t} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", boxShadow: C.shadow }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{i}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{t}</div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PRODUCT MODAL — fixed price ══ */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }} onClick={() => setModal(null)}>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, maxWidth: 520, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 32, position: "relative", boxShadow: "0 25px 60px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)} style={{ position: "absolute", top: 16, right: 16, background: C.bg, border: `1px solid ${C.border}`, color: C.textTer, width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#x2715;</button>

            <div style={{ fontSize: 10, color: C.textTer, letterSpacing: 1.2, fontWeight: 600, marginBottom: 8 }}>{CATS.find(c => c.id === modal.cat)?.icon} {CATS.find(c => c.id === modal.cat)?.name}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 4px", letterSpacing: -.5 }}>{modal.name}</h3>
            <div style={{ fontSize: 13, color: C.textTer, marginBottom: 16 }}>{modal.supplier}</div>

            <div style={{ fontSize: 13, color: C.textSec, padding: 16, background: C.bg, borderRadius: 10, marginBottom: 18, lineHeight: 1.7 }}>{modal.desc}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[["Birim Fiyat", `\u20BA${fmt(modal.price)}/${modal.unit}`], ["Min. Siparis", `${modal.minQty} ${modal.unit}`], ["Teslimat", modal.delivery], ["Odeme", "Pesin / Kredi Karti"]].map(([l, v]) => (
                <div key={l} style={{ background: C.bg, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 10, color: C.textTer, letterSpacing: .8, fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600, display: "block", marginBottom: 6 }}>Miktar ({modal.unit})</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button style={{ width: 40, height: 40, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 18, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setQtys({ ...qtys, [modal.id]: Math.max(modal.minQty, (qtys[modal.id] || modal.minQty) - modal.minQty) })}>&#x2212;</button>
                <input type="number" value={qtys[modal.id] || modal.minQty} onChange={e => setQtys({ ...qtys, [modal.id]: Math.max(modal.minQty, parseInt(e.target.value) || modal.minQty) })} style={{ width: 80, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 18, fontWeight: 700, textAlign: "center", fontFamily: "inherit", outline: "none" }} />
                <button style={{ width: 40, height: 40, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 18, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setQtys({ ...qtys, [modal.id]: (qtys[modal.id] || modal.minQty) + modal.minQty })}>+</button>
                <span style={{ fontSize: 13, color: C.textTer }}>{modal.unit}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: `1px solid ${C.borderLight}` }}>
              <div>
                <div style={{ fontSize: 12, color: C.textTer }}>Toplam Tutar</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.accent, letterSpacing: -1 }}>{"\u20BA"}{fmt(modal.price * (qtys[modal.id] || modal.minQty))}</div>
              </div>
              <button onClick={() => { addCart(modal); setModal(null); }} style={{ background: C.accent, color: "#fff", border: "none", padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 16px ${C.accent}35` }}>Sepete Ekle</button>
            </div>

            {admin && <div style={{ marginTop: 12, padding: "6px 10px", background: C.greenBg, borderRadius: 6, fontSize: 10, color: C.green }}>Marj: {"\u20BA"}{fmt((modal.price - modal.cost) * (qtys[modal.id] || modal.minQty))} ({Math.round(((modal.price - modal.cost) / modal.cost) * 100)}%)</div>}
          </div>
        </div>
      )}

      {/* ══ QUOTE MODAL — teklif iste ══ */}
      {quoteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }} onClick={() => { setQuoteModal(null); setQuoteSent(false); }}>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 20, maxWidth: 480, width: "100%", padding: 32, position: "relative", boxShadow: "0 25px 60px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => { setQuoteModal(null); setQuoteSent(false); }} style={{ position: "absolute", top: 16, right: 16, background: C.bg, border: `1px solid ${C.border}`, color: C.textTer, width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>&#x2715;</button>

            <div style={{ display: "inline-flex", padding: "4px 14px", background: C.blueBg, borderRadius: 6, fontSize: 11, color: C.blue, fontWeight: 700, marginBottom: 14 }}>Teklif Talebi</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 4px" }}>{quoteModal.name}</h3>
            <div style={{ fontSize: 12, color: C.textTer, marginBottom: 20 }}>{quoteModal.supplier} · {quoteModal.desc}</div>

            {quoteSent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, color: C.green }}>&#x2713;</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>Talebiniz alindi!</div>
                <div style={{ fontSize: 13, color: C.textSec, marginTop: 8, lineHeight: 1.6 }}>En gec 2 saat icinde guncel fiyat teklifiniz<br />e-posta ve SMS ile gonderilecektir.</div>
              </div>
            ) : (
              <>
                {[["Miktar *", "number", quoteModal.minQty + " " + quoteModal.unit], ["Firma Adi *", "text", "Sirket unvaniniz"], ["Telefon *", "tel", "05XX XXX XX XX"], ["E-posta", "email", "ornek@firma.com"], ["Not (opsiyonel)", "text", "Ozel kalite, boyut veya teslimat talebi..."]].map(([l, t, ph]) => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: C.textTer, fontWeight: 600, display: "block", marginBottom: 4 }}>{l}</label>
                    <input type={t} placeholder={ph} style={{ width: "100%", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                  </div>
                ))}
                <button onClick={() => setQuoteSent(true)} style={{ background: C.blue, color: "#fff", border: "none", padding: "13px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", width: "100%", marginTop: 8, boxShadow: `0 4px 16px ${C.blue}30` }}>Teklif Iste</button>
                <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.textTer }}>Distributorumazden anlik fiyat alip size teklif gonderecegiz.</div>
                {admin && <div style={{ marginTop: 10, padding: "5px 10px", background: C.greenBg, borderRadius: 6, fontSize: 10, color: C.green }}>Teklif gelince distributor fiyatina %5-8 marj ekleyip gondereceksiniz. Risk: {"\u20BA"}0.</div>}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ CART SLIDE PANEL ══ */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowCart(false)}>
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100%", maxWidth: 420, background: "#fff", borderLeft: `1px solid ${C.border}`, boxShadow: "-8px 0 30px rgba(0,0,0,.1)", padding: 28, overflow: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Sepetiniz</h3>
              <button onClick={() => setShowCart(false)} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textTer, width: 32, height: 32, borderRadius: 8, fontSize: 14, cursor: "pointer" }}>&#x2715;</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.textTer }}>
                <div style={{ fontSize: 40, marginBottom: 10, opacity: .3 }}>&#x2298;</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Sepetiniz bos</div>
              </div>
            ) : (
              <>
                {cart.map(it => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{it.name}</div>
                      <div style={{ fontSize: 11, color: C.textTer }}>{it.qty} {it.unit} · {it.supplier}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.accent }}>{"\u20BA"}{fmt(it.price * it.qty)}</div>
                      <button onClick={() => setCart(cart.filter(c => c.id !== it.id))} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.textTer, width: 24, height: 24, borderRadius: 6, cursor: "pointer", fontSize: 11 }}>&#x2715;</button>
                    </div>
                  </div>
                ))}

                {/* Shipping */}
                <div style={{ marginTop: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textTer, letterSpacing: 1, marginBottom: 8 }}>TESLIMAT</div>
                  {SHIP.map(s => (
                    <div key={s.id} onClick={() => setShip(s.id)} style={{ background: ship === s.id ? C.accentBg : C.bg, border: `1px solid ${ship === s.id ? C.accentBorder : C.border}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", marginBottom: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: ship === s.id ? C.accent : C.text }}>{s.name} <span style={{ fontWeight: 400, color: C.textTer, fontSize: 11 }}>· {s.days}</span></div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: s.price === 0 ? C.green : C.text }}>{s.price === 0 ? "Ucretsiz" : `\u20BA${fmt(s.price)}/ton`}</div>
                      </div>
                      {admin && s.price > 0 && <div style={{ fontSize: 9, color: C.green, marginTop: 4 }}>Maliyet: {"\u20BA"}{fmt(s.cost)} {"\u2192"} Marj: {"\u20BA"}{fmt(s.price - s.cost)}/ton</div>}
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textSec, marginBottom: 4 }}>
                    <span>Urunler</span><span>{"\u20BA"}{fmt(subT)}</span>
                  </div>
                  {shC > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textSec, marginBottom: 4 }}>
                    <span>Teslimat ({totW} ton)</span><span>{"\u20BA"}{fmt(shC)}</span>
                  </div>}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textTer, marginBottom: 4, fontStyle: "italic" }}>
                    <span>Vadeli odeme</span><span>Yakinda</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 800, marginTop: 8, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    <span>Toplam</span><span style={{ color: C.accent }}>{"\u20BA"}{fmt(grand)}</span>
                  </div>
                </div>

                {admin && (
                  <div style={{ marginTop: 14, padding: 12, background: C.greenBg, borderRadius: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.green, marginBottom: 6, letterSpacing: .5 }}>SIZIN GELIRINIZ</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.green, marginBottom: 3 }}><span>#1 Ticaret marji</span><span>{"\u20BA"}{fmt(tM)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.amber, marginBottom: 3 }}><span>#3 Lojistik marji</span><span>{"\u20BA"}{fmt(lM)}</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: C.green, paddingTop: 6, borderTop: `1px solid ${C.green}25`, marginTop: 4 }}><span>Toplam kazanc</span><span>{"\u20BA"}{fmt(tM + lM)}</span></div>
                  </div>
                )}

                <button onClick={doOrder} disabled={ordered} style={{ background: ordered ? C.green : C.accent, color: "#fff", border: "none", padding: "14px 0", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: ordered ? "default" : "pointer", fontFamily: "inherit", width: "100%", marginTop: 16, boxShadow: ordered ? "none" : `0 4px 16px ${C.accent}35`, transition: "all .2s" }}>
                  {ordered ? "\u2713 Siparis Alindi!" : "Siparisi Onayla (Pesin)"}
                </button>
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textTer }}>Havale/EFT veya kredi karti ile odeme</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ WHATSAPP FLOATING ══ */}
      <a href="https://wa.me/905XXXXXXXXX?text=Merhaba%2C%20hammadde%20fiyat%C4%B1%20almak%20istiyorum" target="_blank" rel="noopener" style={{
        position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%",
        background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(37,211,102,.4)", zIndex: 99, textDecoration: "none",
        transition: "transform .2s", fontSize: 28, color: "#fff"
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >💬</a>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${C.accent}, #E8864A)`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>H</div>
                <span style={{ fontSize: 16, fontWeight: 800 }}>HamTed</span>
              </div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>Turkiye'nin B2B hammadde tedarik platformu. KOBi'lere toptan fiyatla, guvenli ve hizli tedarik.</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Platform</div>
              {["Urun Katalogu", "Nasil Calisir", "Tedarikci Ol", "Uyelik Planlari"].map(t => <div key={t} style={{ fontSize: 12, color: C.textSec, marginBottom: 6, cursor: "pointer" }}>{t}</div>)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Sirket</div>
              {["Hakkimizda", "Iletisim", "SSS", "Blog"].map(t => <div key={t} style={{ fontSize: 12, color: C.textSec, marginBottom: 6, cursor: "pointer" }}>{t}</div>)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 10 }}>Yasal</div>
              {["Gizlilik Politikasi", "Kullanim Kosullari", "KVKK Aydinlatma", "Mesafeli Satis Sozlesmesi"].map(t => <div key={t} style={{ fontSize: 12, color: C.textSec, marginBottom: 6, cursor: "pointer" }}>{t}</div>)}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 11, color: C.textTer }}>&copy; 2026 HamTed Teknoloji A.S. — Tum haklari saklidir.</div>
            <div style={{ fontSize: 11, color: C.textTer }}>ETBIS kayitli · KEP: hamted@hs01.kep.tr</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
