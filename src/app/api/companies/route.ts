import { NextRequest } from "next/server";
import {
  error,
  getAuthUser,
  json,
  parseNumber,
  slugify,
} from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function normalizeName(value: string) {
  return value.toLowerCase().trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const city = searchParams.get("city");
  const sector = searchParams.get("sector");
  const ratingMin = parseNumber(searchParams.get("rating_min"), 0);
  const page = parseNumber(searchParams.get("page"), 1);
  const pageSize = parseNumber(searchParams.get("page_size"), 20);

  let query = supabaseAdmin
    .from("companies")
    .select(
      "id,name,slug,short_description,city,sector,employee_size_bucket,is_verified,status",
      { count: "exact" }
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (city) {
    query = query.eq("city", city);
  }
  if (sector) {
    query = query.eq("sector", sector);
  }

  const { data, error: queryError, count } = await query;
  if (queryError) {
    return error("INTERNAL_ERROR", "Şirketler alınamadı", 500, queryError.message);
  }

  const companies = data ?? [];
  const companyIds = companies.map((company) => company.id as string);

  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("company_id, rating_overall")
    .in("company_id", companyIds);

  const ratingMap = new Map<string, { sum: number; count: number }>();
  for (const review of reviews ?? []) {
    const key = review.company_id as string;
    if (!ratingMap.has(key)) ratingMap.set(key, { sum: 0, count: 0 });
    const entry = ratingMap.get(key)!;
    if (typeof review.rating_overall === "number") {
      entry.sum += review.rating_overall;
      entry.count += 1;
    }
  }

  const items = companies
    .map((company) => {
      const rating = ratingMap.get(company.id as string);
      const reviewCount = rating?.count ?? 0;
      const avg = reviewCount > 0 ? Number((rating!.sum / reviewCount).toFixed(2)) : null;
      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        short_description: company.short_description,
        city: company.city,
        sector: company.sector,
        employee_size_bucket: company.employee_size_bucket,
        rating_overall_avg: avg,
        review_count: reviewCount,
        is_verified: company.is_verified,
      };
    })
    .filter((company) => (ratingMin ? (company.rating_overall_avg ?? 0) >= ratingMin : true));

  return json({
    items,
    total: count ?? items.length,
    page,
    page_size: pageSize,
  });
}

export async function POST(req: NextRequest) {
  const { user } = await getAuthUser(req);
  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return error("VALIDATION_ERROR", "Geçersiz JSON", 400);
  }

  if (!payload?.name || typeof payload.name !== "string") {
    return error("VALIDATION_ERROR", "Firma adı zorunludur", 400);
  }

  const baseSlug = slugify(payload.name);
  if (!baseSlug) {
    return error("VALIDATION_ERROR", "Geçersiz firma adı", 400);
  }

  let slug = baseSlug;
  const { data: existing } = await supabaseAdmin
    .from("companies")
    .select("id, slug")
    .eq("slug", baseSlug);

  if (existing && existing.length > 0) {
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    slug = `${baseSlug}-${suffix}`;
  }

  const insertPayload = {
    name: payload.name,
    normalized_name: normalizeName(payload.name),
    slug,
    short_description: payload.short_description ?? null,
    city: payload.city ?? null,
    sector: payload.sector ?? null,
    website_domain: payload.website_domain ?? null,
    created_by_role: user ? "user" : "user",
    status: "pending",
  };

  const { data, error: insertError } = await supabaseAdmin
    .from("companies")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError) {
    return error("INTERNAL_ERROR", "Firma oluşturulamadı", 500, insertError.message);
  }

  return json({ status: "pending", company_id: data?.id }, 201);
}
