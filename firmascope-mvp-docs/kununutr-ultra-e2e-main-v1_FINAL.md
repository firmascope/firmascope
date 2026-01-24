# kununutr — Ultra Detay E2E Ürün + Backend Dokümantasyonu (v1)
⚠️ **PLACEHOLDER MARKA**  
Bu dokümanda kullanılan **kununutr** adı ve tüm marka referansları **geçicidir**. Nihai marka, logo, renk paleti ve görsel kimlik henüz belirlenmemiştir.  
Tüm sistem; isim, logo ve metinlerin **global olarak değiştirilebilir** olduğu varsayımıyla tasarlanmıştır.

---

## 0. Bu doküman ne işe yarar?
Bu doküman:
- ürünün davranışını (UX + kurallar),
- backend’in sorumluluklarını,
- veri modeli ve API sözleşmelerini,
- moderasyon ve abuse mekanizmalarını,
- yayın (deploy) ve operasyonu,
- AI agent ve insan için TODO listelerini

**tek kaynak** olarak tanımlar.

---

## 1. ÜRÜN VİZYONU VE FELSEFESİ

**kununutr**, Türkiye’de çalışanların ve eski çalışanların şirket deneyimlerini **tamamen anonim**, **kayıtlı ama kimliksiz** ve **güvenilir** şekilde paylaşabildiği bir platformdur.

### 1.1 Ana Amaç
Türkiye’de:
- şirket kültürünü,
- çalışma koşullarını,
- yönetim anlayışını,
- maaş gerçekliğini,
- mülakat süreçlerini

**çalışan perspektifinden** görünür kılmak.

### 1.2 Hedef Kullanıcılar
**Birincil (çekirdek katkı sağlayanlar):**
- Hâlen çalışanlar
- Eski çalışanlar

**İkincil (pasif / tüketici):**
- Öğrenciler
- Yeni mezunlar

### 1.3 Temel İlkeler
- Anonimlik > Viral büyüme  
- Veri minimizasyonu (KVKK odaklı)  
- Tartışma değil, bilgi  
- Forum değil, referans platformu  
- “Eksik ama çalışıyor” değil → “çalışıyor ve gelişiyor”  
- MVP’de her modül var; placeholder ile bile “aktif site hissi”

---

## 2. ANONİMLİK VE KAYIT MODELİ

### 2.1 Kayıt ve erişim
- Şirket profilleri + genel yorum özetleri: **herkese açık**
- Maaş ve mülakat detayları: **kayıt zorunlu**
- İçerik ekleme (yorum/maaş/mülakat): **kayıt zorunlu**

### 2.2 Kimlik gizliliği
- Kayıt var ama **kullanıcı herkese karşı anonim**
- **Takma ad (nickname) zorunlu**
- Gerçek isim, açık profil, sosyal grafik vb. yok

### 2.3 Bildirimler
- E-posta / push / sistem bildirimi: **yok**  
Kullanıcı sadece giriş yaptığında durumu görür.

---

## 3. BİLGİ MİMARİSİ (SITEMAP)

### 3.1 Public
- Ana Sayfa
- Şirketler (Liste + Filtre)
- Şirket Detay
- Şehir Landing
- Sektör Landing
- Hakkında
- SSS
- İletişim
- Gizlilik Politikası (KVKK)
- Kullanım Şartları

### 3.2 Giriş yapmış kullanıcı
- Yorum Yaz
- Maaş Ekle
- Mülakat Deneyimi Ekle
- Profilim
- Katkılarım

### 3.3 Admin / Moderasyon
- Şikayet Kuyruğu
- Silinen İçerikler (audit)
- Şirket Birleştirme
- Abuse kontrolleri

---

## 4. ANA SAYFA

### 4.1 Öncelik
Ana sayfanın tek baskın odağı: **Şirket arama kutusu**.

### 4.2 Arama davranışı (MVP)
- Sadece şirket adıyla arama
- Autocomplete / fuzzy / çok alanlı arama: V2

---

## 5. ŞİRKET LİSTELEME

### 5.1 Sıralama
Varsayılan sıralama: **karma**  
- genel puan
- yorum sayısı
- güncellik

### 5.2 Filtreler (MVP)
- Şehir
- Genel puan aralığı
- Yorum sayısı
Filtre UI: üstte dropdown.

---

## 6. ŞİRKET PROFİLİ

### 6.1 Şirket oluşturma kanalları
- Admin ekleyebilir
- Kullanıcı ekleyebilir (moderasyonlu)
- Şirket başvurabilir (moderasyonlu)

### 6.2 Duplicate şirketler
- Otomatik duplicate tespit sinyalleri (isim benzerliği, web domain, lokasyon)
- Birleştirme kararı: **moderasyon**

