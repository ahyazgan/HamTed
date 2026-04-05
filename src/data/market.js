// Simulated live market data engine
const BASE_PRICES = [
  { id: "steel_hrp", name: "HRP Celik", unit: "$/ton", base: 580, cat: "celik", icon: "\u2699\uFE0F" },
  { id: "steel_rebar", name: "Insaat Demiri", unit: "$/ton", base: 520, cat: "celik", icon: "\u2699\uFE0F" },
  { id: "aluminum", name: "Aluminyum", unit: "$/ton", base: 2340, cat: "celik", icon: "\u2699\uFE0F" },
  { id: "copper", name: "Bakir", unit: "$/ton", base: 8750, cat: "celik", icon: "\u2699\uFE0F" },
  { id: "cement", name: "Cimento", unit: "\u20BA/ton", base: 2850, cat: "cimento", icon: "\uD83C\uDFD7\uFE0F" },
  { id: "pp", name: "Polipropilen", unit: "$/ton", base: 1180, cat: "kimyasal", icon: "\uD83E\uDDEA" },
  { id: "hdpe", name: "HDPE", unit: "$/ton", base: 1090, cat: "kimyasal", icon: "\uD83E\uDDEA" },
  { id: "brent", name: "Brent Petrol", unit: "$/varil", base: 82.5, cat: "enerji", icon: "\u26A1" },
  { id: "cotton", name: "Pamuk", unit: "\u00A2/lb", base: 84.2, cat: "tekstil", icon: "\uD83E\uDDF5" },
  { id: "wheat", name: "Bugday", unit: "\u00A2/bushel", base: 625, cat: "gida", icon: "\uD83C\uDF3E" },
];

const CURRENCIES = [
  { id: "usd_try", name: "USD/TRY", base: 38.45, icon: "\uD83C\uDDFA\uD83C\uDDF8" },
  { id: "eur_try", name: "EUR/TRY", base: 41.80, icon: "\uD83C\uDDEA\uD83C\uDDFA" },
  { id: "gbp_try", name: "GBP/TRY", base: 48.60, icon: "\uD83C\uDDEC\uD83C\uDDE7" },
];

function randomWalk(base, volatility = 0.003) {
  return base * (1 + (Math.random() - 0.48) * volatility);
}

