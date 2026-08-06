// ── Admin yetki kontrolü (ayrı util — fast-refresh için bileşenden ayrık). ──

// Platform sahibinin hesapları. SUNUCU TARAFI EŞLENİĞİ: public.is_admin()
// (schema.sql + admin-moderation.sql). İkisi AYNI listeyi taşımalı — yalnız
// buraya eklemek paneli açar ama içi boş gelir (RLS sunucuda reddeder).
export const ADMIN_EMAILS = ["a.hakan_@hotmail.com", "ahyazgab@gmail.com"];

export const isAdmin = (u) =>
  Boolean(u) && (u.role === "admin" || ADMIN_EMAILS.includes(String(u.email || "").toLowerCase()));