### 6.3 Verified
- Verified yalnızca **ücretli şirket profili** için

### 6.4 Şirket yanıtları
- Şirketler tekil yorumlara yanıt vermez
- Sadece şirket sayfasında **genel açıklama / toplu yanıt** yayınlar

---

## 7. ŞİRKET DETAY SAYFASI

### 7.1 Hero
- Şirket adı
- Genel puan (1–5)
- Kısa açıklama
- Logo yok (placeholder tipografik)

### 7.2 Sekmeler
- Genel Bakış
- Yorumlar
- Maaşlar
- Mülakatlar
- Şirket Yanıtı

### 7.3 Ana CTA
- **Yorum yaz** (baskın)

---

## 8. YORUMLAR

### 8.1 Model (hibrit)
- Genel puan (1–5)
- Çoklu kriter puanları (kültür, yönetim, work-life, maaş algısı vb.)
- Yönlendirici sorular
- Serbest metin

### 8.2 Etkileşim
- Upvote + Downvote
- Thread / cevap yok

### 8.3 Sıralama
- Varsayılan: en yeni
- Faydalılık sinyali ikincil

### 8.4 Teşvik
- Pop-up/modal tetikleme
- Rozet/level motivasyonu

### 8.5 Düzenleme ve silme
- Düzenleme: kapalı
- Silme: açık
- Silinen yorum:
  - frontend’de iz bırakmaz
  - ortalama puandan çıkar
  - admin audit’inde bulunur

---

## 9. MAAŞ SİSTEMİ

### 9.1 Give-to-get
- Maaş görmek için **maaş girmek zorunlu**
- Amaç: veri kalitesini ve katkıyı artırmak

### 9.2 Zorunlu kırılımlar
- Pozisyon
- Şehir
- Deneyim yılı
- Çalışma türü (remote/hybrid/ofis)
- Şirket büyüklüğü

### 9.3 Gösterim
- Aylık net (TRY)
- Grafik + dağılım (tekil değer vurgulanmaz)

### 9.4 Kalite kontrol
- Mantık dışı değerler (çok düşük/yüksek) otomatik flag
- Flag’lenenler moderasyon kuyruğuna düşebilir
- (Not) İleride: şehir+pozisyon+deneyim için istatistiksel eşik modeli

---

## 10. MÜLAKAT DENEYİMLERİ

- Tüm aşamalar: başvuru, HR, teknik, case, teklif, ret/geri dönüş
- Model: serbest + yapılandırılmış + puanlama
- Görünürlük: sadece şirket sayfasında

---

## 11. KULLANICI PROFİLİ

- Basit profil: nickname + katkılar
- Rozet sinyalleri:
  - yorum sayısı
  - upvote alan yorumlar
  - farklı şirketlere katkı

---

## 12. ŞİKAYET & MODERASYON

### 12.1 Şikayet edilebilir içerikler
- Yorumlar
- Maaşlar
- Mülakat deneyimleri
- Şirket profilleri

### 12.2 Şikayet gerekçeleri
- Hakaret / nefret söylemi
- Kişisel veri paylaşımı
- Gerçeğe aykırı
- Reklam/spam
- Hukuki ihlal
- Diğer

### 12.3 SLA ve aksiyon
- Hedef: 24 saat
- Aksiyon: **silme** (MVP’de tek aksiyon)

### 12.4 Kullanıcı yaptırımı
- 1–2–3 uyarı modeli

---

## 13. KVKK VE VERİ YÖNETİMİ

### 13.1 Veri minimizasyonu
- Kullanıcı için minimum veri: e-posta + nickname

### 13.2 Hesap silme
- Hesap silinir, içerikler anonim şekilde kalır (hesapla bağ kopar)

---

## 14. MONETİZASYON

- MVP’de reklam yok
- Ana gelir: ücretli şirket profilleri (verified, açıklama, görsel, öne çıkarma, analytics)

---

# ULTRA DETAY: BACKEND & DATA LAYER (Kararlar ve Mimari)

## 15. BACKEND TASARIM KARARLARI (Kilit)

### 15.1 Backend karakteri
**Hibrit backend**:
- Kritik kurallar backend’de
- UI akışı frontend’de

### 15.2 Backend sorumlulukları (tamamı backend’de)
- Anonimlik ve kullanıcı–içerik bağları
- Puan hesaplama ve ortalamalar
- Silme mantığı (frontend’de iz yok)
- Give-to-get (maaş)
- Moderasyon / şikayet akışı
- Rate limit / abuse kontrolü

