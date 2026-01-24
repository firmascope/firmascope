import { NextRequest } from "next/server";
import { error, json } from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function isAdmin(req: NextRequest) {
  const headerKey = req.headers.get("x-admin-key") ?? "";
  const authHeader = req.headers.get("authorization") ?? "";
  const bearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const provided = headerKey || bearer;
  const expected = process.env.ADMIN_API_KEY ?? "";
  return Boolean(expected) && provided === expected;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return error("FORBIDDEN", "Yetkisiz", 403);
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "open";

  const { data, error: queryError } = await supabaseAdmin
    .from("reports")
    .select(
      "id, content_type, content_id, company_id, report_reason, report_text, status, created_at, resolved_at, resolution_action, resolution_note"
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (queryError) {
    return error("INTERNAL_ERROR", "Raporlar alınamadı", 500, queryError.message);
  }

  return json({ items: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return error("FORBIDDEN", "Yetkisiz", 403);
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    return error("VALIDATION_ERROR", "Geçersiz JSON", 400);
  }

  const { id, status, resolution_action, resolution_note } = payload ?? {};
  if (!id || !status) {
    return error("VALIDATION_ERROR", "id ve status zorunludur", 400);
  }

  const updatePayload: Record<string, any> = {
    status,
    resolution_action: resolution_action ?? null,
    resolution_note: resolution_note ?? null,
    resolved_by_role: "admin",
  };

  if (status === "resolved") {
    updatePayload.resolved_at = new Date().toISOString();
  }

  const { error: updateError } = await supabaseAdmin
    .from("reports")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return error("INTERNAL_ERROR", "Rapor güncellenemedi", 500, updateError.message);
  }

  return json({ status: "ok" });
}
