import { NextRequest } from "next/server";
import { error, getAuthUser, json } from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = await getAuthUser(req);

  if (!user) {
    return error("UNAUTHORIZED", "Giriş gerekli", 401);
  }

  const { data: review, error: reviewError } = await supabaseAdmin
    .from("reviews")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (reviewError || !review) {
    return error("NOT_FOUND", "Yorum bulunamadı", 404);
  }

  if (review.user_id !== user.id) {
    return error("FORBIDDEN", "Bu yorumu silemezsiniz", 403);
  }

  const { error: rpcError } = await supabaseAdmin.rpc("move_to_archive_review", {
    p_review_id: id,
    p_deleted_by_role: "user",
    p_delete_reason: "user_deleted",
  });

  if (rpcError) {
    return error("INTERNAL_ERROR", "Yorum silinemedi", 500, rpcError.message);
  }

  return json({ ok: true });
}
