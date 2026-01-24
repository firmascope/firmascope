import { CompanyDetailClient } from "@/components/companies/CompanyDetailClient";

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="content">
      <div className="container">
        <CompanyDetailClient slug={params.slug} />
      </div>
    </main>
  );
}
