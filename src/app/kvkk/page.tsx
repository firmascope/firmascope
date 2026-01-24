export const metadata = {
  title: "KVKK & Gizlilik | FirmaScope",
};

export default function KvkkPage() {
  return (
    <main className="content">
      <div className="container">
        <section className="card legal">
          <h1>KVKK & Gizlilik</h1>
          <p>
            FirmaScope, kullanıcı verilerini KVKK ilkelerine uygun şekilde işler. Paylaşımlar
            anonimdir, kimlik bilgileri yayınlanmaz. Kayıtlar yalnızca hizmet sunmak amacıyla
            saklanır.
          </p>
          <h2>Toplanan veriler</h2>
          <ul>
            <li>Hesap e-posta adresi ve giriş bilgileri</li>
            <li>Yorum, maaş ve mülakat içerikleri</li>
            <li>Güvenlik için IP hash verisi</li>
          </ul>
          <h2>Haklarınız</h2>
          <p>
            Verilerinize erişme, düzeltme ve silme haklarına sahipsiniz. Talepleriniz için bizimle
            iletişime geçebilirsiniz.
          </p>
        </section>
      </div>
    </main>
  );
}