function generateHistory(base, days = 30) {
  const data = [];
  let price = base * (0.95 + Math.random() * 0.1);
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    price = randomWalk(price, 0.02);
    data.push({
      date: new Date(now - i * 86400000).toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
}

let cachedPrices = null;
let cachedCurrencies = null;
let lastUpdate = 0;

export function getMarketPrices() {
  const now = Date.now();
  if (!cachedPrices || now - lastUpdate > 30000) {
    if (!cachedPrices) {
      cachedPrices = BASE_PRICES.map(p => ({
        ...p,
        price: p.base,
        prevPrice: p.base,
        history: generateHistory(p.base),
      }));
    } else {
      cachedPrices = cachedPrices.map(p => ({
        ...p,
        prevPrice: p.price,
        price: Math.round(randomWalk(p.price) * 100) / 100,
      }));
    }
    lastUpdate = now;
  }
  return cachedPrices.map(p => ({
    ...p,
    change: p.price - p.prevPrice,
    changePercent: ((p.price - p.prevPrice) / p.prevPrice * 100),
    trend: getTrend(p.history),
  }));
}

export function getCurrencies() {
  const now = Date.now();
  if (!cachedCurrencies || now - lastUpdate > 30000) {
    if (!cachedCurrencies) {
      cachedCurrencies = CURRENCIES.map(c => ({ ...c, price: c.base, prevPrice: c.base }));
    } else {
      cachedCurrencies = cachedCurrencies.map(c => ({
        ...c,
        prevPrice: c.price,
        price: Math.round(randomWalk(c.price, 0.002) * 10000) / 10000,
      }));
    }
  }
  return cachedCurrencies.map(c => ({
    ...c,
    change: c.price - c.prevPrice,
    changePercent: ((c.price - c.prevPrice) / c.prevPrice * 100),
  }));
}

export function getPriceHistory(marketId) {
  const prices = getMarketPrices();
  const item = prices.find(p => p.id === marketId);
  return item?.history || [];
}

function getTrend(history) {
  if (!history || history.length < 7) return "stable";
  const recent = history.slice(-7);
  const older = history.slice(-14, -7);
  const recentAvg = recent.reduce((s, h) => s + h.price, 0) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((s, h) => s + h.price, 0) / older.length : recentAvg;
  const diff = (recentAvg - olderAvg) / olderAvg * 100;
  if (diff > 1.5) return "up";
  if (diff < -1.5) return "down";
  return "stable";
}

export function getTrendLabel(trend) {
  if (trend === "up") return { text: "Yukselis Trendinde", icon: "\u2191", color: "var(--red)" };
  if (trend === "down") return { text: "Dusus Trendinde", icon: "\u2193", color: "var(--green)" };
  return { text: "Stabil", icon: "\u2192", color: "var(--text-ter)" };
}

// Supplier ratings
export const SUPPLIER_RATINGS = {
  "Marmara Celik Servis": { delivery: 4.7, quality: 4.8, price: 4.3, overall: 4.6, orderCount: 245, onTimeRate: 96 },
  "Karadeniz Demir Ticaret": { delivery: 4.5, quality: 4.9, price: 4.4, overall: 4.6, orderCount: 180, onTimeRate: 94 },
  "Ege Metal Dagitim": { delivery: 4.3, quality: 4.6, price: 4.5, overall: 4.5, orderCount: 120, onTimeRate: 91 },
  "Anadolu Paslanmaz": { delivery: 4.8, quality: 4.9, price: 4.0, overall: 4.6, orderCount: 85, onTimeRate: 98 },
  "Bati Anadolu Yapi Malz.": { delivery: 4.6, quality: 4.7, price: 4.6, overall: 4.6, orderCount: 310, onTimeRate: 95 },
  "Merkez Beton": { delivery: 4.9, quality: 4.5, price: 4.7, overall: 4.7, orderCount: 420, onTimeRate: 99 },
  "Akdeniz Polimer": { delivery: 4.4, quality: 4.7, price: 4.3, overall: 4.5, orderCount: 95, onTimeRate: 92 },
  "Ic Anadolu Kimya": { delivery: 4.2, quality: 4.8, price: 4.4, overall: 4.5, orderCount: 75, onTimeRate: 90 },
  "Cukurova Tekstil": { delivery: 4.1, quality: 4.6, price: 4.2, overall: 4.3, orderCount: 45, onTimeRate: 88 },
  "Trakya Gida Hammadde": { delivery: 4.7, quality: 4.8, price: 4.5, overall: 4.7, orderCount: 200, onTimeRate: 97 },
  "Akaryakit Tedarik": { delivery: 4.3, quality: 4.4, price: 4.1, overall: 4.3, orderCount: 60, onTimeRate: 89 },
};

// Encyclopedia data
export const ENCYCLOPEDIA = [
  { id: "hrp", title: "Sicak Haddelenmis Sac (HRP)", cat: "celik", summary: "Celik slablarinin yuksek sicaklikta haddelenmesiyle uretilen duz celik urun.", specs: "S235JR/S355JR standart. 2-12mm kalinlik. 1500mm genislik. Rulo veya levha.", uses: "Insaat, otomotiv, gemi yapimi, boru uretimi, tank imalati.", standards: "TS EN 10025-2, TS EN 10051", storage: "Kapali ve kuru ortam. Nem ve yagmurdan koruma.", marketId: "steel_hrp" },
  { id: "rebar", title: "Nervurlu Insaat Demiri", cat: "celik", summary: "Betonarme yapilarda kullanilan, yuzeyinde nervurleri olan celik cubuk.", specs: "B420C/B500C. 8-32mm cap. 12m boy. TSE belgeli.", uses: "Betonarme yapi, kolon, kiris, doseme, temel.", standards: "TS 708, TS EN 10080", storage: "Acik hava depolama. Toprak temasindan koruma.", marketId: "steel_rebar" },
  { id: "cement", title: "Portland Cimento", cat: "cimento", summary: "Insaat sektorunun temel bagla yici malzemesi. Klinker, alcitasi ve katki maddelerinden uretilir.", specs: "CEM I 42.5R/52.5N. 50kg torba veya dokme.", uses: "Beton, harci, siva, prefabrik yapi elemanlari.", standards: "TS EN 197-1", storage: "Kuru, kapali ortam. Nem almamasi icin palet uzerinde.", marketId: "cement" },
  { id: "pp", title: "Polipropilen (PP)", cat: "kimyasal", summary: "Termoplastik polimer. Enjeksiyon, ekstruzyon ve film uygulamalarinda kullanilir.", specs: "MFI 4-25. Homopolimer/kopolimer. Granul formu.", uses: "Ambalaj, otomotiv parcalari, ev esyasi, tekstil elyafi.", standards: "ISO 1133, ASTM D1238", storage: "Kuru ortam. UV isinlarindan koruma.", marketId: "pp" },
  { id: "cotton", title: "Pamuk Ipligi", cat: "tekstil", summary: "Dogal pamuk liflerinden egirme yontemiyle uretilen iplik.", specs: "Ne 20/1 - Ne 40/1. Ring/Open-End. %100 pamuk.", uses: "Dokuma, orme, ev tekstili, giyim sanayi.", standards: "TS 1117, ASTM D1907", storage: "Kuru, serin ortam. Nem %65 altinda.", marketId: "cotton" },
  { id: "wheat", title: "Bugday Unu", cat: "gida", summary: "Bugday tanelerinin ogutulmesiyle elde edilen un. Ekmeklik ve boreklik cesitleri mevcuttur.", specs: "Tip 550/650. Ekmeklik/boreklik kalite. 50kg cuval.", uses: "Ekmek, unlu mamuller, makarna, biskuvi.", standards: "TS 4500, Turk Gida Kodeksi", storage: "Serin, kuru, havadar depo. Haserattan koruma.", marketId: "wheat" },
  { id: "brent", title: "Brent Petrol", cat: "enerji", summary: "Kuzey Denizi kaynakli ham petrol. Dunya petrol fiyatlarinin referans gostergesi.", specs: "API gravity: 38.06. Kucuk katkili ham petrol.", uses: "Yakit uretimi, petrokimya, asfalt, plastik.", standards: "ICE Brent Futures", storage: "Ozel tanklar. Yangin guvenligi onlemleri.", marketId: "brent" },
];

// Seasonal data
export const SEASONAL_DATA = [
  { month: "Ocak", celik: "dusuk", cimento: "dusuk", kimyasal: "normal", enerji: "yuksek", note: "Kis donemi, insaat yavaslama. Enerji talebi yuksek." },
  { month: "Subat", celik: "dusuk", cimento: "dusuk", kimyasal: "normal", enerji: "yuksek", note: "Kis sonu stok erimesi. Bahar hazirligi baslangici." },
  { month: "Mart", celik: "yukselis", cimento: "yukselis", kimyasal: "normal", enerji: "normal", note: "Insaat sezonu baslangici. Celik ve cimento talebi artar." },
  { month: "Nisan", celik: "yuksek", cimento: "yuksek", kimyasal: "yukselis", enerji: "normal", note: "Insaat sezonu dorugu. Fiyatlar yukselir." },
  { month: "Mayis", celik: "yuksek", cimento: "yuksek", kimyasal: "yuksek", enerji: "dusuk", note: "En yogun talep donemi. Erken siparis avantajli." },
  { month: "Haziran", celik: "yuksek", cimento: "yuksek", kimyasal: "normal", enerji: "dusuk", note: "Yaz insaat sezonu. Stabil fiyatlar." },
  { month: "Temmuz", celik: "normal", cimento: "normal", kimyasal: "normal", enerji: "dusuk", note: "Tatil donemi yavaslama. Fiyatlar dengelenir." },
  { month: "Agustos", celik: "normal", cimento: "normal", kimyasal: "dusuk", enerji: "dusuk", note: "Tatil donemi. Dusuk talep, firsatlar." },
  { month: "Eylul", celik: "yukselis", cimento: "yukselis", kimyasal: "yukselis", enerji: "normal", note: "Sonbahar canlanmasi. Yil sonu projeler hizlanir." },
  { month: "Ekim", celik: "yuksek", cimento: "yuksek", kimyasal: "normal", enerji: "yukselis", note: "Son ceyrekte yoğun talep." },
  { month: "Kasim", celik: "normal", cimento: "dusme", kimyasal: "normal", enerji: "yuksek", note: "Kis hazirligi. Enerji fiyatlari yukselir." },
  { month: "Aralik", celik: "dusme", cimento: "dusuk", kimyasal: "dusuk", enerji: "yuksek", note: "Yil sonu kapanisi. Stok eritme indirimleri." },
];

// News
export const NEWS = [
  { id: 1, title: "Celik fiyatlarinda son durum: LME verileri ne gosteriyor?", date: "2026-04-05", cat: "celik", summary: "London Metal Exchange verilerine gore celik fiyatlari son bir haftada %2.3 yukseldi. Cin'in uretim kisitlamalari etkili." },
  { id: 2, title: "Turkiye cimento sektoru 2026 ilk ceyrek raporu", date: "2026-04-03", cat: "cimento", summary: "Insaat sektorundeki canlanma ile cimento talebi %8 artti. Kapasite kullanim orani %78'e yukseldi." },
  { id: 3, title: "Polimer piyasasinda fiyat dalgalanmalari", date: "2026-04-02", cat: "kimyasal", summary: "Petrol fiyatlarindaki dusus polimer fiyatlarini olumlu etkiliyor. PP fiyatlari %3 geriledi." },
  { id: 4, title: "Pamuk fiyatlari rekor seviyede", date: "2026-04-01", cat: "tekstil", summary: "Kuraklık etkileri ve azalan stoklar pamuk fiyatlarini 5 yilin en yuksek seviyesine tasidi." },
  { id: 5, title: "Brent petrol 80 dolar altina geriledi", date: "2026-03-30", cat: "enerji", summary: "OPEC+ uretim kararlari ve kuresel talep beklentileri petrol fiyatlarini asagi cekti." },
  { id: 6, title: "Bugday hasadi beklentileri olumlu", date: "2026-03-28", cat: "gida", summary: "Turkiye'de bugday hasadi icin olumlu hava kosullari. Uretim tahmini gecen yila gore %5 artis gosteriyor." },
  { id: 7, title: "TCMB faiz karari ve doviz kurlarina etkisi", date: "2026-03-27", cat: "genel", summary: "Merkez Bankasi faiz oranini sabit tuttu. USD/TRY 38.50 civarinda dengelendi." },
  { id: 8, title: "Avrupa celik ithalat kotalarinda guncelleme", date: "2026-03-25", cat: "celik", summary: "AB komisyonu celik ithalat kotalarini 2026 yili icin %4 artirdi. Turk celik ihracatcilari icin olumlu haber." },
];
