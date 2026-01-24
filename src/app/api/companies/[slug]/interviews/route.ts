import { NextRequest } from "next/server";
import { error, getAuthUser, json } from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!company) {
    return error("NOT_FOUND", "Firma bulunamadı", 404);
  }

  const { data: interviews, error: interviewError } = await supabaseAdmin
    .from("interviews")
    .select("id, stage_data, text, created_at, outcome")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (interviewError) {
    return error("INTERNAL_ERROR", "Mülakatlar alınamadı", 500, interviewError.message);
  }

  return json({ items: interviews ?? [] });
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

  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!company) {
    return error("NOT_FOUND", "Firma bulunamadı", 404);
  }

  if (!payload?.text || typeof payload.text !== "string") {
    return error("VALIDATION_ERROR", "Metin zorunludur", 400);
  }

  const { data, error: insertError } = await supabaseAdmin
    .from("interviews")
    .insert({
      company_id: company.id,
      user_id: user.id,
      stage_data: payload.stage_data ?? null,
      text: payload.text,
      outcome: payload.outcome ?? null,
    })
    .select("id")
    .single();

  if (insertError) {
    return error("INTERNAL_ERROR", "Mülakat kaydedilemedi", 500, insertError.message);
  }

  return json({ interview_id: data?.id }, 201);
}
