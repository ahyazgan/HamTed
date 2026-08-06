-- ════════════════════════════════════════════════════════════════════
-- HAFTALIK ÖZET DÜZELTMESİ (2026-08-06) — SQL Editor'de bir kez Run.
-- Canlıda yapılan duman testinde çıktı; İKİ ayrı sorun:
--
-- 1) admin_weekly_stats() KIRIK: gövdesi hâlâ profiles.last_seen okuyordu, o
--    kolon profil-gizlilik migration'ında düşürülmüştü. Fonksiyon
--    'column "last_seen" does not exist' ile patlıyor → pazartesi cron'u da
--    patlardı (mail hiç gitmezdi). Artık profile_activity'den okur.
--
-- 2) YETKİ AÇIĞI HÂLÂ AÇIK: "revoke ... from public, authenticated" YETMEZ.
--    Supabase, public şemadaki yeni fonksiyonlara `anon` rolüne DOĞRUDAN
--    execute yetkisi verir (varsayılan ayrıcalıklar). PUBLIC'ten geri almak
--    bu doğrudan grant'i kaldırmaz. Kanıt: anon anahtarla yapılan RPC çağrısı
--    "permission denied" değil, fonksiyonun İÇİNDEN gelen SQL hatası döndürdü
--    — yani fonksiyon çalıştı. Kolon hatası düzelince veriler akacaktı.
--    Bu dosya anon'dan da geri alır.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.admin_weekly_stats()
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'uye_toplam',   (select count(*) from public.profiles),
    'uye_yeni',     (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'uye_uykuda',   (select count(*) from public.profiles p
                      where coalesce((select a.last_seen from public.profile_activity a where a.user_id = p.id),
                                     p.created_at) < now() - interval '7 days'),
    'ilan_aktif',   (select count(*) from public.listings where status = 'aktif'),
    'ilan_yeni',    (select count(*) from public.listings where created_at > now() - interval '7 days'),
    'eslesme',      (select count(*) from public.offers
                      where status = 'kabul' and coalesce(updated_at, created_at) > now() - interval '7 days'),
    'arama',        (select count(*) from public.phone_taps where created_at > now() - interval '7 days'),
    'ilansiz_uye',  (select count(*) from public.profiles p
                      where not exists (select 1 from public.listings l where l.owner_id = p.id)),
    'bosluk',       (select count(*) from public.listings l
                      where l.status = 'aktif' and l.created_at < now() - interval '3 days'
                        and not exists (select 1 from public.offers o where o.listing_id = l.id)
                        and not exists (select 1 from public.phone_taps t where t.listing_id = l.id)),
    'silinen_30g',  (select count(*) from public.deleted_accounts where deleted_at > now() - interval '30 days')
  );
$$;

-- anon DAHİL tüm istemci rollerinden geri al. (create or replace yetkileri
-- korur, o yüzden revoke bu satırdan SONRA gelmeli.)
revoke all on function public.admin_weekly_stats() from public, anon, authenticated;

-- Aynı hatayı diğer istemciye-kapalı fonksiyonda da tekrarlama:
revoke all on function public.send_weekly_digest() from public, anon, authenticated;

-- ── Kontrol ─────────────────────────────────────────────────────────
-- BOŞ dönmeli: istemci rollerinde execute yetkisi kalmamalı.
select grantee, routine_name from information_schema.routine_privileges
 where routine_name in ('admin_weekly_stats', 'send_weekly_digest')
   and grantee in ('anon', 'authenticated', 'PUBLIC');
-- Fonksiyon artık çalışmalı (admin/postgres olarak; sayı dolu bir jsonb döner):
select public.admin_weekly_stats();