### 15.3 Stack seçimi
Teknoloji bağımsız (AI/ekip seçer). Doküman davranış odaklıdır.

### 15.4 Tek doğru kaynak
Database **single source of truth**.

---

## 16. SOFT DELETE ve ARŞİVLEME STRATEJİSİ

### 16.1 Neden arşiv tabloları?
“Frontend’de hiçbir iz kalmasın, admin’de kalsın” hedefi için en sade ve güvenli yöntem.

### 16.2 Model
- Üretim tablolarında silme yok; silme anında row **arşiv tabloya taşınır**
- Arşiv kayıtları **minimal** tutulur

### 16.3 Minimal arşiv alanları (konsept)
- original_id (silinen kaydın id’si)
- company_id
- content_type (review/salary/interview/company_update vs.)
- snapshot_text (serbest metin ve temel alanların string snapshot’ı)
- created_at (orijinal oluşturulma)
- deleted_at
- deleted_by_role (user/moderator/admin)
- delete_reason (opsiyonel enum + açıklama)

---

## 17. ABUSE / RATE LIMIT için HASH IP

### 17.1 Seçilen yaklaşım
- Ham IP saklanmaz
- Tek yönlü **hash IP** tutulur (geri çevrilemez)
- Amaç: tekrar eden abuse tespiti ve rate limit

### 17.2 Kullanım
- Aynı hash’den kısa sürede çok katkı → throttle
- Şikayet/ihlallerle eşleşirse “risk skoru” artar

---

## 18. DATA MODEL KURGUSU (MVP: ayrı tablolar)

Supabase ücretsiz katman + sadelik için:
- `companies`
- `reviews`
- `salaries`
- `interviews`
- `reports` (şikayet)
- `company_claims` (şirket başvurusu/claim)
- `company_profiles_paid` (ücretli profil verileri)
- `votes` (up/down)
- `user_profiles` (nickname vb.)
- `abuse_signals` (hash ip, risk skor)
- Arşiv tabloları:
  - `reviews_archived`
  - `salaries_archived`
  - `interviews_archived`
  - (gerekiyorsa) `companies_archived`

> Not: Kesin alanlar ve index’ler Soru 11’den sonra açılacak.

---

## 19. AUTH (Supabase) — Hepsi, Magic Link ile çek, sonra tam üyelik

### 19.1 İstenen davranış
- OAuth + Email/Password + Magic Link: **hepsi mevcut**
- Funnel:
  1) Kullanıcıyı magic link ile hızlıca içeri al (friction düşük)
  2) Sonrasında kullanıcıyı “tam üyelik” akışına yönlendir (profil tamamlama)

### 19.2 Profil tamamlama (MVP)
- nickname seçimi zorunlu
- KVKK / şartlar onayı

---

## 20. KULLANICI–İÇERİK BAĞI (Kritik seçim)

### 20.1 Seçilen model: Hybrid (en az efor, orta güvenlik)
- DB’de `user_id` tutulur (uygulama için basit)
- Ancak:
  - **asla** public API/response’da dönmez
  - RLS/policy ile kullanıcılar yalnız kendi kayıtlarına erişebilir (veya hiç erişemez; sadece create)
  - Admin/Moderator paneli kontrollü erişir

---

# TODO LİSTELERİ (İnsan + AI)

## 21. İnsan için TODO (Product Owner / Teknik Sahip)
1) Domain + marka adı (kununutr placeholder kalacak)  
2) KVKK + şartlar metinlerinin nihai versiyonu  
3) Moderasyon politikalarında “silme dışı” aksiyonlar V2’ye mi kalacak?  
4) Ücretli profil paketleri (fiyatlama ve kapsam)  
5) Şehir ve sektör taksonomisi (liste)  
6) Maaş validasyon eşikleri (ilk kaba aralıklar)  

## 22. AI Agent için TODO (Kurulum & İskelet)
1) Supabase projesi oluştur (free tier)  
2) Auth provider’larını aç (magic link + email/password + OAuth)  
3) DB tablolarını oluştur (v1 şema)  
4) RLS ve policy’leri uygula (özellikle user_id sızıntısı önlemleri)  
5) API route’ları (create/read) tanımla  
6) Give-to-get enforcement (server-side)  
7) Archive move işlemleri (transactional)  
8) Admin panel iskeleti (basic queue)  
9) Rate limit + hash ip sinyal kaydı  
10) Seed/placeholder içerik üretimi (aktif site hissi)  

---

