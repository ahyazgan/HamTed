-- ════════════════════════════════════════════════════════════════════
-- SAHA CRM 2 — Supabase SQL Editor'de BİR KEZ çalıştır (idempotent).
-- (schema.sql'e de eklendi; mevcut CANLI projede ayrıca bunu Run et.)
--
-- 1) profiles.last_seen  — "7 gündür girmemiş" üye segmenti için son giriş damgası
--                          + touch_last_seen() RPC (uygulama açılışında dokunur)
-- 2) app_config          — cihazlar arası paylaşılan ayar deposu; ilk kullanıcı
--                          ANA SAYFA DUYURUSU (hedeflemeli: rol + il). Şimdiye
--                          kadar duyuru yalnız admin'in kendi cihazında duruyordu.
-- 3) listings_admin_insert — admin ÜYE ADINA ilan açabilsin (saha onboarding:
--                          "sen gir benim yerime"). Sahiplik hedef üyede kalır.
--
-- Haftalık özet e-postası AYRI dosyada: migration-2026-07-haftalik-ozet.sql
-- (pg_cron + pg_net gerektirir, bu dosya onsuz da çalışır).
-- ════════════════════════════════════════════════════════════════════

-- ── 1) SON GİRİŞ (last_seen) ────────────────────────────────────────
alter table public.profiles add column if not exists last_seen timestamptz;
create index if not exists profiles_last_seen_idx on public.profiles (last_seen desc nulls last);

-- Uygulama açılışında çağrılır. SECURITY DEFINER: guard_profile_update
-- trigger'ına ve RLS'e takılmadan YALNIZ kendi satırının last_seen'ini yazar.
-- Gürültüyü kısmak için 1 saatten yeni damgayı tekrar yazmaz.
create or replace function public.touch_last_seen()
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then return; end if;
  update public.profiles
     set last_seen = now()
   where id = me
     and (last_seen is null or last_seen < now() - interval '1 hour');
end; $$;
revoke all on function public.touch_last_seen() from public;
grant execute on function public.touch_last_seen() to authenticated;

-- ── 2) UYGULAMA AYARLARI (app_config) ───────────────────────────────
-- key/value (jsonb). Şu an tek anahtar: 'announcement'
--   { active, text, tone, roles:[], iller:[] }  → roles/iller boşsa herkese.
-- OKUMA KAPISI: yalnız 'announcement' herkese açıktır. Diğer anahtarlar
-- (örn. haftalık özet için 'resend' API anahtarı) SADECE admin'e görünür —
-- bu yüzden politika key bazlı yazıldı, "hepsi public" DEĞİL.
create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
drop policy if exists app_config_read  on public.app_config;
drop policy if exists app_config_write on public.app_config;
-- NOT (2026-08-10): 'saha_hatti' sonradan eklendi (migration-2026-08-saha-aday).
-- Bu dosya TEKRAR calistirilirsa politikayi eski haline dondurup saha hatti
-- numarasini kayitsiz ziyaretciden gizlerdi -> vitrin ilanlarinda iletisim
-- sessizce kaybolurdu. Iki anahtar birlikte tutulur.
create policy app_config_read on public.app_config
  for select using (key in ('announcement','saha_hatti') or public.is_admin());
create policy app_config_write on public.app_config
  for all using (public.is_admin()) with check (public.is_admin());
grant select on public.app_config to anon, authenticated;

-- ── 3) ADMIN: ÜYE ADINA İLAN ───────────────────────────────────────
-- listings_insert yalnız (auth.uid() = owner_id) izni verir; admin saha
-- turunda ocak sahibinin adına ilan açarken owner_id BAŞKASI olur.
-- Sahiplik hedef üyede kalır — ilan üyenin "İlanlarım"ında görünür.
-- NOT: guard_listing_type_role admin'i zaten muaf tutuyor; istemci türü
-- hedef üyenin rolünden türetir (nakliyeci→araç, alıcı→iş, satıcı→ürün).
drop policy if exists listings_admin_insert on public.listings;
create policy listings_admin_insert on public.listings
  for insert with check (public.is_admin());

-- ── Kontrol ─────────────────────────────────────────────────────────
-- 1 satır (last_seen kolonu):
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles' and column_name = 'last_seen';
-- app_config: rowsecurity true + 2 politika:
select relname, relrowsecurity from pg_class where relname = 'app_config';
select tablename, count(*) as politika from pg_policies
 where tablename in ('app_config') group by tablename;
-- listings üzerinde admin insert politikası (1 satır):
select policyname from pg_policies
 where tablename = 'listings' and policyname = 'listings_admin_insert';
-- RPC (1 satır):
select proname from pg_proc where proname = 'touch_last_seen';
