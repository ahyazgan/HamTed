-- ════════════════════════════════════════════════════════════════════
-- PANEL DOĞRULUK + YETKİ DÜZELTMESİ (2026-07-30) — SQL Editor'de bir kez Run.
-- Çok ajanlı denetimin (saha-crm2 sonrası) doğrulanmış iki bulgusu:
--
-- 1) admin_weekly_stats() 'authenticated' rolüne AÇIKTI — giriş yapmış HERHANGİ
--    bir üye konsoldan çağırıp toplam üye, 7 günlük yeni üye/ilan/eşleşme, hiç
--    ilan açmamış üye ve SİLİNEN HESAP sayılarını okuyabiliyordu. Fonksiyon
--    SECURITY DEFINER olduğu için RLS de korumuyordu. Cron işi postgres olarak
--    çalışır, grant'e ihtiyacı yoktur.
--
-- 2) offers tablosunda ADMIN OKUMA politikası hiç yoktu (offers_read yalnız
--    teklifi veren + ilan sahibi). Admin panelindeki "Teklif", "Kabul %",
--    "Eşleşme" sayaçları, "boşluk sinyali" ve Eşleştir sekmesindeki "zaten
--    teklif verdi" rozeti bu yüzden hiçbir koşulda doğru çalışamıyordu —
--    admin yalnız KENDİ tekliflerini görüyordu. (1.0.2'den beri süregelen açık.)
-- ════════════════════════════════════════════════════════════════════

-- 1) Metrik fonksiyonunu istemciye kapat (fonksiyon yoksa hata vermesin).
do $$ begin
  if exists (select 1 from pg_proc where proname = 'admin_weekly_stats') then
    revoke all on function public.admin_weekly_stats() from public, anon, authenticated;
  end if;
end $$;

-- 2) Admin tüm teklifleri OKUYABİLSİN (yalnız select — yazma yetkisi verilmez).
drop policy if exists offers_admin_read on public.offers;
create policy offers_admin_read on public.offers
  for select using (public.is_admin());

-- ── Kontrol ─────────────────────────────────────────────────────────
-- Beklenen: politika 1 satır dönmeli.
select policyname from pg_policies
 where tablename = 'offers' and policyname = 'offers_admin_read';
-- Beklenen: BOŞ dönmeli (istemci rollerinde execute yetkisi kalmamış olmalı).
select grantee, privilege_type from information_schema.routine_privileges
 where routine_name = 'admin_weekly_stats' and grantee in ('anon', 'authenticated', 'PUBLIC');