## 23. MVP CHECKLIST (yayın öncesi)
- Şirket arama çalışıyor
- Şirket listeleme filtreleri çalışıyor
- Şirket sayfası sekmeleri çalışıyor
- Yorum yazma/silme doğru çalışıyor (archive + ortalamadan çıkarma)
- Maaş give-to-get çalışıyor
- Maaş grafikleri / dağılım görünür
- Mülakat ekleme/görüntüleme çalışıyor
- Şikayet gönderme + admin kuyruğu çalışıyor
- Admin’den silme çalışıyor
- KVKK/Şartlar sayfaları yayında
- SEO index/noindex kuralları doğru

---

## 24. Başarı metriği
Ana KPI: **Organik trafik (SEO)**
---

# 25. ULTRA Soru Akışı — Kilitlenen Yeni Karar (Soru 11)

## 25.1 Soru 11 Kararı (LOCKED)
**Review (yorum) modeli:** Aynı kullanıcı aynı şirkete **sınırsız** yorum yazabilir; ancak **rate limit + anti-abuse** kuralları ile kontrol edilir. (Soru 11 = **Seçenek 3**)

## 25.2 MVP Rate Limit Kuralları (önerilen başlangıç seti)
Hedef: **en az efor + orta güvenlik + veri kalitesi**.

### Kullanıcı → Şirket bazında
- **Min aralık:** aynı `user_id` aynı `company_id` için **7 günde 1** yorum
- **30 gün limiti:** aynı kullanıcı aynı şirkete **30 günde max 3** yorum

### Kullanıcı global (tüm şirketler)
- **24 saat limiti:** aynı kullanıcı için **24 saatte max 5** yorum
- **1 saat limiti:** aynı kullanıcı için **1 saatte max 2** yorum

### IP-hash bazında (ham IP yok)
- Aynı `ip_hash` için **24 saatte 10 yorum üstü** → throttle + risk skoru artır
- Aynı `ip_hash` için **1 saatte 5 yorum üstü** → geçici hard block

### Basit kalite freni (MVP)
- Serbest metin **min 120 karakter**
- Aynı metnin tekrar gönderimi engeli: `text_hash` (ör. normalized text SHA) ile duplicate kontrol

## 25.3 Uygulama Notları (Backend enforcement)
- Zaman pencereli limitler **DB unique constraint ile tek başına** çözülemez.
- Create review endpoint’i server-side şunları kontrol eder:
  - (user_id, company_id) son review zamanı
  - user_id bazlı 1 saat/24 saat sayaçları
  - ip_hash bazlı 1 saat/24 saat sayaçları
  - `text_hash` duplicate kontrol
- Başarısız durumda 429 (rate limit) veya 403 (block) döner.

## 25.4 DB Şeması Etkisi (Reviews)
`reviews` tablosu için minimum alanlar:
- `id`, `company_id`, `user_id` (public’e sızmaz)
- `ip_hash` (ham IP yok)
- `rating_overall` (1–5)
- `ratings_json` (çoklu kriter puanları)
- `answers_json` (yönlendirici sorular)
- `text`, `text_hash`
- `created_at`

Rate-limit sayımı için 2 yaklaşım:
- **A (MVP):** `reviews` üzerinden `created_at` filtreli count ile kontrol
- **B (scale):** `review_rate_counters` gibi sayaç tablosu

## 25.5 Silme/Arşivleme ile Etkileşim
- Silme: production’dan arşive taşıma modeli korunur.
- Rate limit sayımları **MVP’de yalnız production `reviews`** üzerinden yapılabilir.
- V2’de “silip tekrar yazma abuse” görülürse, arşiv de kural setine dahil edilebilir.
---

# 26. ULTRA Soru Akışı — Soru 12 (Companies Tablosu)

## 26.1 Amaç
Şirket (company) entity’si için **MVP minimum alanları**, duplicate sinyalleri ve ücretli profil ayrımını kilitlemek.

## 26.2 Companies — Minimum Alanlar (Önerilen Default)
- `id`
- `name`
- `normalized_name` (lowercase, trim, ascii)
- `slug` (SEO)
- `short_description` (max ~240 char)
- `city`
- `sector`
- `company_size` (enum)
- `website_domain` (opsiyonel)
- `is_verified` (bool, default false)
- `created_at`
- `created_by_role` (admin/user/company)

## 26.3 Duplicate Tespit Sinyalleri (MVP)
Otomatik uyarı üretir, **birleştirme kararı moderasyonda**:
- `normalized_name` benzerliği
- `website_domain` eşleşmesi
- aynı `city` + benzer isim

## 26.4 Ücretli Profil Ayrımı
- Production `companies` tablosu **herkes için ortak**
- Ücretli/verified alanlar **ayrı tabloda** tutulur:
  - `company_profiles_paid`
- `is_verified = true` yalnızca bu tabloda aktif kayıt varsa set edilir

