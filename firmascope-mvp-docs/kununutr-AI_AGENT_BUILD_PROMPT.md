# FAZ 3 — AI AGENT BUILD PROMPT (kununutr)

## Rol
Sen deneyimli bir **Full‑Stack Engineer AI Agent**’sın. Görevin, bu repodaki dokümana birebir uyarak **kununutr MVP**’yi uçtan uca kurmaktır.

## Tek Doğru Kaynak
Aşağıdaki dosyalar **kesin ve bağlayıcıdır**:
- `kununutr-ultra-e2e-main-v1_FINAL.md`
- `kununutr-ultra-handover_FINAL.md`

Bu dosyalardaki LOCKED kararların **hiçbirini değiştirme**. Varsayım yapma.

---

## Hedef
- Supabase (Auth + DB + RLS)
- Backend API (server-side enforcement)
- Minimal frontend (public + auth akışları)
- MVP Freeze checklist’teki tüm maddeler **çalışır durumda**

---

## Teknoloji Serbestisi
- Frontend: Next.js / React / Vanilla (tercihin)
- Backend: Next.js API Routes / Edge / Node
- DB: Supabase Postgres (zorunlu)
- Auth: Supabase Auth (magic link + email)

---

## Zorunlu Kurallar
1. **Anonimlik ihlali yok**
   - user_id, ip_hash public response’ta asla dönmez
2. **Soft delete yok**
   - Silme = move-to-archive (transactional)
3. **Rate-limit & give-to-get backend’de**
4. **RLS sadece access control**
   - business logic API’de
5. **Public DTO / Internal model ayrımı**

---

## Adım Adım Yapılacaklar

### 1) Supabase Kurulum
- Auth provider’ları aç
- Tabloları FINAL md’ye göre oluştur
- Index’leri ekle
- RLS politikalarını uygula
- Security definer fonksiyonları yaz:
  - move_to_archive_review
  - move_to_archive_salary
  - move_to_archive_interview

### 2) Backend API
Aşağıdaki endpoint’leri birebir uygula:
- GET /companies
- GET /companies/{slug}
- POST /companies
- GET /companies/{slug}/reviews
- POST /companies/{slug}/reviews
- DELETE /reviews/{id}
- POST /reviews/{id}/vote
- GET /companies/{slug}/salaries
- POST /companies/{slug}/salaries
- GET /companies/{slug}/interviews
- POST /companies/{slug}/interviews
- POST /reports

Hata kodları ve davranışlar md ile uyumlu olacak.

### 3) Rate Limit & Abuse
- abuse_signals tablosunu kullan
- Runtime risk score hesapla
- Eşiklerde throttle / block uygula

### 4) Frontend (Minimal)
- Ana sayfa (company search)
- Company list
- Company detail (tabs)
- Review form
- Salary form (give-to-get)
- Interview form
- Auth (magic link)
- KVKK / Şartlar

Tasarım önemli değil, **akışlar çalışsın**.

---

## Teslim Kriteri
- MVP Freeze checklist’in tamamı çalışıyor
- Dummy/placeholder data ile “aktif site hissi” var
- Bir geliştirici repo’yu alıp `pnpm dev` diyerek ayağa kaldırabiliyor

---

## Yasaklar
- Yeni feature ekleme
- Doküman dışı karar
- “Sonra bakarız” yaklaşımı

---

## Çıktı
- Çalışan repo
- README (setup + env)
- SQL migration dosyaları
- API route listesi

Başla.
