# Supabase Setup

1) Supabase SQL Editor'de `supabase/migrations/0001_init.sql` dosyasını çalıştırın.
2) Auth URL config:
   - Site URL: https://<domain>
   - Redirect URLs: https://<domain>/auth/callback

## Env Vars (Vercel)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- SUPABASE_JWT_SECRET (opsiyonel, ip hash için)

## Notlar
- `move_to_archive_*` fonksiyonları server-side delete için kullanılır.
- Public DTO'larda user_id/ip_hash asla dönmez.