## 26.5 MVP Kapsam Dışı (Bilinçli)
- Logo yükleme
- Sosyal linkler
- Şube listeleri
- Şirket içi departmanlar

## 26.6 Karar Durumu
Bu yapı **varsayılan öneri** olarak sunulmuştur.  
Değişiklik talebi gelmezse **LOCKED** kabul edilir ve Soru 13’e geçilir.
---

# 26. ULTRA Soru Akışı — Companies (Şirket) Şeması (Soru 12)

## 26.1 Amaç
Şirket verisini **tekil, birleştirilebilir, SEO-dostu ve ücretli profil genişlemelerine açık** şekilde kilitlemek.

## 26.2 Companies — Minimum Alanlar (MVP)
- `id` (uuid, pk)
- `name` (text, required)
- `normalized_name` (text, required, lower/trim; duplicate sinyali)
- `slug` (text, unique, SEO)
- `short_description` (text, optional)
- `city` (text, indexed)
- `sector` (text, indexed)
- `website_domain` (text, optional; duplicate sinyali)
- `employee_size_bucket` (enum: 1-10, 11-50, 51-200, 201-1000, 1000+)
- `is_verified` (bool, default false)
- `is_paid_profile` (bool, default false)
- `created_by_role` (enum: admin|user|company)
- `status` (enum: active|pending|merged|archived)
- `created_at`, `updated_at`

## 26.3 SEO & URL
- URL tek kaynağı: `/company/{slug}`
- Slug üretimi: name → normalize → uniq suffix (gerekirse)
- Slug değişirse: eski slug → 301 redirect (V2)

## 26.4 Duplicate Tespit Sinyalleri (MVP)
Otomatik sinyal üretir, **kararı moderatör verir**:
- `normalized_name` benzerliği
- `website_domain` eşleşmesi
- Aynı şehir + yüksek isim benzerliği

## 26.5 Birleştirme (Merge) Mantığı
- Hedef şirket: `status=active`
- Kaynak şirket: `status=merged`
- İlişkili içerikler (reviews, salaries, interviews) hedefe taşınır
- Kaynak şirket frontend’de görünmez
- Audit kaydı tutulur

## 26.6 Ücretli Profil Ayrımı
Ücretli alana taşınacaklar (`company_profiles_paid`):
- logo
- hero görsel
- uzun açıklama
- öne çıkarma ayarları
- analytics

Core `companies` tablosu **hafif kalır**.

## 26.7 RLS / Erişim
- Public: read (status=active)
- User: create (pending)
- Company: claim request (pending)
- Admin/Moderator: full access

## 26.8 Kilit Karar
- Companies şeması bu haliyle **LOCKED (v1)**.
---

# 28. ULTRA Soru Akışı — Votes (Upvote/Downvote) Şeması + RLS (Soru 14)

## 28.1 Amaç
- Thread olmadan “faydalılık” sinyali toplamak (up/down)
- Manipülasyonu azaltmak: **tek kullanıcı tek oy**
- Public sayfalarda review sıralamasına yardımcı ikincil sinyal

## 28.2 votes Tablosu (v1 — LOCKED)
### Kolonlar
- `id` (uuid, pk, default gen_random_uuid())
- `review_id` (uuid, not null, fk → reviews.id, on delete cascade)
- `company_id` (uuid, not null, fk → companies.id, on delete cascade) — query hızlandırma
- `user_id` (uuid, not null, fk → auth.users.id, **public’e dönmez**)
- `vote_value` (smallint, not null, check in (-1, 1)) — down=-1, up=+1
- `created_at` (timestamptz, not null, default now())

## 28.3 Tek Oy Kuralı
- Aynı kullanıcı aynı review için yalnız **1** vote:
  - UNIQUE (`review_id`, `user_id`)
- Kullanıcı oyunu değiştirmek isterse:
  - aynı row update (vote_value flip) (MVP opsiyon)
  - veya önce sil sonra ekle (MVP opsiyon)
- MVP önerisi: **update izinli** (vote_value değişebilir), audit gerekmez.

## 28.4 Index’ler
- `idx_votes_review` (review_id)
- `idx_votes_company` (company_id)
- `idx_votes_user_created_at` (user_id, created_at desc)
- `uidx_votes_review_user` UNIQUE (review_id, user_id)

## 28.5 Aggregation (review up/down sayıları)
MVP’de iki yaklaşım:
- A) Query-time count: votes where review_id group by vote_value
- B) Denormalize: reviews tablosunda `up_count`, `down_count` alanları + trigger (V2)

MVP önerisi: **A** (basit, düşük trafik).

