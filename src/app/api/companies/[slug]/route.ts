import { NextRequest } from "next/server";
import {
  error,
  getAuthUser,
  json,
  toCriteriaAverages,
  buildDistribution,
} from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user } = await getAuthUser(req);

  const { data: company, error: companyError } = await supabaseAdmin
    .from("companies")
    .select(
      "id,name,slug,short_description,city,sector,employee_size_bucket,is_verified,website_domain,created_at,status"
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (companyError || !company) {
    return error("NOT_FOUND", "Firma bulunamadı", 404);
  }

  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select("rating_overall, ratings_json")
    .eq("company_id", company.id);

  const reviewCount = reviews?.length ?? 0;
  const overallAvg = reviewCount
    ? Number(
        (
          (reviews ?? []).reduce((sum, r) => sum + (r.rating_overall ?? 0), 0) /
          reviewCount
        ).toFixed(2)
      )
    : null;

  const criteriaRatings = (reviews ?? [])
    .map((review) => review.ratings_json as Record<string, number>)
    .filter(Boolean);
  const criteriaAvgs = toCriteriaAverages(criteriaRatings);

  const { data: salaries } = await supabaseAdmin
    .from("salaries")
    .select("id, net_monthly_try, user_id")
    .eq("company_id", company.id);

  const salaryCount = salaries?.length ?? 0;
  let salaryDistribution: Record<string, number> | null = null;

  if (user && salaries?.some((salary) => salary.user_id === user.id)) {
    const values = (salaries ?? [])
      .map((salary) => salary.net_monthly_try)
      .filter((value) => typeof value === "number") as number[];
    salaryDistribution = buildDistribution(values);
  }

  const { data: interviews } = await supabaseAdmin
    .from("interviews")
    .select("id")
    .eq("company_id", company.id);

  return json({
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      short_description: company.short_description,
      city: company.city,
      sector: company.sector,
      employee_size_bucket: company.employee_size_bucket,
      is_verified: company.is_verified,
      website_domain: company.website_domain,
      created_at: company.created_at,
    },
    tabs_summary: {
      reviews: {
        count: reviewCount,
        rating_overall_avg: overallAvg,
        criteria_avgs: criteriaAvgs,
      },
      salaries: {
        count: salaryCount,
        distribution: salaryDistribution,
      },
      interviews: {
        count: interviews?.length ?? 0,
      },
    },
  });
}
