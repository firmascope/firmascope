import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>FirmaScope</h3>
          <p>
            Türkiye&apos;de çalışan deneyimini güvenilir, anonim ve düzenli bir veri tabanına
            dönüştürüyoruz.
          </p>
        </div>
        <div>
          <h4>Platform</h4>
          <ul>
            <li>
              <Link href="/companies">Şirketler</Link>
            </li>
            <li>
              <Link href="/auth">Giriş</Link>
            </li>
            <li>
              <Link href="/admin/reports">Moderasyon</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Yasal</h4>
          <ul>
            <li>
              <Link href="/terms">Kullanım Koşulları</Link>
            </li>
            <li>
              <Link href="/kvkk">KVKK & Gizlilik</Link>
            </li>
            <li>
              <Link href="/contact">İletişim</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-meta">
        <span>© 2026 FirmaScope</span>
        <span>Veri toplulukla güçlenir.</span>
      </div>
    </footer>
  );
}