## 28.6 RLS / Policy Taslağı (Supabase)
### Public Read
- Herkes: select serbest (votes public okunabilir) **VEYA**
- Güvenlik/mahremiyet için: public select kapalı, sadece aggregate endpoint döner.
MVP önerisi: **public votes select kapalı**; public’e sadece sayı (up/down) döndür.

### Authenticated Create/Update/Delete
- Kullanıcı: insert where user_id = auth.uid()
- Kullanıcı: update/delete only where user_id = auth.uid()
- Admin: full access

## 28.7 Silme ile Etkileşim
- Review silinirse (archive move): votes cascade delete olur (reviews row yok).
- İstenirse önce votes da arşivlenebilir (V2). MVP’de gerekmez.

## 28.8 LOCKED Karar
- `votes` v1 şeması + tek oy kuralı + RLS yaklaşımı bu haliyle **LOCKED**.
---

# 29. ULTRA Soru Akışı — Reports (Şikayet) + Moderasyon Kuyruğu (Soru 15)

## 29.1 Amaç
- Hukuki riskleri ve abuse’u hızlıca temizlemek
- MVP’de **tek aksiyon: silme**
- Moderasyon kararlarını audit edilebilir tutmak

## 29.2 reports Tablosu (v1 — LOCKED)
### Kolonlar
- `id` (uuid, pk)
- `content_type` (text, not null) — 'review'|'salary'|'interview'|'company'
- `content_id` (uuid, not null)
- `company_id` (uuid, null) — review/salary/interview için
- `report_reason` (text, not null) — enum UI tarafında
- `report_text` (text, null)
- `reported_by_user_id` (uuid, null) — anonime izin (login zorunlu değil)
- `ip_hash` (text, null)
- `status` (text, not null, default 'open') — open|resolved|dismissed
- `created_at` (timestamptz, default now())
- `resolved_at` (timestamptz, null)
- `resolved_by_role` (text, null) — moderator|admin
- `resolution_action` (text, null) — delete|none
- `resolution_note` (text, null)

## 29.3 Moderasyon Akışı (MVP)
1) Şikayet oluşturulur → status=open
2) Admin/Moderator inceler
3) Karar:
   - **delete** → içerik archive’a taşınır
   - **none** → şikayet kapatılır
4) status=resolved

SLA hedefi: **24 saat**

## 29.4 RLS / Erişim
- Public: create (rate-limitli)
- Public: read ❌
- Admin/Moderator: full access
- User: kendi report’unu görebilir (opsiyonel)

## 29.5 Abuse ile Entegrasyon
- Aynı ip_hash / user_id çok sayıda kötü niyetli report → abuse_signals risk skoru artar

## 29.6 LOCKED Karar
- reports v1 şeması + MVP moderasyon akışı bu haliyle **LOCKED**.
---

# 30. ULTRA Soru Akışı — Archive (Move-to-Archive) Tabloları (Soru 16)

## 30.1 Amaç
- Frontend’de **hiç iz bırakmadan** içerik silmek
- Hukuki ve operasyonel denetim için **minimal audit** saklamak
- Soft delete karmaşasından kaçınmak

## 30.2 Genel Prensip
- Production tablolarında **DELETE yok**
- Silme anında kayıt **ilgili _archived tabloya taşınır**
- Archive tablolar **read-only**
- Archive kayıtları public API’de **asla görünmez**

## 30.3 reviews_archived (v1 — LOCKED)
### Kolonlar
- `id` (uuid, pk)
- `original_id` (uuid, not null) — reviews.id
- `company_id` (uuid, not null)
- `user_id` (uuid, null) — audit için, public yok
- `content_type` (text, not null, default 'review')
- `snapshot_text` (text, not null) — review metni + temel alanlar string
- `rating_overall` (smallint, null)
- `ratings_json` (jsonb, null)
- `answers_json` (jsonb, null)
- `created_at` (timestamptz) — orijinal
- `deleted_at` (timestamptz, default now())
- `deleted_by_role` (text, not null) — user|moderator|admin
- `delete_reason` (text, null)

## 30.4 salaries_archived / interviews_archived
- Aynı yapı korunur
- `content_type` sırasıyla 'salary' | 'interview'
- Alanlar ilgili production tablonun **minimum snapshot’ı** olacak şekilde seçilir

## 30.5 Archive İşlemi (Backend)
- Security definer fonksiyon:
  - BEGIN
  - INSERT INTO *_archived SELECT …
  - DELETE FROM production_table WHERE id=?
  - COMMIT
- Transactional zorunlu (yarım silme yok)

## 30.6 RLS / Erişim
- Public: no access
- User: no access
- Admin/Moderator: read-only access
- Insert/Delete/Update: sadece backend fonksiyonları (direct DML kapalı)

