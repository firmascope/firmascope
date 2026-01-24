import { NextRequest } from "next/server";
import {
  checkReviewRateLimits,
  error,
  getAuthUser,
  getRequestIp,
  hashIp,
  hashText,
  json,
  parseNumber,
  getVoteSummary,
} from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseNumber(searchParams.get("page"), 1);
  const pageSize = parseNumber(searchParams.get("page_size"), 20);

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!company) {
    return error("NOT_FOUND", "Firma bulunamadı", 404);
  }

  let reviewQuery = supabaseAdmin
    .from("reviews")
    .select("id, rating_overall, ratings_json, answers_json, text, created_at", { count: "exact" })
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const { data: reviews, error: reviewError, count } = await reviewQuery;
  if (reviewError) {
    return error("INTERNAL_ERROR", "Yorumlar alınamadı", 500, reviewError.message);
  }

  const reviewIds = (reviews ?? []).map((review) => review.id as string);
  const voteSummary = await getVoteSummary(reviewIds);

  let items = (reviews ?? []).map((review) => ({
    id: review.id,
    rating_overall: review.rating_overall,
    ratings_json: review.ratings_json,
    answers_json: review.answers_json,
    text: review.text,
    created_at: review.created_at,
    vote_summary: voteSummary.get(review.id as string) ?? { up: 0, down: 0 },
  }));

  if (sort === "helpful") {
    items = items.sort((a, b) => (b.vote_summary.up - b.vote_summary.down) - (a.vote_summary.up - a.vote_summary.down));
  }

  return json({ items, total: count ?? items.length, page, page_size: pageSize });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user } = await getAuthUser(req);

  if (!user) {
    return error("UNAUTHORIZED", "Giriş gerekli", 401);
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return error("VALIDATION_ERROR", "Geçersiz JSON", 400);
  }

  const rating = payload?.rating_overall;
  const text = typeof payload?.text === "string" ? payload.text.trim() : "";

  if (!rating || rating < 1 || rating > 5) {
    return error("VALIDATION_ERROR", "Puan 1-5 arası olmalı", 400);
  }
  if (text.length < 120) {
    return error("VALIDATION_ERROR", "Yorum en az 120 karakter olmalı", 400);
  }

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();
  if (!company) {
    return error("NOT_FOUND", "Firma bulunamadı", 404);
  }

  const ip = getRequestIp(req);
  const ipHash = hashIp(ip);

  const rate = await checkReviewRateLimits({ userId: user.id, companyId: company.id, ipHash });
  if (!rate.allowed) {
    return error(rate.code, "Rate limit aşıldı", rate.status, { reason: rate.reason });
  }

  const textHash = hashText(text);
  const { count: dupCount } = await supabaseAdmin
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id)
    .eq("text_hash", textHash);

  if ((dupCount ?? 0) > 0) {
    return error("DUPLICATE_CONTENT", "Aynı içerik tekrar gönderilemez", 409);
  }

  const { data, error: insertError } = await supabaseAdmin
    .from("reviews")
    .insert({
      company_id: company.id,
      user_id: user.id,
      ip_hash: ipHash,
      rating_overall: rating,
      ratings_json: payload.ratings_json ?? null,
      answers_json: payload.answers_json ?? null,
      text,
      text_hash: textHash,
    })
    .select("id")
    .single();

  if (insertError) {
    return error("INTERNAL_ERROR", "Yorum kaydedilemedi", 500, insertError.message);
  }

  return json({ review_id: data?.id }, 201);
}
