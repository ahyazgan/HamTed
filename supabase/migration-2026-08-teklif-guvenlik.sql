-- ════════════════════════════════════════════════════════════════════
-- TEKLİF GÜVENLİĞİ + SAHİPLENME KAPISI (2026-08-10)
-- Supabase SQL Editor'de BİR KEZ Run (idempotent). YAYIN ÖNCESİ ZORUNLU.
--
-- Yayın öncesi denetimde CANLI ORTAMDA KANITLANAN iki açık:
--
--  A) SAHTE "KABUL" TEKLİFİ  (bu paketten ÖNCE de vardı — canlıda açık)
--     offers_insert politikası yalnız `auth.uid() = from_user_id` diyordu;
--     status üzerinde ne kısıt ne trigger vardı. Yani HERHANGİ bir üye,
--     BAŞKASININ ilanına status='kabul' teklif satırı INSERT edebiliyordu.
--     Bunun sonucu bir "kâğıt üstünde teklif" değil, YETKİ YÜKSELTMESİDİR:
--     is_trip_party() "kabul edilmiş teklifin sahibi"ne true döndüğü için
--     saldırgan o ilanın SEFER TARAFI sayılıyor ve şunları kazanıyordu:
--       • listings_update_driver ile ilanın phase/status/cycle_stage/
--         delivery_proof/payment_* alanlarını yazmak
--       • trip_locations'ı okumak ve yazmak (canlı GPS sızıntısı)
--       • messages_insert taraf kontrolünü geçip sohbete girmek
--     Canlı doğrulama: iki atılabilir hesapla denendi, sahte teklif HTTP 201
--     ile eklendi ve kurbanın ilanına phase='yolda' YAZILDI.
--
--  B) SAHİPLENME İSTİSNASININ FAZLA GENİŞ OLMASI  (saha-aday paketiyle GELDİ)
--     guard_driver_listing_update'deki yeni istisna, çağıranın gerçekten
--     claim_prospect'ten geçtiğini doğrulamıyordu; tek koşulu "ilan sahipsiz +
--     bir adaya bağlı + kendine atıyor" idi. (A)'daki sahte teklifle birleşince
--     saldırgan, davet jetonunu hiç bilmeden vitrin ilanını üstüne geçirebilir,
--     üstelik owner_verified=true yazıp sahte "ONAYLI" rozeti de takabilirdi
--     (enforce_owner_snapshot yalnız BEFORE INSERT'te çalışıyor).
--
-- ÇÖZÜM
--   1) offers_insert: teklif YALNIZ 'beklemede' doğar. 'kabul'/'ret' yazma
--      yetkisi tek yerde kalır: accept_job / accept_offer (SECURITY DEFINER,
--      RLS'i atlar — bu politika onları ETKİLEMEZ). Banlı üye teklif veremez.
--   2) SAHİPLENME istisnası artık prospects.claimed_by = auth.uid() ARAR.
--      claimed_by'ı yalnız claim_prospect yazabilir (prospects RLS = admin).
--   3) claim_prospect: claimed_by damgası ilanları devretmeden ÖNCE yazılır,
--      böylece (2)'deki kontrol aynı transaction içinde doğru sonuç verir.
--   4) publish_prospect: saha hattı numarası girilmeden vitrin yayınlanamaz
--      (aksi halde alıcının arayacağı numara olmayan "ölü" ilan panoya çıkar).
--
-- ÖN KOŞUL: migration-2026-08-saha-aday.sql çalışmış olmalı.
-- ════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════
-- 1) TEKLİF YALNIZ 'beklemede' DOĞAR
-- ════════════════════════════════════════════════════════════════════
-- İstemci zaten yalnız 'beklemede' gönderiyor (src/lib/api.js createOffer),
-- doğrudan kabul ise accept_job RPC'sinden geçiyor. Bu yüzden kısıt hiçbir
-- gerçek akışı bozmaz; YALNIZ elle REST çağrısıyla yapılan sahtekârlığı keser.
drop policy if exists offers_insert on public.offers;
create policy offers_insert on public.offers for insert with check (
  auth.uid() = from_user_id
  -- ASIL KAPI: kimse kendi teklifini "kabul edilmiş" doğuramaz.
  and coalesce(status, 'beklemede') = 'beklemede'
  -- Banlı üye teklif veremez (messages_insert ile aynı hat).
  and not public.is_banned()
);


