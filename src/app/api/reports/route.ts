import { NextRequest } from "next/server";
import { error, getAuthUser, getRequestIp, hashIp, json } from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { user } = await getAuthUser(req);

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return error("VALIDATION_ERROR", "Geçersiz JSON", 400);
  }

  const { content_type, content_id, reason, text } = payload ?? {};
  if (!content_type || !content_id || !reason) {
    return error("VALIDATION_ERROR", "content_type, content_id ve reason zorunludur", 400);
  }

  const ip = getRequestIp(req);
  const ipHash = hashIp(ip);

  const { data, error: insertError } = await supabaseAdmin
    .from("reports")
    .insert({
      content_type,
      content_id,
      report_reason: reason,
      report_text: text ?? null,
      reported_by_user_id: user?.id ?? null,
      ip_hash: ipHash,
      status: "open",
    })
    .select("id")
    .single();

  if (insertError) {
    return error("INTERNAL_ERROR", "Şikayet kaydedilemedi", 500, insertError.message);
  }

  return json({ report_id: data?.id }, 201);
}
