import { NextRequest } from "next/server";
import { error, getAuthUser, json, getVoteSummary } from "@/lib/api/utils";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
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

  const voteValue = payload?.vote_value;
  if (voteValue !== 1 && voteValue !== -1) {
    return error("VALIDATION_ERROR", "vote_value 1 veya -1 olmalı", 400);
  }

  const { data: review } = await supabaseAdmin
    .from("reviews")
    .select("id, company_id")
    .eq("id", id)
    .single();

  if (!review) {
    return error("NOT_FOUND", "Yorum bulunamadı", 404);
  }

  const { error: upsertError } = await supabaseAdmin
    .from("votes")
    .upsert(
      {
        review_id: review.id,
        company_id: review.company_id,
        user_id: user.id,
        vote_value: voteValue,
      },
      { onConflict: "review_id,user_id" }
    );

  if (upsertError) {
    return error("INTERNAL_ERROR", "Oy kaydedilemedi", 500, upsertError.message);
  }

  const summaryMap = await getVoteSummary([review.id]);
  const summary = summaryMap.get(review.id) ?? { up: 0, down: 0 };

  return json({ vote_summary: summary });
}