-- ════════════════════════════════════════════════════════════════════
-- 2) SAHİPLENME İSTİSNASI — artık gerçek sahiplenmeyi ARAR
-- ════════════════════════════════════════════════════════════════════
-- schema.sql'deki sürümün BİREBİR üstüne yazılır; iç-trigger muafiyeti ve
-- iki eski istisna (doğrudan kabul + iptal) KORUNUR.
create or replace function public.guard_driver_listing_update()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  allowed text[] := array['phase','status','cycle_stage','arrived_at','trips_done','delivery_proof','payment_received_at','payment_paid_at'];
begin
  if pg_trigger_depth() > 1 then return new; end if;
  if auth.uid() is null or auth.uid() = old.owner_id or public.is_admin() then
    return new;
  end if;
  -- DOĞRUDAN KABUL geçişi (aktif → eslesti): tek seferlik kendini-atama.
  if old.status = 'aktif' and new.status = 'eslesti'
     and old.accepted_by_id is null and new.accepted_by_id = auth.uid() then
    allowed := allowed || array['accepted_by_id','assigned_vehicle'];
  end if;
  -- İPTAL geçişi (eslesti → aktif, kabulün simetriği).
  if old.status = 'eslesti' and new.status = 'aktif'
     and old.accepted_by_id = auth.uid() and new.accepted_by_id is null then
    allowed := allowed || array['accepted_by_id','assigned_vehicle'];
  end if;
  -- SAHİPLENME geçişi (saha aday kaydı). DÖRT koşul birden aranır:
  --   • ilan gerçekten SAHİPSİZ
  --   • bir ADAY KAYDA bağlı ve bu bağ değişmiyor
  --   • yalnız KENDİNE atanıyor
  --   • ve o aday kaydını GERÇEKTEN bu kişi sahiplenmiş (claimed_by)
  -- Son koşul kritik: claimed_by'ı yalnız claim_prospect yazabilir (prospects
  -- RLS = admin), dolayısıyla davet jetonundan geçmeyen kimse buraya giremez.
  -- Bu koşul olmadan, sahte "kabul" teklifiyle sefer tarafı olan biri vitrin
  -- ilanını jetonsuz üstüne geçirebiliyordu.
  if old.owner_id is null and old.prospect_id is not null
     and new.owner_id = auth.uid()
     and new.prospect_id is not distinct from old.prospect_id
     and exists (
       select 1 from public.prospects p
        where p.id = old.prospect_id and p.claimed_by = auth.uid()
     ) then
    allowed := allowed || array['owner_id','owner_name','owner_logo','owner_verified','owner_rating'];
  end if;
  if (to_jsonb(new) - allowed) is distinct from (to_jsonb(old) - allowed) then
    raise exception 'Sürücü yalnız sefer alanlarını güncelleyebilir';
  end if;
  return new;
end; $$;
drop trigger if exists on_listing_driver_guard on public.listings;
create trigger on_listing_driver_guard
  before update on public.listings
  for each row execute function public.guard_driver_listing_update();


