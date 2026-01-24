"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/components/auth/AuthProvider";

type Company = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  city: string | null;
  sector: string | null;
  employee_size_bucket: string | null;
  is_verified: boolean;
  website_domain: string | null;
  created_at: string;
};

type CompanyDetailResponse = {
  company: Company;
  tabs_summary: {
    reviews: {
      count: number;
      rating_overall_avg: number | null;
      criteria_avgs: Record<string, number>;
    };
    salaries: {
      count: number;
      distribution: Record<string, number> | null;
    };
    interviews: {
      count: number;
    };
  };
};

type Review = {
  id: string;
  rating_overall: number;
  ratings_json: Record<string, number> | null;
  answers_json: Record<string, string> | null;
  text: string;
  created_at: string;
  vote_summary: { up: number; down: number };
};

type ReviewsResponse = {
  items: Review[];
  total: number;
  page: number;
  page_size: number;
};

type Interview = {
  id: string;
  text: string;
  stage_data: Record<string, string> | null;
  outcome: string | null;
  created_at: string;
};

type InterviewsResponse = {
  items: Interview[];
};

type SalaryResponse = {
  distribution: Record<string, number>;
  count: number;
};

const criteriaOptions = [
  { key: "work_life", label: "İş-yaşam" },
  { key: "management", label: "Yönetim" },
  { key: "culture", label: "Kültür" },
  { key: "compensation", label: "Ücret" },
];

const workTypes = ["remote", "hybrid", "office"];
const sizeBuckets = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value));