## 30.7 LOCKED Karar
- Move-to-archive modeli v1 bu haliyle **LOCKED**
- Soft delete kesinlikle kullanılmaz
---

# 32. ULTRA Soru Akışı — Auth + RLS Matrisi (Soru 18)

## 32.1 Amaç
- Anonimliği DB seviyesinde garanti altına almak
- user_id sızıntısını teknik olarak imkânsız kılmak
- Rol bazlı erişimleri deterministik hale getirmek

## 32.2 Rol Tanımları
- Public
- Authenticated User
- Moderator
- Admin

Rol kaynağı:
- auth.users
- user_profiles.role (user|moderator|admin)

## 32.3 RLS Matrisi (Özet)

### companies
- Public: SELECT (status='active')
- User: INSERT (status='pending')
- Moderator/Admin: SELECT/INSERT/UPDATE
- Delete: yok (merge/archive)

### reviews
- Public: SELECT (status='active')
- User: INSERT (user_id = auth.uid())
- User: SELECT own (opsiyonel)
- Update: yok
- Delete: yok (archive)

### salaries / interviews
- Public: SELECT (aggregated)
- User: INSERT
- Update/Delete: yok (archive)

### votes
- Public: yok (aggregate only)
- User: INSERT/UPDATE/DELETE (own)
- Moderator/Admin: full

### reports
- Public: INSERT
- Public/User: SELECT yok
- Moderator/Admin: full

### abuse_signals / *_archived
- Public/User: yok
- Moderator/Admin: SELECT only
- INSERT/DELETE: backend only

## 32.4 LOCKED
Auth + RLS matrisi v1 bu haliyle LOCKED.
---

# 33. ULTRA Soru Akışı — API Contract (Create/Read) (Soru 19)

## 33.1 Amaç
- Frontend’in backend’den ne beklediğini tek sözleşmeye bağlamak
- user_id / ip_hash gibi alanların **asla public response’ta görünmemesini** garanti altına almak
- Give-to-get, rate-limit, archive delete gibi kritik kuralları API seviyesinde netleştirmek

## 33.2 Genel Kurallar
- Tüm write işlemleri backend üzerinden (RLS sadece access control)
- Public read: sadece “public DTO” döner
- Hata formatı standart:
  - `code` (string)
  - `message` (string)
  - `details` (object|null)

## 33.3 Endpoints (v1 — LOCKED)

### 1) GET /companies
Amaç: listeleme + filtre
Query:
- `q` (string, optional) — name search (MVP: contains)
- `city` (string, optional)
- `sector` (string, optional)
- `rating_min` (number, optional)
- `page` (int, default 1)
- `page_size` (int, default 20)

Response (public):
- `items`: [{ company_public_dto }]
- `total`
- `page`
- `page_size`

company_public_dto:
- `id`, `name`, `slug`, `short_description`
- `city`, `sector`, `employee_size_bucket`
- `rating_overall_avg`, `review_count`
- `is_verified`

---

### 2) GET /companies/{slug}
Amaç: şirket hero + sekmeler için özet
Response:
- `company`: company_public_dto + `website_domain` (opsiyon) + `created_at`
- `tabs_summary`:
  - `reviews`: { `count`, `rating_overall_avg`, `criteria_avgs` }
  - `salaries`: { `count`, `distribution` } (give-to-get ise gated field)
  - `interviews`: { `count` }

Not: `distribution` public ise sadece aggregated.

---

### 3) POST /companies (auth optional; MVP: auth required önerisi)
Amaç: kullanıcı şirket ekleme talebi
Body:
- `name`
- `city` (optional)
- `sector` (optional)
- `website_domain` (optional)
Response:
- `status`: 'pending'
- `company_id`

---

### 4) GET /companies/{slug}/reviews
Query:
- `sort` = 'newest' (default) | 'helpful'
- `page`, `page_size`
Response:
- `items`: [review_public_dto]
- `total`

review_public_dto:
- `id`
- `rating_overall`
- `ratings_json`
- `answers_json`
- `text`
- `created_at`
- `vote_summary`: { `up`, `down` }

---

### 5) POST /companies/{slug}/reviews (auth required)
Body:
- `rating_overall`
- `ratings_json`
- `answers_json`
- `text`
- `employment_status` (optional)
- `work_type` (optional)
Server checks (hard):
- rate limit rules
- min 120 char
- duplicate text_hash within company
Response:
- `review_id`

---

### 6) DELETE /reviews/{id} (auth required)
Amaç: kullanıcı kendi yorumunu silebilir
Server:
- ownership check
- move-to-archive transactional
Response:
- `{ ok: true }`