-- ════════════════════════════════════════════════════════════════════
-- 3) claim_prospect — damga ÖNCE, devir SONRA
-- ════════════════════════════════════════════════════════════════════
-- Tek değişiklik: prospects.claimed_by güncellemesi listings devrinden ÖNCEye
-- alındı. Aynı transaction içinde olduğu için (2)'deki exists() kontrolü artık
-- doğru sonuç verir. Geri kalan mantık migration-2026-08-saha-aday.sql ile aynı.
create or replace function public.claim_prospect(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  me      uuid := auth.uid();
  p       public.prospects;
  v_name  text;
  v_count int := 0;
begin
  if me is null then raise exception 'Giriş gerekli.'; end if;
  if coalesce(p_token,'') = '' then
    return jsonb_build_object('ok', false, 'reason', 'token_yok');
  end if;

  select * into p from public.prospects
   where upper(token) = upper(trim(p_token)) for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'bulunamadi'); end if;
  if p.claimed_by is not null then
    return jsonb_build_object('ok', p.claimed_by = me, 'reason', 'zaten_sahiplenildi', 'name', p.name);
  end if;
  if p.status = 'kapali' then
    return jsonb_build_object('ok', false, 'reason', 'kapali');
  end if;

  -- DEVİR KAPISI: yalnız taze hesap sahiplenebilir (davet linki WhatsApp'ta dolaşır).
  if exists (select 1 from public.listings where owner_id = me) then
    return jsonb_build_object('ok', false, 'reason', 'kurulu_hesap', 'name', p.name);
  end if;
  if exists (select 1 from public.prospects where claimed_by = me) then
    return jsonb_build_object('ok', false, 'reason', 'kurulu_hesap', 'name', p.name);
  end if;

  -- ── SAHİPLENME DAMGASI (ARTIK EN ÖNCE) ───────────────────────────
  -- guard_driver_listing_update aşağıdaki listings UPDATE'inde bu damgayı arar.
  update public.prospects
     set claimed_by = me, claimed_at = now(), status = 'sahiplenildi'
   where id = p.id;

  -- Profili doldur: firma adı HER ZAMAN, diğerleri yalnız boşsa.
  update public.profiles set
    name       = case when coalesce(p.name,'') <> '' then p.name else name end,
    phone      = case when coalesce(phone,'') = ''      then coalesce(p.phone,'')      else phone end,
    role       = case when coalesce(role,'') in ('','isveren')
                       and p.role in ('isveren','tedarikci','nakliyeci') then p.role else role end,
    sehir      = case when coalesce(sehir,'') = ''      then coalesce(p.il,'')         else sehir end,
    ilce       = case when coalesce(ilce,'') = ''       then coalesce(p.ilce,'')       else ilce end,
    tesis_turu = case when coalesce(tesis_turu,'') = '' then coalesce(p.tesis_turu,'') else tesis_turu end,
    hakkinda   = case when coalesce(hakkinda,'') = ''   then coalesce(p.hakkinda,'')   else hakkinda end,
    malzemeler = case when coalesce(array_length(malzemeler,1),0) = 0
                       then coalesce(p.malzemeler,'{}') else malzemeler end
  where id = me;

  select coalesce(name,'') into v_name from public.profiles where id = me;

  -- Vitrin ilanlarını devret. owner_verified/owner_rating ELLE yazılır:
  -- enforce_owner_snapshot yalnız BEFORE INSERT'te çalışır.
  update public.listings l set
    owner_id       = me,
    owner_name     = case when coalesce(p.name,'') <> '' then p.name else v_name end,
    owner_verified = coalesce((select verified from public.profiles where id = me), false),
    owner_rating   = coalesce((select rating   from public.profiles where id = me), 5.0),
    status         = case when l.status = 'kapali' then 'aktif' else l.status end
   where l.prospect_id = p.id and l.owner_id is null;
  get diagnostics v_count = row_count;

  return jsonb_build_object('ok', true, 'name', p.name, 'role', p.role, 'listings', v_count);
end; $$;
revoke all on function public.claim_prospect(text) from public, anon;
grant execute on function public.claim_prospect(text) to authenticated;


-- ════════════════════════════════════════════════════════════════════
-- 4) publish_prospect — saha hattı olmadan yayın YOK
-- ════════════════════════════════════════════════════════════════════
-- Vitrin ilanında firmanın numarası görünmez, YÜKLET saha hattı görünür.
-- Numara girilmemişse ilan panoya "aranacak kimsesi olmayan" bir kayıt olarak
-- çıkar: alıcı için değersiz, mağaza denetçisi için "çalışmayan özellik".
create or replace function public.publish_prospect(p_id bigint)
returns public.prospects language plpgsql security definer set search_path = public as $$
declare p public.prospects; v_hat text;
begin
  if not public.is_admin() then raise exception 'Yetki yok.'; end if;
  select * into p from public.prospects where id = p_id for update;
  if not found then raise exception 'Aday kayıt bulunamadı.'; end if;
  if p.consent_at is null then
    raise exception 'Rıza kaydı yok — firma "evet" demeden vitrin yayınlanamaz.';
  end if;
  select coalesce(value->>'phone','') into v_hat from public.app_config where key = 'saha_hatti';
  if coalesce(v_hat,'') = '' then
    raise exception 'Saha hattı numarası girilmemiş — vitrin ilanında aranacak numara görünmez. Panel > Saha > Saha hattı alanını doldur.';
  end if;
  update public.prospects set status = 'yayinda' where id = p_id returning * into p;
  update public.listings set status = 'aktif'
   where prospect_id = p_id and owner_id is null and status = 'kapali';
  return p;
end; $$;
revoke all on function public.publish_prospect(bigint) from public, anon;
grant execute on function public.publish_prospect(bigint) to authenticated;


