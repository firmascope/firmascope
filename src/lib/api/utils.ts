import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export type ApiErrorCode =
  | "RATE_LIMITED"
  | "DUPLICATE_CONTENT"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "GIVE_TO_GET_REQUIRED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(code: ApiErrorCode, message: string, status: number, details?: unknown) {
  return NextResponse.json({ code, message, details: details ?? null }, { status });
}

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return { user: null, token: null };
  }

  const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !data.user) {
    return { user: null, token };
  }

  return { user: data.user, token };
}

export function getRequestIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return req.headers.get("x-real-ip") ?? null;
}

export function hashIp(ip: string | null) {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? process.env.SUPABASE_JWT_SECRET ?? "";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export function normalizeText(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function hashText(input: string) {
  return crypto.createHash("sha256").update(normalizeText(input)).digest("hex");
}

export function parseNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function getVoteSummary(reviewIds: string[]) {
  if (!reviewIds.length) return new Map<string, { up: number; down: number }>();
  const { data, error: voteError } = await supabaseAdmin
    .from("votes")
    .select("review_id, vote_value")
    .in("review_id", reviewIds);

  if (voteError || !data) {
    return new Map<string, { up: number; down: number }>();
  }

  const summary = new Map<string, { up: number; down: number }>();
  for (const vote of data) {
    const key = vote.review_id as string;
    if (!summary.has(key)) {
      summary.set(key, { up: 0, down: 0 });
    }
    const entry = summary.get(key)!;
    if (vote.vote_value === 1) entry.up += 1;
    if (vote.vote_value === -1) entry.down += 1;
  }
  return summary;
}

export function buildDistribution(values: number[], bucketSize = 5000) {
  const buckets: Record<string, number> = {};
  for (const value of values) {
    const start = Math.floor(value / bucketSize) * bucketSize;
    const end = start + bucketSize - 1;
    const key = `${start}-${end}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return buckets;
}

export function toCriteriaAverages(ratings: Record<string, number>[]) {
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const rating of ratings) {
    for (const [key, value] of Object.entries(rating)) {
      if (typeof value !== "number") continue;
      if (!totals[key]) totals[key] = { sum: 0, count: 0 };
      totals[key].sum += value;
      totals[key].count += 1;
    }
  }

  const averages: Record<string, number> = {};
  for (const [key, { sum, count }] of Object.entries(totals)) {
    if (count > 0) {
      averages[key] = Number((sum / count).toFixed(2));
    }
  }
  return averages;
}

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; status: number; code: ApiErrorCode; reason: string };

export async function checkReviewRateLimits(params: {
  userId: string;
  companyId: string;
  ipHash: string | null;
}): Promise<RateLimitResult> {
  const now = new Date();
  const toIso = (ms: number) => new Date(now.getTime() - ms).toISOString();
  const windows = {
    sevenDays: toIso(7 * 24 * 60 * 60 * 1000),
    thirtyDays: toIso(30 * 24 * 60 * 60 * 1000),
    oneHour: toIso(60 * 60 * 1000),
    oneDay: toIso(24 * 60 * 60 * 1000),
  };

  const queries = [
    supabaseAdmin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.userId)
      .eq("company_id", params.companyId)
      .gte("created_at", windows.sevenDays),
    supabaseAdmin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.userId)
      .eq("company_id", params.companyId)
      .gte("created_at", windows.thirtyDays),
    supabaseAdmin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.userId)
      .gte("created_at", windows.oneHour),
    supabaseAdmin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", params.userId)
      .gte("created_at", windows.oneDay),
  ];

  const [sevenDays, thirtyDays, oneHour, oneDay] = await Promise.all(queries);

  if ((sevenDays.count ?? 0) >= 1) {
    return { allowed: false, status: 429, code: "RATE_LIMITED", reason: "company_7_days" };
  }
  if ((thirtyDays.count ?? 0) >= 3) {
    return { allowed: false, status: 429, code: "RATE_LIMITED", reason: "company_30_days" };
  }
  if ((oneHour.count ?? 0) >= 2) {
    return { allowed: false, status: 429, code: "RATE_LIMITED", reason: "user_1_hour" };
  }
  if ((oneDay.count ?? 0) >= 5) {
    return { allowed: false, status: 429, code: "RATE_LIMITED", reason: "user_24_hours" };
  }

  if (params.ipHash) {
    const [ipHour, ipDay] = await Promise.all([
      supabaseAdmin
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", params.ipHash)
        .gte("created_at", windows.oneHour),
      supabaseAdmin
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", params.ipHash)
        .gte("created_at", windows.oneDay),
    ]);

    if ((ipHour.count ?? 0) >= 5) {
      return { allowed: false, status: 403, code: "FORBIDDEN", reason: "ip_1_hour" };
    }
    if ((ipDay.count ?? 0) >= 10) {
      return { allowed: false, status: 429, code: "RATE_LIMITED", reason: "ip_24_hours" };
    }
  }

  return { allowed: true };
}
