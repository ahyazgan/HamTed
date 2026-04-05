// Volume discount tiers
const VOLUME_TIERS = [
  { min: 100, discount: 0.10, label: "%10 Hacim Indirimi (100+ ton)" },
  { min: 50, discount: 0.05, label: "%5 Hacim Indirimi (50+ ton)" },
  { min: 25, discount: 0.02, label: "%2 Hacim Indirimi (25+ ton)" },
];

export function getVolumeDiscount(qty) {
  for (const tier of VOLUME_TIERS) {
    if (qty >= tier.min) return tier;
  }
  return null;
}

export function getDiscountedPrice(price, qty) {
  const tier = getVolumeDiscount(qty);
  if (!tier) return price;
  return Math.round(price * (1 - tier.discount));
}

// Installment calculator
const INSTALLMENT_OPTIONS = [
  { months: 1, rate: 0, label: "Pesin" },
  { months: 3, rate: 0.025, label: "3 Taksit" },
  { months: 6, rate: 0.045, label: "6 Taksit" },
  { months: 9, rate: 0.065, label: "9 Taksit" },
  { months: 12, rate: 0.085, label: "12 Taksit" },
];

export function calculateInstallments(total) {
  return INSTALLMENT_OPTIONS.map(opt => {
    const totalWithRate = total * (1 + opt.rate);
    const monthly = opt.months === 1 ? total : Math.round(totalWithRate / opt.months);
    return { ...opt, total: Math.round(totalWithRate), monthly };
  });
}

// Quote validity
export function getQuoteExpiry(hoursValid = 48) {
  return new Date(Date.now() + hoursValid * 3600000).toISOString();
}

export function getTimeRemaining(expiryISO) {
  const diff = new Date(expiryISO) - Date.now();
  if (diff <= 0) return { expired: true, text: "Suresi doldu" };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { expired: false, text: `${h}s ${m}dk kaldi` };
}
