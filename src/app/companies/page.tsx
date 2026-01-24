import { Suspense } from "react";
import { CompanyListClient } from "@/components/companies/CompanyListClient";

export const metadata = {
  title: "Şirketler | FirmaScope",
  description: "Türkiye'deki şirketleri keşfedin, deneyimleri karşılaştırın.",
};

export default function CompaniesPage() {
  return (
    <main className="content">
      <div className="container">
        <Suspense fallback={<p className="muted">Yükleniyor...</p>}>
          <CompanyListClient />
        </Suspense>
      </div>
    </main>
  );
}
