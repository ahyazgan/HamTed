-- ════════════════════════════════════════════════════════════════════
-- PROFİL GİZLİLİĞİ (2026-07-30) — SQL Editor'de bir kez Run.
--
-- SORUN: `profiles_read ... using (true)` yüzünden tablo ANON ANAHTARLA
-- tamamen okunabiliyordu. Yani hiç hesap açmadan, tek bir HTTP isteğiyle
-- TÜM ÜYELERİN e-postası + telefonu + (yeni eklenen) son giriş zamanı
-- toplanabiliyordu. Ürün kararı zaten "telefon YALNIZ üyeye görünür"
-- olduğu hâlde sunucu bunu hiç uygulamıyordu.
--
-- ÇÖZÜM (üç katman):
--   1) profiles: okuma yalnız GİRİŞ YAPMIŞ kullanıcıya (+ admin) açık.
--   2) profiles_public: herkese açık VİTRİN görünümü — ad, rol, logo, şehir,
--      hakkında, malzemeler vb. E-POSTA / TELEFON / VERGİ NO / SON GİRİŞ YOK.
--      Kayıtsız ziyaretçinin /satici/:id, /alici/:id, /nakliyeci-profil/:id
--      sayfaları bunu okur (istemci getProfile boş dönünce buna düşer).
--   3) last_seen: profiles'tan ÇIKARILIP admin-özel profile_activity
--      tablosuna taşınır — üye bile başkasının ne zaman girdiğini görmez.
--
-- Önce migration-2026-07-saha-crm2.sql koşmuş olmalı (last_seen oradan geldi).
-- ════════════════════════════════════════════════════════════════════

-- ── 1) SON GİRİŞ'İ AYRI, ADMİN-ÖZEL TABLOYA TAŞI ────────────────────
create table if not exists public.profile_activity (
  user_id   uuid primary key references public.profiles(id) on delete cascade,
  last_seen timestamptz not null default now()
);
alter table public.profile_activity enable row level security;
-- Yalnız admin OKUR. Yazma politikası bilerek yok: satırı sadece
-- touch_last_seen (security definer) yazar, o da RLS'i baypas eder.
drop policy if exists profile_activity_admin_read on public.profile_activity;
create policy profile_activity_admin_read on public.profile_activity
  for select using (public.is_admin());

-- Mevcut damgaları taşı (kolon hâlâ duruyorsa).
do $$ begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'profiles' and column_name = 'last_seen') then
    insert into public.profile_activity (user_id, last_seen)
      select id, last_seen from public.profiles where last_seen is not null
    on conflict (user_id) do update
      set last_seen = greatest(public.profile_activity.last_seen, excluded.last_seen);
  end if;
end $$;

-- RPC artık yeni tabloya yazar (1 saatten yeni damgayı yine tazelemez).
create or replace function public.touch_last_seen()
returns void language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then return; end if;
  insert into public.profile_activity (user_id, last_seen) values (me, now())
  on conflict (user_id) do update
    set last_seen = now()
    where public.profile_activity.last_seen < now() - interval '1 hour';
end; $$;
revoke all on function public.touch_last_seen() from public;
grant execute on function public.touch_last_seen() to authenticated;

-- Eski kolonu ve indeksini düşür (veri yukarıda taşındı).
drop index if exists public.profiles_last_seen_idx;
alter table public.profiles drop column if exists last_seen;

-- ── 2) HERKESE AÇIK VİTRİN GÖRÜNÜMÜ ─────────────────────────────────
-- security_invoker=false (varsayılan): görünüm sahibinin haklarıyla çalışır,
-- yani profiles'ın RLS'ini BİLEREK aşar — ama yalnız aşağıdaki kolonları verir.
-- E-posta, telefon, phone_verified, vergi_no ve son giriş burada YOKTUR.
drop view if exists public.profiles_public;
create view public.profiles_public as
  select id, name, role, verified, rating, status, created_at, logo,
         tesis_turu, sehir, ilce, hakkinda, calisma_saatleri, malzemeler,
         firma_turu, web, faaliyet_alani,
         tasima_turu, filo_ozeti, hizmet_bolgeleri
    from public.profiles;
grant select on public.profiles_public to anon, authenticated;

-- ── 3) profiles OKUMASINI ÜYEYE KİLİTLE ─────────────────────────────
-- Admin zaten profiles_admin_all ile kapsanır. Kendi satırı da buraya girer.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (auth.uid() is not null);

-- ── Kontrol ─────────────────────────────────────────────────────────
-- 1 satır: politika artık koşullu (qual 'true' DEĞİL).
select policyname, qual from pg_policies
 where tablename = 'profiles' and policyname = 'profiles_read';
-- BOŞ dönmeli: last_seen artık profiles'ta değil.
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles' and column_name = 'last_seen';
-- 1 satır: vitrin görünümü var.
select table_name from information_schema.views
 where table_schema = 'public' and table_name = 'profiles_public';
-- Vitrinde hassas kolon OLMAMALI (boş dönmeli).
select column_name from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles_public'
   and column_name in ('email', 'phone', 'phone_verified', 'vergi_no', 'last_seen');
