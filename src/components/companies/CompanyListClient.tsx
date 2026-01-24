"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

type Company = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  city: string | null;
  sector: string | null;
  employee_size_bucket: string | null;
  rating_overall_avg: number | null;
  review_count: number;
  is_verified: boolean;
};

type CompanyListResponse = {
  items: Company[];
  total: number;
  page: number;
  page_size: number;
};

const sizeBuckets = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export function CompanyListClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [ratingMin, setRatingMin] = useState("0");
  const [items, setItems] = useState<Company[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [createForm, setCreateForm] = useState({
    name: "",
    short_description: "",
    city: "",
    sector: "",
    website_domain: "",
    employee_size_bucket: "",
  });
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [createMessage, setCreateMessage] = useState<string | null>(null);

  const params = useMemo(() => {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (city) search.set("city", city);
    if (sector) search.set("sector", sector);
    if (ratingMin && ratingMin !== "0") search.set("rating_min", ratingMin);
    search.set("page", String(page));
    search.set("page_size", "20");
    return search.toString();
  }, [query, city, sector, ratingMin, page]);

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    setMessage(null);
    apiFetch<CompanyListResponse>(`/api/companies?${params}`)
      .then((res) => {
        if (!mounted) return;
        if (res.ok) {
          setItems(res.data.items);
          setStatus("idle");
        } else {
          setStatus("error");
          setMessage(res.error?.message ?? "Şirketler alınamadı");
        }
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("error");
        setMessage("Şirketler alınamadı");
      });
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (searchParams.get("view") === "submit") {
      const el = document.getElementById("submit");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [searchParams]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateStatus("loading");
    setCreateMessage(null);
    const payload = {
      name: createForm.name.trim(),
      short_description: createForm.short_description.trim() || null,
      city: createForm.city.trim() || null,
      sector: createForm.sector.trim() || null,
      website_domain: createForm.website_domain.trim() || null,
      employee_size_bucket: createForm.employee_size_bucket || null,
    };

    if (!payload.name) {
      setCreateStatus("error");
      setCreateMessage("Firma adı zorunludur.");
      return;
    }

    const res = await apiFetch<{ status: string; company_id: string }>("/api/companies", {
      method: "POST",
      body: payload,
    });

    if (res.ok) {
      setCreateStatus("done");
      setCreateMessage("Başvuru alındı. İnceleme sonrası yayına alınacak.");
      setCreateForm({
        name: "",
        short_description: "",
        city: "",
        sector: "",
        website_domain: "",
        employee_size_bucket: "",
      });
    } else {
      setCreateStatus("error");
      setCreateMessage(res.error?.message ?? "Firma oluşturulamadı");
    }
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Keşif</p>
            <h1>Şirketleri keşfet</h1>
            <p className="subtitle">
              Şirket profillerini, yorumları ve doğrulanmış bilgileri karşılaştır.
            </p>
          </div>
          <Link className="btn primary" href="/companies?view=submit">
            Yeni şirket öner
          </Link>
        </div>
        <div className="filters">
          <input
            type="search"
            placeholder="Şirket adı"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <input
            type="text"
            placeholder="Şehir"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <input
            type="text"
            placeholder="Sektör"
            value={sector}
            onChange={(event) => setSector(event.target.value)}
          />
          <select value={ratingMin} onChange={(event) => setRatingMin(event.target.value)}>
            <option value="0">Minimum puan</option>
            <option value="4">4+ yıldız</option>
            <option value="3">3+ yıldız</option>
            <option value="2">2+ yıldız</option>
          </select>
        </div>
        {status === "loading" ? (
          <p className="muted">Yükleniyor...</p>
        ) : status === "error" ? (
          <p className="muted">{message}</p>
        ) : (
          <div className="list-grid">
            {items.map((company) => (
              <article key={company.id} className="company-card">
                <div className="card-title">
                  <div>
                    <h3>{company.name}</h3>
                    <p className="muted">{company.short_description ?? "Açıklama yok"}</p>
                  </div>
                  {company.is_verified && <span className="tag accent">Doğrulandı</span>}
                </div>
                <div className="meta-row">
                  <span>{company.city ?? "Şehir belirtilmedi"}</span>
                  <span>{company.sector ?? "Sektör yok"}</span>
                  <span>{company.employee_size_bucket ?? "Ölçek bilinmiyor"}</span>
                </div>
                <div className="meta-row">
                  <span>Puan: {company.rating_overall_avg ?? "—"}</span>
                  <span>Yorum: {company.review_count}</span>
                </div>
                <Link className="btn ghost" href={`/companies/${company.slug}`}>
                  Profili Gör
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card" id="submit">
        <div className="section-header">
          <div>
            <p className="eyebrow">Katkı</p>
            <h2>Yeni şirket öner</h2>
            <p className="subtitle">
              Eksik şirketleri ekleyerek veri tabanını büyüt.
            </p>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Şirket adı *"
            value={createForm.name}
            onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Kısa açıklama"
            value={createForm.short_description}
            onChange={(event) =>
              setCreateForm({ ...createForm, short_description: event.target.value })
            }
          />
          <input
            type="text"
            placeholder="Şehir"
            value={createForm.city}
            onChange={(event) => setCreateForm({ ...createForm, city: event.target.value })}
          />
          <input
            type="text"
            placeholder="Sektör"
            value={createForm.sector}
            onChange={(event) => setCreateForm({ ...createForm, sector: event.target.value })}
          />
          <input
            type="text"
            placeholder="Website domain"
            value={createForm.website_domain}
            onChange={(event) => setCreateForm({ ...createForm, website_domain: event.target.value })}
          />
          <select
            value={createForm.employee_size_bucket}
            onChange={(event) =>
              setCreateForm({ ...createForm, employee_size_bucket: event.target.value })
            }
          >
            <option value="">Çalışan sayısı</option>
            {sizeBuckets.map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
          <button className="btn primary" type="submit" disabled={createStatus === "loading"}>
            {createStatus === "loading" ? "Gönderiliyor..." : "Şirketi öner"}
          </button>
          {createMessage && <p className="muted">{createMessage}</p>}
        </form>
      </section>
    </div>
  );
}
