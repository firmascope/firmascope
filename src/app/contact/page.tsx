export const metadata = {
  title: "İletişim | FirmaScope",
};

export default function ContactPage() {
  return (
    <main className="content">
      <div className="container">
        <section className="card legal">
          <h1>İletişim</h1>
          <p>
            Sorularınız veya talepleriniz için bize ulaşabilirsiniz. Yanıt süremiz 1-2 iş
            günüdür.
          </p>
          <div className="contact-grid">
            <div>
              <span>E-posta</span>
              <strong>firmascope@gmail.com</strong>
            </div>
            <div>
              <span>Geri bildirim</span>
              <strong>Ürün ve veri kalitesi</strong>
            </div>
            <div>
              <span>Moderasyon</span>
              <strong>Abuse & raporlar</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
