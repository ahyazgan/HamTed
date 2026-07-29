-- ════════════════════════════════════════════════════════════════
-- ADMIN 1.0.2 PAKETİ — Supabase SQL Editor'de BİR KEZ çalıştır.
-- (schema.sql'e de eklendi; mevcut canlı projede ayrıca bunu Run et.)
--
-- 1) admin_notes      — üye kartına CRM notu + sonraki arama tarihi
--                       (yalnız admin okur/yazar; is_admin() admin-moderation.sql'de kurulu)
-- 2) deleted_accounts — hesap silme kaydı (PII'siz: yalnız rol + tarih)
-- 3) delete_my_account v3 — silmeden önce deleted_accounts'a satır bırakır
--
-- Bu TEK dosya yeterli (delete_my_account'ın v3 tam gövdesi aşağıda).
-- ════════════════════════════════════════════════════════════════

-- 1) Üye CRM notu — kullanıcı başına tek satır (upsert).
create table if not exists public.admin_notes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  note text not null default '',
  next_call date,
  updated_at timestamptz not null default now()
);
alter table public.admin_notes enable row level security;
drop policy if exists admin_notes_all on public.admin_notes;
create policy admin_notes_all on public.admin_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- 2) Hesap silme kaydı — PII YOK (isim/e-posta/telefon tutulmaz), yalnız
--    rol + zaman. İnsert policy bilerek yok: satırı yalnız delete_my_account
--    (security definer, owner RLS'i baypas eder) ekler; admin sadece okur.
create table if not exists public.deleted_accounts (
  id bigint generated always as identity primary key,
  role text not null default '',
  deleted_at timestamptz not null default now()
);
alter table public.deleted_accounts enable row level security;
drop policy if exists deleted_accounts_admin_read on public.deleted_accounts;
create policy deleted_accounts_admin_read on public.deleted_accounts
  for select using (public.is_admin());

-- 3) delete_my_account v3: v2'nin aynısı + silmeden önce PII'siz kayıt.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Oturum yok: hesap silinemez.';
  end if;

  -- Kabul ettigi TESLIM EDILMEMIS esli isler panoya geri doner (v2).
  delete from public.trip_locations where listing_id in (
    select id from public.listings
     where accepted_by_id = me and status = 'eslesti' and coalesce(phase,'') <> 'teslim');
  update public.listings
     set status = 'aktif', phase = null, accepted_by_id = null, assigned_vehicle = null,
         cycle_stage = null, arrived_at = null, trips_done = 0, delivery_proof = null
   where accepted_by_id = me and status = 'eslesti' and coalesce(phase,'') <> 'teslim';

  -- Storage temizligi (v2). Yetki farki silmeyi engellemesin.
  begin
    delete from storage.objects
     where bucket_id in ('logos', 'mola')
       and (storage.foldername(name))[1] = me::text;
  exception when others then
    raise notice 'storage temizligi atlandi: %', sqlerrm;
  end;

  -- v3: PII'siz silme kaydi — churn gostergesi. Kayit hatasi silmeyi engellemesin.
  begin
    insert into public.deleted_accounts(role)
      select coalesce(role, '') from public.profiles where id = me;
  exception when others then
    raise notice 'silme kaydi atlandi: %', sqlerrm;
  end;

  -- Cascade tum public verisini temizler; auth kullanicisini sil.
  delete from auth.users where id = me;
end; $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- ── Kontrol: iki tabloda RLS acik + policy sayilari (1 ve 1 beklenir) ──
select relname, relrowsecurity from pg_class
 where relname in ('admin_notes','deleted_accounts');
select tablename, count(*) as policy_sayisi from pg_policies
 where tablename in ('admin_notes','deleted_accounts') group by tablename;
