import { NextRequest } from "next/server";
import {
  buildDistribution,
  error,
  getAuthUser,
  getRequestIp,
  hashIp,
  json,
  parseNumber,
} from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user } = await getAuthUser(req);

  if (!user) {
    return error("UNAUTHORIZED", "Giriş gerekli", 401);
  }

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!company) {
    return error("NOT_FOUND", "Firma bulunamadı", 404);
  }

  const { data: ownSalary } = await supabaseAdmin
    .from("salaries")
    .select("id")
    .eq("company_id", company.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownSalary) {
    return error("GIVE_TO_GET_REQUIRED", "Maaş görmek için maaş girmelisiniz", 403);
  }

  const { data: salaries, error: salaryError } = await supabaseAdmin
    .from("salaries")
    .select("net_monthly_try")
    .eq("company_id", company.id);

  if (salaryError) {
    return error("INTERNAL_ERROR", "Maaşlar alınamadı", 500, salaryError.message);
  }

  const values = (salaries ?? [])
    .map((row) => row.net_monthly_try)
    .filter((value) => typeof value === "number") as number[];

  return json({
    distribution: buildDistribution(values),
    count: values.length,
  });
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

  const requiredFields = ["position", "city", "experience_years", "work_type", "company_size_bucket", "net_monthly_try"];
  for (const field of requiredFields) {
    if (payload?.[field] === undefined || payload?.[field] === null || payload?.[field] === "") {
      return error("VALIDATION_ERROR", `${field} zorunludur`, 400);
    }
  }

  const netMonthly = parseNumber(String(payload.net_monthly_try), 0);
  if (netMonthly <= 0) {
    return error("VALIDATION_ERROR", "Geçersiz maaş değeri", 400);
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

  const { data, error: insertError } = await supabaseAdmin
    .from("salaries")
    .insert({
      company_id: company.id,
      user_id: user.id,
      position: payload.position,
      city: payload.city,
      experience_years: payload.experience_years,
      work_type: payload.work_type,
      company_size_bucket: payload.company_size_bucket,
      net_monthly_try: netMonthly,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (insertError) {
    return error("INTERNAL_ERROR", "Maaş kaydedilemedi", 500, insertError.message);
  }

  return json({ salary_id: data?.id }, 201);
}