---

### 7) POST /reviews/{id}/vote (auth required)
Body:
- `vote_value`: 1 | -1
Behavior:
- upsert (unique review_id+user_id)
Response:
- `vote_summary`: { `up`, `down` }

---

### 8) GET /companies/{slug}/salaries (auth required + give-to-get)
Behavior:
- Kullanıcı aynı şirkete salary girmişse aggregated görünür
- Girmediyse: 403 GIVE_TO_GET_REQUIRED
Response:
- `distribution` (buckets)
- `count`

---

### 9) POST /companies/{slug}/salaries (auth required)
Body:
- position, city, experience_years, work_type, company_size_bucket
- net_monthly_try
Server:
- sanity checks / flagging
Response:
- `salary_id`

---

### 10) GET /companies/{slug}/interviews (public aggregated)
Response:
- `items`: [interview_public_dto] (MVP: public list ok)
interview_public_dto:
- `id`, `stage_data`, `text`, `created_at`, `outcome` (optional)

---

### 11) POST /companies/{slug}/interviews (auth required)
Body:
- stage_data (json)
- text
- outcome (optional)
Response:
- `interview_id`

---

### 12) POST /reports (public)
Body:
- content_type, content_id, reason, text(optional)
Server:
- rate limit (ip_hash)
Response:
- `report_id`

## 33.4 Error Codes (v1)
- RATE_LIMITED (429)
- DUPLICATE_CONTENT (409)
- VALIDATION_ERROR (400)
- UNAUTHORIZED (401)
- FORBIDDEN (403)
- GIVE_TO_GET_REQUIRED (403)
- NOT_FOUND (404)

## 33.5 LOCKED
API contract v1 bu haliyle LOCKED.
---

# 34. ULTRA Soru Akışı — MVP Freeze Checklist & Build-Ready Paket (Soru 20)

## 34.1 Amaç
- MVP kapsamını **kesin olarak dondurmak**
- “Eksik ama çalışıyor” yerine **çalışıyor ve yayınlanabilir** seviyeyi garanti etmek
- Dev/AI agent için net teslim sınırı çizmek

## 34.2 MVP Freeze — Dahil Olanlar (LOCKED)

### Core
- Şirket arama (name-based)
- Şirket listeleme + filtre (şehir, sektör, puan)
- Şirket detay sayfası (tabs)
- Review ekleme / silme (archive)
- Vote (up/down)
- Salary (give-to-get)
- Interview ekleme/görüntüleme
- Report (şikayet)
- Moderasyon kuyruğu (admin)
- Abuse & rate-limit
- Archive sistemi
- Auth (magic link + email)
- KVKK / Şartlar sayfaları

### Backend
- Supabase Auth
- RLS politikaları
- Security definer fonksiyonlar
- API contract v1
- Tek DB (single source of truth)

### Frontend
- Public pages
- Auth flow
- Form validation (min char vb.)
- Error handling (API codes)
- Placeholder içerik (aktif site hissi)

---

## 34.3 MVP Freeze — Hariç Tutulanlar (Bilinçli)

- Bildirim sistemi
- E-mail/push
- Şirketlerin tekil yoruma cevabı
- Review edit
- Soft delete
- Advanced search (autocomplete/fuzzy)
- Recommendation / ML
- Analytics dashboard (company side)
- Paid plan UI (sadece backend hazır)

---

## 34.4 Build-Ready Checklist

### Teknik
- [ ] Supabase projesi hazır
- [ ] Auth provider’lar aktif
- [ ] DB tabloları + index’ler
- [ ] RLS politikaları uygulanmış
- [ ] Archive fonksiyonları
- [ ] Rate-limit middleware
- [ ] API endpoint’leri
- [ ] Seed/placeholder data

### Ürün
- [ ] Ana akışlar test edildi
- [ ] Edge-case’ler (rate limit, duplicate)
- [ ] Silme → archive doğrulandı
- [ ] Give-to-get akışı test
- [ ] Public/private veri ayrımı kontrol

### Hukuki
- [ ] KVKK metni
- [ ] Kullanım şartları
- [ ] İletişim sayfası

---

## 34.5 Build-Ready Tanımı
Aşağıdakiler sağlanıyorsa ürün **yayına hazır** kabul edilir:
- Anonimlik teknik olarak ihlal edilemiyor
- Abuse minimumda tutuluyor
- Kritik akışlar (review/salary/interview) uçtan uca çalışıyor
- Silinen içerik frontend’de iz bırakmıyor
- DB + API + UI tutarlı

## 34.6 LOCKED
MVP Freeze & Build-Ready paketi bu haliyle LOCKED.
