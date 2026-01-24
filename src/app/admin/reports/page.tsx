"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";

type Report = {
  id: string;
  content_type: string;
  content_id: string;
  company_id: string | null;
  report_reason: string;
  report_text: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolution_action: string | null;
  resolution_note: string | null;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );

export default function ReportsAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [status, setStatus] = useState("open");
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("fs_admin_key") : null;
    if (stored) setAdminKey(stored);
  }, []);

  async function loadReports() {
    if (!adminKey) {
      setMessage("Admin anahtarı gerekli.");
      return;
    }
    setLoading(true);
    setMessage(null);
    const res = await apiFetch<{ items: Report[] }>(`/api/admin/reports?status=${status}`, {
      headers: { "x-admin-key": adminKey },
    });
    setLoading(false);
    if (res.ok) {
      setItems(res.data.items);
      setMessage(null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("fs_admin_key", adminKey);
      }
    } else {
      setMessage(res.error?.message ?? "Raporlar alınamadı.");
    }
  }

  async function resolveReport(reportId: string) {
    if (!adminKey) return;
    const note = resolutionNote[reportId] ?? "";
    const res = await apiFetch<{ status: string }>(`/api/admin/reports`, {
      method: "PATCH",
      headers: { "x-admin-key": adminKey },
      body: {
        id: reportId,
        status: "resolved",
        resolution_action: "reviewed",
        resolution_note: note.trim() || null,
      },
    });
    if (res.ok) {
      await loadReports();
    } else {
      setMessage(res.error?.message ?? "Rapor güncellenemedi.");
    }
  }

  return (
    <main className="content">
      <div className="container">
        <section className="card">
          <p className="eyebrow">Moderasyon</p>
          <h1>Şikayet Kuyruğu</h1>
          <p className="subtitle">Açık raporları inceleyip kapat.</p>
          <div className="filters">
            <input
              type="password"
              placeholder="Admin anahtarı"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
            />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="open">Açık</option>
              <option value="resolved">Çözüldü</option>
            </select>
            <button className="btn primary" type="button" onClick={() => void loadReports()}>
              Listeyi getir
            </button>
          </div>
          {message && <p className="muted">{message}</p>}
        </section>

        <section className="stack">
          {loading && <p className="muted">Yükleniyor...</p>}
          {!loading &&
            items.map((report) => (
              <article key={report.id} className="card report-card">
                <div className="report-meta">
                  <div>
                    <h3>{report.content_type}</h3>
                    <p className="muted">{report.report_reason}</p>
                  </div>
                  <span className="tag">{report.status}</span>
                </div>
                <div className="meta-row">
                  <span>İçerik ID: {report.content_id}</span>
                  <span>Tarih: {formatDate(report.created_at)}</span>
                </div>
                {report.report_text && <p>{report.report_text}</p>}
                {report.status === "open" && (
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Çözüm notu"
                      value={resolutionNote[report.id] ?? ""}
                      onChange={(event) =>
                        setResolutionNote((prev) => ({ ...prev, [report.id]: event.target.value }))
                      }
                    />
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => void resolveReport(report.id)}
                    >
                      Kapat
                    </button>
                  </div>
                )}
                {report.status === "resolved" && report.resolution_note && (
                  <p className="muted">Not: {report.resolution_note}</p>
                )}
              </article>
            ))}
        </section>
      </div>
    </main>
  );
}
