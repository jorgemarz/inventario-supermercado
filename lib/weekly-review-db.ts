import { SupabaseClient } from "@supabase/supabase-js";

type WeeklyReviewRow = {
  id: string;
  week_label: string;
};

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = "message" in error ? String(error.message ?? "") : "";
  return message.includes("is_closed") || message.includes("closed_at");
}

export function getCurrentWeekLabel(date = new Date()): string {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = normalized.getUTCDay() || 7;
  normalized.setUTCDate(normalized.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(normalized.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((normalized.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `Semana ${normalized.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export async function getOrCreateCurrentWeekReviewId(supabase: SupabaseClient): Promise<{ reviewId: string; weekLabel: string }> {
  const weekLabel = getCurrentWeekLabel();

  let existing: WeeklyReviewRow | null = null;

  const openReviewQuery = await supabase
    .from("weekly_reviews")
    .select("id, week_label")
    .eq("week_label", weekLabel)
    .eq("is_closed", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<WeeklyReviewRow>();

  if (!openReviewQuery.error) {
    existing = openReviewQuery.data ?? null;
  } else if (isMissingColumnError(openReviewQuery.error)) {
    const fallbackQuery = await supabase
      .from("weekly_reviews")
      .select("id, week_label")
      .eq("week_label", weekLabel)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<WeeklyReviewRow>();

    if (fallbackQuery.error) {
      throw fallbackQuery.error;
    }

    existing = fallbackQuery.data ?? null;
  } else {
    throw openReviewQuery.error;
  }

  if (existing) {
    return { reviewId: existing.id, weekLabel };
  }

  const createWithCloseFields = await supabase
    .from("weekly_reviews")
    .insert({ week_label: weekLabel, is_closed: false })
    .select("id, week_label")
    .single<WeeklyReviewRow>();

  if (!createWithCloseFields.error && createWithCloseFields.data) {
    return { reviewId: createWithCloseFields.data.id, weekLabel };
  }

  if (!isMissingColumnError(createWithCloseFields.error)) {
    throw createWithCloseFields.error ?? new Error("No se pudo crear la revisión semanal.");
  }

  const fallbackCreate = await supabase
    .from("weekly_reviews")
    .insert({ week_label: weekLabel })
    .select("id, week_label")
    .single<WeeklyReviewRow>();

  if (fallbackCreate.error || !fallbackCreate.data) {
    throw fallbackCreate.error ?? new Error("No se pudo crear la revisión semanal.");
  }

  return { reviewId: fallbackCreate.data.id, weekLabel };
}

export async function closeCurrentWeekAndCreateNext(supabase: SupabaseClient): Promise<void> {
  const { reviewId, weekLabel } = await getOrCreateCurrentWeekReviewId(supabase);

  const closeWithFields = await supabase
    .from("weekly_reviews")
    .update({ is_closed: true, closed_at: new Date().toISOString() })
    .eq("id", reviewId);

  if (closeWithFields.error && !isMissingColumnError(closeWithFields.error)) {
    throw closeWithFields.error;
  }

  const createWithCloseFields = await supabase
    .from("weekly_reviews")
    .insert({ week_label: weekLabel, is_closed: false });

  if (!createWithCloseFields.error) {
    return;
  }

  if (!isMissingColumnError(createWithCloseFields.error)) {
    throw createWithCloseFields.error;
  }

  const fallbackCreate = await supabase
    .from("weekly_reviews")
    .insert({ week_label: weekLabel });

  if (fallbackCreate.error) {
    throw fallbackCreate.error;
  }
}
