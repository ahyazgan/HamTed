-- ════════════════════════════════════════════════════════════════════
-- İKİNCİ YÖNETİCİ HESABI (2026-08-06) — SQL Editor'de bir kez Run.
--
-- Platform sahibinin Google hesabı (ahyazgab@gmail.com) da yönetici olur.
-- Böylece "Google ile giriş" yaptığında da panele girebilir.
--
-- NEDEN GEREKLİ: yalnız istemciye (src/utils/admin.js) eklemek YETMEZ.
-- Panel açılır ama İÇİ BOŞ gelir — profiller, şikayetler, belgeler, CRM
-- notları, son giriş damgaları hep RLS'in is_admin() kapısından geçiyor.
-- İki liste her zaman AYNI olmalı.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    -- Platform sahibinin hesaplari. ISTEMCI ESLENIGI: src/utils/admin.js ADMIN_EMAILS.
    (select lower(email) in ('a.hakan_@hotmail.com', 'ahyazgab@gmail.com')
       from auth.users where id = auth.uid()),
    false
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- ── Kontrol ─────────────────────────────────────────────────────────
-- Kendi oturumunla (SQL Editor postgres olarak çalışır, false döner — normal).
-- Asıl doğrulama UYGULAMADA: Google hesabınla giriş yapıp /admin aç.
select prosrc like '%ahyazgab@gmail.com%' as ikinci_admin_eklendi
  from pg_proc where proname = 'is_admin';
