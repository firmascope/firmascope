# kununutr — Devam Dosyası (Kaldığımız Yer ve Kararlar)
Bu dosya, başka bir chat’te devam ederken sisteme bağlam kazandırmak için hazırlanmıştır.

## 1) Kısa bağlam
kununutr: Türkiye’de çalışanların ve eski çalışanların şirket deneyimlerini anonim ve güvenilir paylaşabildiği platform.

## 2) Kilit ürün kararları (özet)
- Birincil kullanıcı: hâlen çalışanlar + eski çalışanlar
- İkincil kullanıcı: öğrenciler / yeni mezunlar
- Kayıt var, herkese tamamen anonim, nickname zorunlu
- Maaş/mülakat görmek için kayıt gerekli
- Yorum modeli hibrit: puan + sorular + serbest metin
- Upvote + downvote var; thread yok
- Yorum sıralama: en yeni (faydalılık ikincil sinyal)
- Şirket yanıtı: sadece genel açıklama (tekil yoruma yanıt yok)
- Olumsuz yorumlar: hukuka aykırıysa silinir; şirket talep ederse moderasyona düşer
- Maaş: grafik + dağılım, aylık net TRY; give-to-get (maaş görmek için maaş girmek zorunlu)
- Mülakat: tüm aşamalar; sadece şirket sayfasında görünür
- Moderasyon SLA: 24 saat
- Şikayet aksiyonu (MVP): silme
- Kullanıcı yaptırımı: 1–2–3 uyarı
- KVKK: minimum veri (email + nickname)
- Bildirim/e-posta: yok
- Reklam: MVP’de yok; gelir şirketlerden (ücretli profil)
- Şirket profili: admin/kullanıcı/şirket ekleyebilir
- Duplicate: otomatik tespit + moderatör birleştirme
- Verified: sadece ücretli şirket

## 3) Backend ultra kararları (özet)
- Backend tipi: Hibrit (kritik kurallar backend’de)
- Backend sorumlulukları: anonimlik, puanlar, silme, give-to-get, moderasyon, rate limit → tamamı backend’de
- DB: single source of truth
- Silme: üretim tablolarından arşiv tablolarına taşıma (separate archive tables)
- Arşiv: minimal snapshot
- Abuse: hash’lenmiş IP (ham IP yok)
- Model: reviews/salaries/interviews ayrı tablolar
- Auth: Supabase Auth — hepsi (magic link + email/password + OAuth). Funnel: magic link ile çek, sonra profil tamamlama.
- Kullanıcı–içerik bağı: Hybrid (DB’de user_id var ama hiçbir public yüzeye sızmaz, RLS ile korunur).

## 4) Şu an kaçıncı sorudayız?
Ultra soru akışı: **Soru 10 cevaplandı**.  
Sıradaki: **Soru 11**

## 5) Yeni chat’te asistanın yapması gereken
1) Kullanıcının yüklediği iki MD’yi oku:  
   - `kununutr-ultra-e2e-main-v1.md`  
   - `kununutr-ultra-handover.md`  
2) Yukarıdaki kararları “locked” kabul et.  
3) Kullanıcıya **Soru 11**’i sor ve devam et.

## 6) Soru 11 (asistanın sorması gereken sonraki soru)
**Soru 11 / ULTRA — Review (yorum) için kısıtlar ve anti-abuse kuralları**  
Aşağıdakilerden hangilerini uygulayalım? (En az efor, orta güvenlik hedefiyle)

1) Kullanıcı başına şirket başına 1 yorum (güncelleme yok, silip tekrar yazabilir)  
2) Kullanıcı başına şirket başına 1 yorum (silse bile 30 gün yeniden yazamaz)  
3) Aynı şirkete sınırsız yorum ama rate-limit ile  
4) Henüz karar yok, AI öner

Kullanıcı cevapladıktan sonra DB şemasını alan alan detaylandırmaya geç.
---

## 7) Soru 11 — Cevaplandı (LOCKED)

**Seçim:** 3) Aynı şirkete sınırsız yorum + rate-limit ile  
**Karar durumu:** LOCKED

### MVP Rate-limit seti (önerilen başlangıç)
- Aynı kullanıcı aynı şirkete: 7 günde 1, 30 günde max 3
- Kullanıcı global: 24 saatte max 5, 1 saatte max 2
- ip_hash: 24 saatte 10 üstü throttle, 1 saatte 5 üstü hard block
- Kalite freni: min 120 karakter + text_hash duplicate engeli

### Backend notu
Zaman pencereli limitler server-side enforce edilecek (DB unique yeterli değil).

---

## 8) Sıradaki adım (bir sonraki iş)
Soru 12’ye geçmeden DB şemasını alan alan detaylandırma:
1) companies
2) reviews (+ index, RLS/policy)
3) votes
4) reports
5) archive tabloları (reviews_archived vb.)
---

## 9) Soru 12 — Companies Tablosu (Açıldı)

Konu: Companies entity minimum şeması, duplicate sinyalleri ve ücretli profil ayrımı.

Varsayılan öneri sunuldu.  
Kullanıcıdan onay / değişiklik / skip bekleniyor.

Sonraki adım:  
Soru 13 — Reviews tablosunun tam DB şeması (index + RLS).
---

## 9) Soru 12 — Companies Şeması (LOCKED)

- Minimum companies alanları tanımlandı
- Duplicate sinyalleri belirlendi (karar moderatörde)
- Merge davranışı net
- SEO slug kuralı sabit
- Ücretli profil ayrı tabloda

**Durum:** LOCKED

### Sıradaki adım
Soru 13 — Reviews tablosu (tam DB şeması + index + RLS)
---

## 11) Soru 14 — Votes Şeması + RLS (LOCKED)

- votes tablosu: review_id + company_id + user_id + vote_value(+1/-1)
- UNIQUE (review_id, user_id) ile tek oy kuralı
- MVP: public votes okunmaz; public’e sadece up/down sayıları döner
- Auth: kullanıcı kendi oyunu insert/update/delete yapabilir

**Durum:** LOCKED

### Sıradaki adım
Soru 15 — Reports (şikayet) + moderasyon kuyruğu (MVP: sadece silme)
---

## 13) Soru 16 — Archive Tabloları (LOCKED)

- Soft delete yerine move-to-archive modeli
- reviews_archived / salaries_archived / interviews_archived
- Archive tablolar public’e kapalı, read-only
- Silme işlemi transactional backend fonksiyonu ile

**Durum:** LOCKED

### Sıradaki adım
Soru 17 — Abuse & Rate-limit tabloları (abuse_signals)
---

## 15) Soru 18 — Auth + RLS Matrisi (LOCKED)

- Rol bazlı erişimler net
- user_id sızıntısı DB seviyesinde engellendi
- Kritik işlemler backend fonksiyonlarıyla

**Durum:** LOCKED

### Sıradaki adım
Soru 19 — API Contract (endpoint tanımları)
---

## 16) Soru 19 — API Contract (LOCKED)

- Create/Read endpoint seti tanımlandı
- Public DTO kuralları net (user_id/ip_hash sızmaz)
- Rate limit, give-to-get, archive delete API seviyesinde enforce

**Durum:** LOCKED

### Sıradaki adım
Soru 20 — MVP Freeze Checklist + “build-ready” paket
---

## 17) Soru 20 — MVP Freeze & Build-Ready (LOCKED)

- MVP kapsamı kesin olarak donduruldu
- Hariç tutulanlar bilinçli belirlendi
- Build-ready checklist tanımlandı

**Durum:** LOCKED

### Sonraki Faz
Faz 3 — Uygulama / Kodlama / AI agent görevleri