-- ════════════════════════════════════════════════════════════════════
-- 5) DEVRİ GERİ AL — yanlış kişi sahiplendiyse tek çıkış yolu
-- ════════════════════════════════════════════════════════════════════
-- Davet linki WhatsApp'ta dolaşır; jetonu gören taze bir hesap firmayı
-- devralabilir. Devir kapısı bunu ZORLAŞTIRIR ama sıfırlamaz. Bugüne kadar
-- yanlış devrin GERİ ALINMASI imkânsızdı: unpublish_prospect claimed_by dolu
-- satırı reddediyor, prospects'e elle yazmak da panelde yok. Saha turunun ilk
-- gününde bu başına gelirse firma kaybedilirdi.
--
-- Bu RPC devrin tam TERSİDİR:
--   • aday kaydından doğmuş ilanları (prospect_id bağı + sahibi o kişi) yeniden
--     SAHİPSİZ yapar ve kapatır — panoda yanlış kişinin adıyla durmasınlar
--   • sahiplenme damgasını siler, aday 'taslak'a döner
--   • JETONU YENİLER: eski link ölür, sızmış bağlantı bir daha çalışmaz
-- Kişinin devir SONRASI kendi açtığı ilanlar (prospect_id boş) DOKUNULMAZ —
-- onlar gerçekten onun.
create or replace function public.release_prospect(p_id bigint)
returns public.prospects language plpgsql security definer set search_path = public as $$
declare p public.prospects; v_eski uuid; v_geri int := 0;
begin
  if not public.is_admin() then raise exception 'Yetki yok.'; end if;
  select * into p from public.prospects where id = p_id for update;
  if not found then raise exception 'Aday kayıt bulunamadı.'; end if;
  if p.claimed_by is null then
    raise exception 'Bu aday kaydı zaten sahiplenilmemiş.';
  end if;
  v_eski := p.claimed_by;

  update public.listings set
    owner_id = null, owner_verified = false, owner_rating = 5.0, status = 'kapali'
   where prospect_id = p_id and owner_id = v_eski;
  get diagnostics v_geri = row_count;

  update public.prospects set
    claimed_by = null, claimed_at = null, status = 'taslak',
    token = public.gen_invite_code() || public.gen_invite_code(),
    note = trim(both E'\n' from coalesce(note,'') || E'\n[devir geri alındı ' ||
           to_char(now(), 'DD.MM.YYYY HH24:MI') || ' · ' || v_geri || ' ilan kapatıldı · yeni davet linki üretildi]')
   where id = p_id
  returning * into p;
  return p;
end; $$;
revoke all on function public.release_prospect(bigint) from public, anon;
grant execute on function public.release_prospect(bigint) to authenticated;


-- ════════════════════════════════════════════════════════════════════
-- KONTROL
-- ════════════════════════════════════════════════════════════════════
-- 1) teklif politikasi 'beklemede' kisiti tasiyor mu? (1 satir, true)
select qual is null as sadece_with_check,
       with_check like '%beklemede%' as beklemede_kisiti_var,
       with_check like '%is_banned%' as ban_kontrolu_var
  from pg_policies where tablename='offers' and policyname='offers_insert';
-- 2) guard sahiplenmede claimed_by ARIYOR mu? (true olmali)
select prosrc like '%p.claimed_by = auth.uid()%' as claimed_by_kontrolu_var,
       prosrc like '%accepted_by_id = auth.uid()%' as kabul_istisnasi_duruyor,
       prosrc like '%new.accepted_by_id is null%'  as iptal_istisnasi_duruyor
  from pg_proc join pg_namespace n on n.oid=pronamespace
 where n.nspname='public' and proname='guard_driver_listing_update';
-- 3) claim_prospect damgayi ONCE yaziyor mu? (claimed_by satiri, listings'ten ONCE)
select position('set claimed_by' in prosrc) < position('update public.listings' in prosrc)
         as damga_once
  from pg_proc join pg_namespace n on n.oid=pronamespace
 where n.nspname='public' and proname='claim_prospect';
-- 4) publish_prospect saha hattini ariyor mu? (true)
select prosrc like '%saha_hatti%' as saha_hatti_kontrolu_var
  from pg_proc join pg_namespace n on n.oid=pronamespace
 where n.nspname='public' and proname='publish_prospect';
-- 5) devri geri alma RPC'si var mi? (1 satir)
select proname from pg_proc join pg_namespace n on n.oid=pronamespace
 where n.nspname='public' and proname='release_prospect';
