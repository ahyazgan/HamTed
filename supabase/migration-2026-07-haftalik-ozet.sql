-- ════════════════════════════════════════════════════════════════════
-- HAFTALIK ÖZET E-POSTASI — pazartesi sabahı pano metrikleri mailine düşer.
-- OPSİYONELDİR: uygulamanın çalışması için gerekmez, paneli açmayı unutsan
-- bile nabız elinde olsun diye. Önce migration-2026-07-saha-crm2.sql koşmalı
-- (app_config tablosu buradan geliyor).
--
-- GEREKSİNİMLER (Supabase Dashboard > Database > Extensions):
--   • pg_cron  — zamanlayıcı
--   • pg_net   — veritabanından HTTP isteği (Resend API)
-- İkisi de açık değilse aşağıdaki "create extension" satırları hata verir;
-- o durumda önce paneldeki Extensions ekranından etkinleştir.
--
-- KURULUM SIRASI
--   1) Extensions: pg_cron + pg_net aç
--   2) Bu dosyayı Run et (fonksiyonlar kurulur, cron işi tanımlanır)
--   3) Resend anahtarını + alıcı adresi yaz (aşağıdaki ADIM 3 bloğu)
--   4) İstersen elle dene:  select public.send_weekly_digest();
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ── 1) METRİKLER — panonun gördüğü sayıların sunucu tarafı karşılığı ──
-- YETKİ: HİÇBİR istemci rolüne açılmaz. SECURITY DEFINER olduğu için
-- 'authenticated'a grant vermek, herhangi bir üyenin toplam üye/ilan/eşleşme/
-- silinen hesap sayılarını konsoldan çekmesi demekti (2026-07-30'da kapatıldı).
-- Cron işi postgres olarak çalıştığı için grant'e ihtiyaç duymaz.
create or replace function public.admin_weekly_stats()
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'uye_toplam',   (select count(*) from public.profiles),
    'uye_yeni',     (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'uye_uykuda',   (select count(*) from public.profiles
                      where coalesce(last_seen, created_at) < now() - interval '7 days'),
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
revoke all on function public.admin_weekly_stats() from public, anon, authenticated;

-- ── 2) E-POSTAYI GÖNDER (Resend) ────────────────────────────────────
-- Anahtar + alıcı app_config'in 'resend' satırında durur. O satırın okuma
-- politikası yalnız admin'e açıktır (app_config_read: key='announcement' or is_admin).
create or replace function public.send_weekly_digest()
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  cfg   jsonb;
  s     jsonb;
  html  text;
  req   bigint;
begin
  select value into cfg from public.app_config where key = 'resend';
  if cfg is null or coalesce(cfg->>'api_key','') = '' or coalesce(cfg->>'to','') = '' then
    raise notice 'Resend yapilandirmasi yok (app_config.resend) — ozet gonderilmedi.';
    return jsonb_build_object('ok', false, 'reason', 'no_config');
  end if;

  s := public.admin_weekly_stats();

  html :=
    '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px">' ||
    '<h2 style="margin:0 0 4px">YÜKLET — Haftalık Özet</h2>' ||
    '<div style="color:#777;font-size:13px;margin-bottom:16px">' || to_char(now(), 'DD.MM.YYYY') || '</div>' ||
    '<table style="width:100%;border-collapse:collapse;font-size:14px">' ||
    '<tr><td style="padding:6px 0">Yeni üye (7g)</td><td align="right"><b>'   || (s->>'uye_yeni')    || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0">Yeni ilan (7g)</td><td align="right"><b>'  || (s->>'ilan_yeni')   || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0">Eşleşme (7g)</td><td align="right"><b>'    || (s->>'eslesme')     || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0">Arama (7g)</td><td align="right"><b>'      || (s->>'arama')       || '</b></td></tr>' ||
    '<tr><td colspan="2" style="border-top:1px solid #eee;padding-top:8px"></td></tr>' ||
    '<tr><td style="padding:6px 0">Toplam üye</td><td align="right"><b>'      || (s->>'uye_toplam')  || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0">Aktif ilan</td><td align="right"><b>'      || (s->>'ilan_aktif')  || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0">Hiç ilan açmamış üye</td><td align="right"><b>' || (s->>'ilansiz_uye') || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0">7 gündür girmemiş üye</td><td align="right"><b>' || (s->>'uye_uykuda') || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0;color:#b91c1c">Boşluk sinyali (ilgisiz ilan)</td><td align="right"><b style="color:#b91c1c">' || (s->>'bosluk') || '</b></td></tr>' ||
    '<tr><td style="padding:6px 0;color:#b91c1c">Silinen hesap (30g)</td><td align="right"><b style="color:#b91c1c">' || (s->>'silinen_30g') || '</b></td></tr>' ||
    '</table>' ||
    '<p style="margin-top:18px"><a href="https://yuklet.co/admin" style="background:#0A0A0A;color:#FACC15;text-decoration:none;padding:10px 16px;border-radius:6px;display:inline-block">Panoyu aç</a></p>' ||
    '</div>';

  select net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || (cfg->>'api_key')),
    body    := jsonb_build_object(
                 'from',    coalesce(cfg->>'from', 'YUKLET <noreply@yuklet.co>'),
                 'to',      jsonb_build_array(cfg->>'to'),
                 'subject', 'YÜKLET haftalık özet — ' || to_char(now(), 'DD.MM.YYYY'),
                 'html',    html)
  ) into req;

  return jsonb_build_object('ok', true, 'request_id', req, 'stats', s);
end; $$;
revoke all on function public.send_weekly_digest() from public;

-- ── 3) ZAMANLAMA — her pazartesi 06:00 UTC (TR saatiyle 09:00) ──────
select cron.unschedule('yuklet-haftalik-ozet')
 where exists (select 1 from cron.job where jobname = 'yuklet-haftalik-ozet');
select cron.schedule('yuklet-haftalik-ozet', '0 6 * * 1', $$select public.send_weekly_digest();$$);

-- ── ADIM 3: RESEND ANAHTARINI YAZ (aşağıyı kendi değerlerinle çalıştır) ──
-- Resend anahtarı: resend.com > API Keys. Gönderen alan adı (yuklet.co) doğrulanmış olmalı.
--
-- insert into public.app_config (key, value) values (
--   'resend',
--   jsonb_build_object(
--     'api_key', 're_XXXXXXXXXXXXXXXX',
--     'to',      'a.hakan_@hotmail.com',
--     'from',    'YUKLET <noreply@yuklet.co>')
-- ) on conflict (key) do update set value = excluded.value, updated_at = now();
--
-- Elle dene:   select public.send_weekly_digest();
-- Cron listesi: select jobname, schedule from cron.job;
-- İşi kaldır:   select cron.unschedule('yuklet-haftalik-ozet');
