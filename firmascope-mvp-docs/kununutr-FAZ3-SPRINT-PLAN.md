# FAZ 3 — Sprint 0 + Sprint 1 Task Breakdown (kununutr)

Bu doküman, kununutr MVP’nin **en hızlı ve risksiz şekilde** ayağa kalkması için
1–2 haftalık uygulanabilir görev planını tanımlar.

---

## SPRINT 0 — Altyapı & Güvenlik (2–3 gün)

### Supabase
- [ ] Supabase proje oluştur
- [ ] Auth provider’lar: magic link + email
- [ ] auth.users + user_profiles.role yapısı
- [ ] companies tablosu + index
- [ ] reviews tablosu + index
- [ ] votes tablosu
- [ ] salaries / interviews tabloları
- [ ] reports tablosu
- [ ] abuse_signals tablosu
- [ ] *_archived tabloları

### Güvenlik
- [ ] RLS politikaları (FINAL md’ye birebir)
- [ ] Public view’lar (user_id sızmayacak)
- [ ] Security definer fonksiyonlar (archive move)
- [ ] Test: user_id public response’ta çıkmıyor mu?

Çıkış kriteri:
> Supabase hazır, DB güvenli, veri sızması yok

---

## SPRINT 1 — Backend API (4–5 gün)

### Core API
- [ ] GET /companies
- [ ] GET /companies/{slug}
- [ ] POST /companies
- [ ] GET /companies/{slug}/reviews
- [ ] POST /companies/{slug}/reviews
- [ ] DELETE /reviews/{id}
- [ ] POST /reviews/{id}/vote
- [ ] GET /companies/{slug}/salaries
- [ ] POST /companies/{slug}/salaries
- [ ] GET /companies/{slug}/interviews
- [ ] POST /companies/{slug}/interviews
- [ ] POST /reports

### Business Logic
- [ ] Rate limit (user + ip_hash)
- [ ] Give-to-get kontrolü
- [ ] Duplicate text_hash kontrolü
- [ ] Archive move işlemleri
- [ ] abuse_signals insert

### Test
- [ ] Rate-limit edge case
- [ ] Give-to-get ihlali
- [ ] Silinen içerik frontend’de görünmüyor mu?
- [ ] Oy tekilleştirme çalışıyor mu?

Çıkış kriteri:
> API sözleşmesi %100 çalışıyor

---

## SPRINT 2 — Minimal Frontend (3–4 gün)

### Public
- [ ] Ana sayfa (company search)
- [ ] Company list
- [ ] Company detail (tabs)
- [ ] Reviews list
- [ ] Aggregated salaries/interviews

### Auth
- [ ] Magic link login
- [ ] Review form
- [ ] Salary form
- [ ] Interview form
- [ ] Vote UI
- [ ] Report UI

### Static
- [ ] KVKK
- [ ] Kullanım Şartları
- [ ] İletişim

Çıkış kriteri:
> Kullanıcı uçtan uca içerik ekleyebiliyor

---

## SPRINT 3 — MVP Polish & Yayın (2 gün)

- [ ] Placeholder data
- [ ] Empty state’ler
- [ ] Error mesajları (API codes)
- [ ] SEO meta (basic)
- [ ] Build & deploy (Vercel)
- [ ] Smoke test

---

## TOPLAM SÜRE
- **~10–14 gün**
- Tek geliştirici veya AI agent için optimize

---

## DONE TANIMI
- MVP Freeze checklist %100
- Anonimlik ihlali yok
- Abuse minimum
- Build-ready