export const metadata = {
  title: "Kullanım Koşulları | FirmaScope",
};

export default function TermsPage() {
  return (
    <main className="content">
      <div className="container">
        <section className="card legal">
          <h1>Kullanım Koşulları</h1>
          <p>
            FirmaScope&apos;u kullanarak içeriklerin anonim, doğru ve saygılı biçimde
            paylaşılacağını kabul etmiş olursunuz. Hakaret, kişisel veri veya şirket içi gizli
            bilgilerin paylaşılması yasaktır.
          </p>
          <h2>İçerik politikası</h2>
          <ul>
            <li>Yorumlar deneyim odaklı olmalı</li>
            <li>Ad, soyad, telefon gibi kişisel veriler paylaşılmamalı</li>
            <li>Spam, reklam veya manipülasyon içerikleri kaldırılır</li>
          </ul>
          <h2>Moderasyon</h2>
          <p>
            Şüpheli içerikler moderasyon sürecine alınabilir, gerekirse arşivlenebilir veya
            kaldırılabilir.
          </p>
        </section>
      </div>
    </main>
  );
}