export function CompanyDetailClient({ slug }: { slug: string }) {
  const { session } = useAuth();
  const token = session?.access_token ?? null;

  const [company, setCompany] = useState<Company | null>(null);
  const [summary, setSummary] = useState<CompanyDetailResponse["tabs_summary"] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [salaryData, setSalaryData] = useState<SalaryResponse | null>(null);
  const [salaryGate, setSalaryGate] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reviewSort, setReviewSort] = useState("newest");

  const [reviewForm, setReviewForm] = useState({
    rating_overall: 5,
    text: "",
    position: "",
    pros: "",
    cons: "",
    criteria: criteriaOptions.reduce<Record<string, number>>((acc, item) => {
      acc[item.key] = 0;
      return acc;
    }, {}),
  });
  const [reviewStatus, setReviewStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const [salaryForm, setSalaryForm] = useState({
    position: "",
    city: "",
    experience_years: "2",
    work_type: workTypes[0],
    company_size_bucket: sizeBuckets[0],
    net_monthly_try: "",
  });
  const [salaryStatus, setSalaryStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [salaryMessage, setSalaryMessage] = useState<string | null>(null);

  const [interviewForm, setInterviewForm] = useState({
    text: "",
    outcome: "pending",
    stage_summary: "",
  });
  const [interviewStatus, setInterviewStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [interviewMessage, setInterviewMessage] = useState<string | null>(null);

  const loadCompany = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const res = await apiFetch<CompanyDetailResponse>(`/api/companies/${slug}`, {
      token,
    });
    if (res.ok) {
      setCompany(res.data.company);
      setSummary(res.data.tabs_summary);
      setStatus("idle");
    } else {
      setStatus("error");
      setErrorMessage(res.error?.message ?? "Firma bilgisi alınamadı");
    }
  }, [slug, token]);

  const loadReviews = useCallback(async () => {
    const res = await apiFetch<ReviewsResponse>(
      `/api/companies/${slug}/reviews?sort=${reviewSort}`
    );
    if (res.ok) {
      setReviews(res.data.items);
    }
  }, [slug, reviewSort]);

  const loadInterviews = useCallback(async () => {
    const res = await apiFetch<InterviewsResponse>(`/api/companies/${slug}/interviews`);
    if (res.ok) {
      setInterviews(res.data.items);
    }
  }, [slug]);

  const loadSalaries = useCallback(async () => {
    if (!token) {
      setSalaryData(null);
      setSalaryGate("Maaş dağılımını görmek için giriş yapın.");
      return;
    }
    const res = await apiFetch<SalaryResponse>(`/api/companies/${slug}/salaries`, { token });
    if (res.ok) {
      setSalaryData(res.data);
      setSalaryGate(null);
      return;
    }
    if (res.error?.code === "GIVE_TO_GET_REQUIRED") {
      setSalaryGate("Maaşları görmek için önce kendi maaşını paylaş.");
    } else if (res.error?.code === "UNAUTHORIZED") {
      setSalaryGate("Maaşları görmek için giriş yapın.");
    } else {
      setSalaryGate(res.error?.message ?? "Maaşlar alınamadı.");
    }
    setSalaryData(null);
  }, [slug, token]);

  useEffect(() => {
    void loadCompany();
    void loadReviews();
    void loadInterviews();
    void loadSalaries();
  }, [loadCompany, loadReviews, loadInterviews, loadSalaries]);

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewStatus("loading");
    setReviewMessage(null);

    if (!token) {
      setReviewStatus("error");
      setReviewMessage("Yorum göndermek için giriş yapın.");
      return;
    }

    const ratings: Record<string, number> = {};
    for (const [key, value] of Object.entries(reviewForm.criteria)) {
      if (value > 0) ratings[key] = value;
    }

    const answers: Record<string, string> = {};
    if (reviewForm.position) answers.position = reviewForm.position.trim();
    if (reviewForm.pros) answers.pros = reviewForm.pros.trim();
    if (reviewForm.cons) answers.cons = reviewForm.cons.trim();

    const res = await apiFetch<{ review_id: string }>(`/api/companies/${slug}/reviews`, {
      method: "POST",
      token,
      body: {
        rating_overall: reviewForm.rating_overall,
        text: reviewForm.text.trim(),
        ratings_json: Object.keys(ratings).length ? ratings : null,
        answers_json: Object.keys(answers).length ? answers : null,
      },
    });

    if (res.ok) {
      setReviewStatus("done");
      setReviewMessage("Yorumun alındı. Teşekkürler!");
      setReviewForm({
        rating_overall: 5,
        text: "",
        position: "",
        pros: "",
        cons: "",
        criteria: criteriaOptions.reduce<Record<string, number>>((acc, item) => {
          acc[item.key] = 0;
          return acc;
        }, {}),
      });
      await Promise.all([loadReviews(), loadCompany()]);
    } else {
      setReviewStatus("error");
      setReviewMessage(res.error?.message ?? "Yorum kaydedilemedi.");
    }
  }

  async function handleSalarySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalaryStatus("loading");
    setSalaryMessage(null);

    if (!token) {
      setSalaryStatus("error");
      setSalaryMessage("Maaş paylaşmak için giriş yapın.");
      return;
    }

    const res = await apiFetch<{ salary_id: string }>(`/api/companies/${slug}/salaries`, {
      method: "POST",
      token,
      body: {
        position: salaryForm.position.trim(),
        city: salaryForm.city.trim(),
        experience_years: Number(salaryForm.experience_years),
        work_type: salaryForm.work_type,
        company_size_bucket: salaryForm.company_size_bucket,
        net_monthly_try: Number(salaryForm.net_monthly_try),
      },
    });

    if (res.ok) {
      setSalaryStatus("done");
      setSalaryMessage("Maaş kaydı alındı.");
      setSalaryForm({
        position: "",
        city: "",
        experience_years: "2",
        work_type: workTypes[0],
        company_size_bucket: sizeBuckets[0],
        net_monthly_try: "",
      });
      await Promise.all([loadSalaries(), loadCompany()]);
    } else {
      setSalaryStatus("error");
      setSalaryMessage(res.error?.message ?? "Maaş kaydedilemedi.");
    }
  }

  async function handleInterviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInterviewStatus("loading");
    setInterviewMessage(null);

    if (!token) {
      setInterviewStatus("error");
      setInterviewMessage("Mülakat paylaşmak için giriş yapın.");
      return;
    }

    const res = await apiFetch<{ interview_id: string }>(
      `/api/companies/${slug}/interviews`,
      {
        method: "POST",
        token,
        body: {
          text: interviewForm.text.trim(),
          outcome: interviewForm.outcome,
          stage_data: interviewForm.stage_summary
            ? { summary: interviewForm.stage_summary.trim() }
            : null,
        },
      }
    );

    if (res.ok) {
      setInterviewStatus("done");
      setInterviewMessage("Mülakat paylaşıldı.");
      setInterviewForm({ text: "", outcome: "pending", stage_summary: "" });
      await loadInterviews();
    } else {
      setInterviewStatus("error");
      setInterviewMessage(res.error?.message ?? "Mülakat kaydedilemedi.");
    }
  }

  async function handleVote(reviewId: string, value: 1 | -1) {
    if (!token) {
      setReviewMessage("Oy kullanmak için giriş yapın.");
      setReviewStatus("error");
      return;
    }
    const res = await apiFetch<{ vote_summary: { up: number; down: number } }>(
      `/api/reviews/${reviewId}/vote`,
      { method: "POST", token, body: { vote_value: value } }
    );

    if (res.ok) {
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, vote_summary: res.data.vote_summary } : review
        )
      );
    }
  }

  async function handleReport(reviewId: string) {
    const res = await apiFetch<{ report_id: string }>(`/api/reports`, {
      method: "POST",
      token,
      body: {
        content_type: "review",
        content_id: reviewId,
        reason: "abuse",
        text: "Kullanıcı raporu",
      },
    });
    if (res.ok) {
      setReviewMessage("Şikayet alındı. İncelenecek.");
      setReviewStatus("done");
    } else {
      setReviewMessage(res.error?.message ?? "Şikayet gönderilemedi.");
      setReviewStatus("error");
    }
  }

  if (status === "loading") {
    return <p className="muted">Yükleniyor...</p>;
  }

  if (status === "error" || !company || !summary) {
    return <p className="muted">{errorMessage ?? "Firma bulunamadı."}</p>;
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Şirket Profili</p>
            <h1>{company.name}</h1>
            <p className="subtitle">{company.short_description ?? "Açıklama yok."}</p>
          </div>
          <div className="meta-stack">
            {company.is_verified && <span className="tag accent">Doğrulandı</span>}
            <span className="tag">{company.city ?? "Şehir yok"}</span>
            <span className="tag">{company.sector ?? "Sektör yok"}</span>
          </div>
        </div>
        <div className="meta-row">
          <span>Çalışan sayısı: {company.employee_size_bucket ?? "Bilinmiyor"}</span>
          <span>Web: {company.website_domain ?? "Yok"}</span>
          <span>Kayıt: {formatDate(company.created_at)}</span>
        </div>
      </section>

      <section className="card">
        <div className="stats-grid">
          <div>
            <span>Ortalama Puan</span>
            <strong>{summary.reviews.rating_overall_avg ?? "—"}</strong>
          </div>
          <div>
            <span>Yorum</span>
            <strong>{summary.reviews.count}</strong>
          </div>
          <div>
            <span>Maaş Paylaşımı</span>
            <strong>{summary.salaries.count}</strong>
          </div>
          <div>
            <span>Mülakat</span>
            <strong>{summary.interviews.count}</strong>
          </div>
        </div>
        {Object.keys(summary.reviews.criteria_avgs || {}).length > 0 && (
          <div className="criteria-grid">
            {Object.entries(summary.reviews.criteria_avgs).map(([key, value]) => (
              <div key={key}>
                <span>{key.replace("_", " ")}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Yorumlar</p>
            <h2>Çalışan deneyimleri</h2>
            <p className="subtitle">Anonim paylaşımlar doğrulanarak yayınlanır.</p>
          </div>
          <select value={reviewSort} onChange={(event) => setReviewSort(event.target.value)}>
            <option value="newest">En yeni</option>
            <option value="helpful">En faydalı</option>
          </select>
        </div>
        <div className="list-grid">
          {reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review.rating_overall} / 5</strong>
                <span className="muted">{formatDate(review.created_at)}</span>
              </div>
              <p>{review.text}</p>
              {review.answers_json && (
                <div className="answer-grid">
                  {Object.entries(review.answers_json).map(([key, value]) => (
                    <div key={key}>
                      <span>{key}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="vote-row">
                <button className="btn ghost" onClick={() => void handleVote(review.id, 1)}>
                  Faydalı ({review.vote_summary.up})
                </button>
                <button className="btn ghost" onClick={() => void handleVote(review.id, -1)}>
                  Faydasız ({review.vote_summary.down})
                </button>
                <button className="btn ghost" onClick={() => void handleReport(review.id)}>
                  Şikayet et
                </button>
              </div>
            </article>
          ))}
        </div>
        <form className="form-grid" onSubmit={handleReviewSubmit}>
          <div className="field-row">
            <label>
              Genel puan
              <select
                value={reviewForm.rating_overall}
                onChange={(event) =>
                  setReviewForm({ ...reviewForm, rating_overall: Number(event.target.value) })
                }
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Rol
              <input
                type="text"
                placeholder="Örn: Yazılım Mühendisi"
                value={reviewForm.position}
                onChange={(event) => setReviewForm({ ...reviewForm, position: event.target.value })}
              />
            </label>
          </div>
          <textarea
            placeholder="En az 120 karakter. Pozitif/negatif gözlemler, öneriler..."
            value={reviewForm.text}
            onChange={(event) => setReviewForm({ ...reviewForm, text: event.target.value })}
            rows={5}
          />
          <div className="criteria-grid">
            {criteriaOptions.map((item) => (
              <label key={item.key} className="criteria-item">
                {item.label}
                <select
                  value={reviewForm.criteria[item.key]}
                  onChange={(event) =>
                    setReviewForm({
                      ...reviewForm,
                      criteria: { ...reviewForm.criteria, [item.key]: Number(event.target.value) },
                    })
                  }
                >
                  <option value={0}>Seç</option>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="field-row">
            <input
              type="text"
              placeholder="Artılar"
              value={reviewForm.pros}
              onChange={(event) => setReviewForm({ ...reviewForm, pros: event.target.value })}
            />
            <input
              type="text"
              placeholder="Eksiler"
              value={reviewForm.cons}
              onChange={(event) => setReviewForm({ ...reviewForm, cons: event.target.value })}
            />
          </div>
          <button className="btn primary" type="submit" disabled={reviewStatus === "loading"}>
            {reviewStatus === "loading" ? "Gönderiliyor..." : "Yorum gönder"}
          </button>
          {reviewMessage && <p className="muted">{reviewMessage}</p>}
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Maaşlar</p>
            <h2>Maaş dağılımı</h2>
            <p className="subtitle">Give-to-get kuralı ile erişim açılır.</p>
          </div>
        </div>
        {salaryGate ? (
          <p className="notice">{salaryGate}</p>
        ) : salaryData ? (
          <div className="salary-grid">
            {Object.entries(salaryData.distribution).map(([bucket, count]) => (
              <div key={bucket}>
                <span>{bucket} ₺</span>
                <strong>{count} kişi</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Maaş verisi yok.</p>
        )}
        <form className="form-grid" onSubmit={handleSalarySubmit}>
          <input
            type="text"
            placeholder="Pozisyon"
            value={salaryForm.position}
            onChange={(event) => setSalaryForm({ ...salaryForm, position: event.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Şehir"
            value={salaryForm.city}
            onChange={(event) => setSalaryForm({ ...salaryForm, city: event.target.value })}
            required
          />
          <input
            type="number"
            min={0}
            placeholder="Deneyim (yıl)"
            value={salaryForm.experience_years}
            onChange={(event) =>
              setSalaryForm({ ...salaryForm, experience_years: event.target.value })
            }
            required
          />
          <select
            value={salaryForm.work_type}
            onChange={(event) => setSalaryForm({ ...salaryForm, work_type: event.target.value })}
          >
            {workTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={salaryForm.company_size_bucket}
            onChange={(event) =>
              setSalaryForm({ ...salaryForm, company_size_bucket: event.target.value })
            }
          >
            {sizeBuckets.map((bucket) => (
              <option key={bucket} value={bucket}>
                {bucket}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            placeholder="Net aylık (₺)"
            value={salaryForm.net_monthly_try}
            onChange={(event) =>
              setSalaryForm({ ...salaryForm, net_monthly_try: event.target.value })
            }
            required
          />
          <button className="btn primary" type="submit" disabled={salaryStatus === "loading"}>
            {salaryStatus === "loading" ? "Gönderiliyor..." : "Maaş paylaş"}
          </button>
          {salaryMessage && <p className="muted">{salaryMessage}</p>}
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Mülakatlar</p>
            <h2>Deneyimler</h2>
            <p className="subtitle">Adaylar için hazırlık rehberi.</p>
          </div>
        </div>
        <div className="list-grid">
          {interviews.map((interview) => (
            <article key={interview.id} className="review-card">
              <div className="review-header">
                <strong>{interview.outcome ?? "Belirsiz"}</strong>
                <span className="muted">{formatDate(interview.created_at)}</span>
              </div>
              <p>{interview.text}</p>
              {interview.stage_data?.summary && (
                <p className="muted">Aşamalar: {interview.stage_data.summary}</p>
              )}
            </article>
          ))}
        </div>
        <form className="form-grid" onSubmit={handleInterviewSubmit}>
          <textarea
            placeholder="Mülakat sürecini paylaş"
            value={interviewForm.text}
            onChange={(event) => setInterviewForm({ ...interviewForm, text: event.target.value })}
            rows={4}
            required
          />
          <input
            type="text"
            placeholder="Aşamalar (örn: HR + Case + CTO)"
            value={interviewForm.stage_summary}
            onChange={(event) =>
              setInterviewForm({ ...interviewForm, stage_summary: event.target.value })
            }
          />
          <select
            value={interviewForm.outcome}
            onChange={(event) => setInterviewForm({ ...interviewForm, outcome: event.target.value })}
          >
            <option value="pending">Sonuç beklemede</option>
            <option value="offer">Teklif</option>
            <option value="rejected">Red</option>
            <option value="accepted">Kabul edildi</option>
          </select>
          <button className="btn primary" type="submit" disabled={interviewStatus === "loading"}>
            {interviewStatus === "loading" ? "Gönderiliyor..." : "Mülakat gönder"}
          </button>
          {interviewMessage && <p className="muted">{interviewMessage}</p>}
        </form>
      </section>
    </div>
  );
}
