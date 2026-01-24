import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">FirmaScope</p>
          <h1>Şirket bilgisini güvenli, anonim ve düzenli hale getiriyoruz.</h1>
          <p className="subtitle">
            Türkiye&apos;de çalışanların ve adayların karar vermesine yardımcı olacak
            güçlü bir veri platformu. Hazırlık aşamasındayız.
          </p>
          <div className="cta-row">
            <Link className="cta primary" href="/companies">
              Şirketleri keşfet
            </Link>
            <Link className="cta ghost" href="/auth">
              Hesabını oluştur
            </Link>
          </div>
          <div className="stats">
            <div>
              <span>KVKK Uyumlu</span>
              <strong>Veri minimizasyonu</strong>
            </div>
            <div>
              <span>Anonimlik</span>
              <strong>Kimliksiz paylaşım</strong>
            </div>
            <div>
              <span>Güvenilirlik</span>
              <strong>Moderasyon odaklı</strong>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <div className="card-top">
            <span className="pill">MVP Hazırlığı</span>
            <span className="dot" />
          </div>
          <div className="card-body">
            <h3>Öncelikler</h3>
            <ul>
              <li>Şirket listesi ve detay ekranları</li>
              <li>Yorum, maaş ve mülakat akışları</li>
              <li>Abuse ve rate-limit kontrolü</li>
              <li>Give-to-get doğrulaması</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid">
        <article>
          <h2>Veri Katmanı</h2>
          <p>Supabase + RLS ile kullanıcı verisinin sızmasını engeller.</p>
        </article>
        <article>
          <h2>Abuse Kalkanı</h2>
          <p>Hash IP + rate limit ile güveni korur.</p>
        </article>
        <article>
          <h2>Topluluk</h2>
          <p>Yorumlar tartışma değil bilgi üretir.</p>
        </article>
      </section>

      <section className="notify" id="notify">
        <div>
          <h2>Erken erişim listesine katıl</h2>
          <p>Ürün hazır olduğunda ilk sen haberdar ol.</p>
        </div>
        <div className="cta-row">
          <Link className="cta primary" href="/companies">
            Şirketleri incele
          </Link>
          <Link className="cta ghost" href="/contact">
            Haber ver
          </Link>
        </div>
      </section>
    </main>
  );
}
